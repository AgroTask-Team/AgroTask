const prisma = require('../config/prisma');

function isFinal(task) {
  return task?.status === 'COMPLETED' &&
    (!task.completionRequiresApproval || task.completionReviewStatus === 'APPROVED');
}

function nextWeeklyDeadline(deadline, now = new Date()) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const original = deadline.getTime();
  const weeks = Math.max(1, Math.floor((now.getTime() - original) / week) + 1);
  return new Date(original + weeks * week);
}

async function saveTaskAndSchedule(writeTask, actorId, previousTask = null) {
  return prisma.$transaction(async (tx) => {
    const task = await writeTask(tx);
    if (!task.repeatWeekly || !isFinal(task) || isFinal(previousTask)) {
      return task;
    }

    // A gravação acima bloqueia a linha da origem até o fim da transação.
    const successor = await tx.task.findUnique({
      where: { previousOccurrenceId: task.id },
      select: { id: true },
    });
    if (successor) return task;

    const member = await tx.farmMember.findFirst({
      where: {
        farmId: task.farmId,
        userId: task.responsibleId,
        status: 'ACTIVE',
        user: { status: 'ACTIVE' },
      },
      select: { id: true },
    });
    if (!member) {
      const error = new Error('O responsável pela rotina está inativo. Edite a tarefa e escolha um membro ativo antes de concluir.');
      error.code = 'WEEKLY_RESPONSIBLE_INACTIVE';
      throw error;
    }

    const next = await tx.task.create({
      data: {
        previousOccurrenceId: task.id,
        repeatWeekly: true,
        farmId: task.farmId,
        responsibleId: task.responsibleId,
        title: task.title,
        description: task.description,
        area: task.area,
        priority: task.priority,
        deadline: nextWeeklyDeadline(task.deadline),
        status: 'PENDING',
        completionRequiresApproval: task.completionRequiresApproval,
        requirePhotoEvidence: task.requirePhotoEvidence,
        requireNoteEvidence: task.requireNoteEvidence,
        requireLocationEvidence: task.requireLocationEvidence,
      },
    });
    await tx.history.create({
      data: {
        taskId: next.id,
        userId: actorId,
        action: `Tarefa semanal criada automaticamente a partir da tarefa #${task.id}`,
      },
    });
    await tx.notification.create({
      data: {
        userId: next.responsibleId,
        farmId: next.farmId,
        taskId: next.id,
        type: 'TASK_ASSIGNED',
        title: 'Nova tarefa atribuída',
        message: `Você recebeu a tarefa semanal "${next.title}".`,
      },
    });
    return task;
  });
}

module.exports = { saveTaskAndSchedule };
