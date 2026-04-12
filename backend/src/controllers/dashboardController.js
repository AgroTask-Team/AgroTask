const prisma = require('../config/prisma');

function formatDate(date) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

function mapPriority(priority) {
  const priorities = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
  };

  return priorities[priority] || priority;
}

function mapStatus(status) {
  const statuses = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluída',
    LATE: 'Atrasada',
  };

  return statuses[status] || status;
}

function buildSubtitle(task) {
  const responsibleName = task.responsible?.name || 'Sem responsável';
  const area = task.area || 'Sem área informada';

  return `${responsibleName} · ${area}`;
}

function getAuthenticatedFarmId(req) {
  const possibleIds = [
    req.user?.farmId,
    req.user?.farm?.id,
    req.user?.membership?.farmId,
  ];

  const validId = possibleIds.find((value) => Number.isInteger(Number(value)));

  return validId ? Number(validId) : null;
}

function getAuthenticatedUserId(req) {
  const possibleIds = [
    req.user?.id,
    req.user?.userId,
    req.user?.sub,
    req.user?.user?.id,
  ];

  const validId = possibleIds.find((value) => Number.isInteger(Number(value)));

  return validId ? Number(validId) : null;
}

function isAdmin(req) {
  return req.user?.role === 'ADMIN';
}

function getStartOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getEndOfDay(date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function addDays(date, amount) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function getStartOfWeek(date) {
  const value = getStartOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function buildWeeklyBuckets(totalWeeks = 6) {
  const currentWeekStart = getStartOfWeek(new Date());
  const buckets = [];

  for (let index = totalWeeks - 1; index >= 0; index -= 1) {
    const start = addDays(currentWeekStart, -index * 7);
    const end = getEndOfDay(addDays(start, 6));

    buckets.push({
      label: `Sem ${totalWeeks - index}`,
      start,
      end,
    });
  }

  return buckets;
}

function isDateInsideRange(date, start, end) {
  if (!date) {
    return false;
  }

  const value = new Date(date).getTime();
  return value >= start.getTime() && value <= end.getTime();
}

function buildProductivityData(tasks) {
  const buckets = buildWeeklyBuckets(6);

  const createdSeries = buckets.map((bucket) => {
    return tasks.filter((task) =>
      isDateInsideRange(task.createdAt, bucket.start, bucket.end)
    ).length;
  });

  const completedSeries = buckets.map((bucket) => {
    return tasks.filter((task) => {
      if (task.status !== 'COMPLETED') {
        return false;
      }

      return isDateInsideRange(task.updatedAt, bucket.start, bucket.end);
    }).length;
  });

  const maxValue = Math.max(...createdSeries, ...completedSeries, 0);

  return {
    labels: buckets.map((bucket) => bucket.label),
    createdSeries,
    completedSeries,
    maxValue,
  };
}

async function getSummary(req, res) {
  try {
    const farmId = getAuthenticatedFarmId(req);
    const userId = getAuthenticatedUserId(req);

    if (!farmId) {
      return res.status(403).json({
        message: 'Usuário sem fazenda vinculada.',
      });
    }

    const baseWhere = {
      farmId,
    };

    if (!isAdmin(req) && userId) {
      baseWhere.responsibleId = userId;
    }

    const totalTasks = await prisma.task.count({
      where: baseWhere,
    });

    const pendingTasks = await prisma.task.count({
      where: {
        ...baseWhere,
        status: 'PENDING',
      },
    });

    const inProgressTasks = await prisma.task.count({
      where: {
        ...baseWhere,
        status: 'IN_PROGRESS',
      },
    });

    const completedTasks = await prisma.task.count({
      where: {
        ...baseWhere,
        status: 'COMPLETED',
      },
    });

    const lateTasks = await prisma.task.count({
      where: {
        ...baseWhere,
        status: 'LATE',
      },
    });

    const recentTasksRaw = await prisma.task.findMany({
      where: baseWhere,
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const weeklyBuckets = buildWeeklyBuckets(6);
    const oldestBucketStart = weeklyBuckets[0].start;

    const productivityTasks = await prisma.task.findMany({
      where: {
        ...baseWhere,
        OR: [
          {
            createdAt: {
              gte: oldestBucketStart,
            },
          },
          {
            updatedAt: {
              gte: oldestBucketStart,
            },
          },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recentTasks = recentTasksRaw.map((task) => ({
      id: task.id,
      title: task.title,
      subtitle: buildSubtitle(task),
      priority: mapPriority(task.priority),
      priorityKey: task.priority,
      status: mapStatus(task.status),
      statusKey: task.status,
      date: formatDate(task.deadline),
    }));

    const productivity = buildProductivityData(productivityTasks);

    return res.status(200).json({
      message: 'Resumo do dashboard carregado com sucesso.',
      summary: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        lateTasks,
        completionRate,
      },
      productivity,
      recentTasks,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      farm: {
        id: req.user.farm?.id || req.user.farmId || null,
        name: req.user.farm?.name || null,
        segment: req.user.farm?.segment || null,
        inviteCode: req.user.farm?.inviteCode || null,
      },
    });
  } catch (error) {
    console.error('Erro ao carregar resumo do dashboard:', error);

    return res.status(500).json({
      message: 'Erro interno ao carregar dashboard.',
    });
  }
}

module.exports = {
  getSummary,
};