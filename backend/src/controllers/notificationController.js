const prisma = require('../config/prisma');
const {
  syncNotificationsForUser,
  getUnreadCount,
} = require('../services/notificationService');

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

function getAuthenticatedFarmId(req) {
  const possibleIds = [
    req.user?.farmId,
    req.user?.farm?.id,
    req.user?.membership?.farmId,
  ];

  const validId = possibleIds.find((value) => Number.isInteger(Number(value)));

  return validId ? Number(validId) : null;
}

function isAdmin(req) {
  return req.user?.role === 'ADMIN';
}

async function listNotifications(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const farmId = getAuthenticatedFarmId(req);
    const role = isAdmin(req) ? 'ADMIN' : 'EMPLOYEE';

    if (!userId || !farmId) {
      return res.status(403).json({
        message: 'Usuário sem vínculo válido com a fazenda.',
      });
    }

    await syncNotificationsForUser({ userId, farmId, role });

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        farmId,
      },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        task: {
          select: {
            id: true,
            title: true,
            deadline: true,
            status: true,
          },
        },
      },
    });

    const unreadCount = await getUnreadCount({ userId, farmId });

    return res.status(200).json({
      message: 'Notificações carregadas com sucesso.',
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);

    return res.status(500).json({
      message: 'Erro interno ao carregar notificações.',
    });
  }
}

async function markNotificationAsRead(req, res) {
  try {
    const notificationId = Number(req.params.id);
    const userId = getAuthenticatedUserId(req);
    const farmId = getAuthenticatedFarmId(req);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        message: 'ID da notificação inválido.',
      });
    }

    if (!userId || !farmId) {
      return res.status(403).json({
        message: 'Usuário sem vínculo válido com a fazenda.',
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        farmId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notificação não encontrada.',
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: notification.isRead ? notification.readAt : new Date(),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            deadline: true,
            status: true,
          },
        },
      },
    });

    const unreadCount = await getUnreadCount({ userId, farmId });

    return res.status(200).json({
      message: 'Notificação marcada como lida com sucesso.',
      unreadCount,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);

    return res.status(500).json({
      message: 'Erro interno ao marcar notificação como lida.',
    });
  }
}

async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = getAuthenticatedUserId(req);
    const farmId = getAuthenticatedFarmId(req);

    if (!userId || !farmId) {
      return res.status(403).json({
        message: 'Usuário sem vínculo válido com a fazenda.',
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        farmId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Todas as notificações foram marcadas como lidas.',
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);

    return res.status(500).json({
      message: 'Erro interno ao marcar todas as notificações como lidas.',
    });
  }
}

module.exports = {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};