const prisma = require('../config/prisma');

function getAuthenticatedFarmId(req) {
  const possibleIds = [
    req.user?.farmId,
    req.user?.farm?.id,
    req.user?.membership?.farmId,
  ];

  const validId = possibleIds.find((value) => Number.isInteger(Number(value)));

  return validId ? Number(validId) : null;
}

function formatDateTime(date) {
  if (!date) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

async function getCurrentFarm(req, res) {
  try {
    const farmId = getAuthenticatedFarmId(req);

    if (!farmId) {
      return res.status(403).json({
        message: 'Usuário sem fazenda vinculada.',
      });
    }

    const farm = await prisma.farm.findUnique({
      where: {
        id: farmId,
      },
      include: {
        members: {
          orderBy: [
            { role: 'asc' },
            { createdAt: 'asc' },
          ],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    if (!farm) {
      return res.status(404).json({
        message: 'Fazenda não encontrada.',
      });
    }

    return res.status(200).json({
      message: 'Dados da fazenda carregados com sucesso.',
      farm: {
        id: farm.id,
        name: farm.name,
        segment: farm.segment,
        inviteCode: farm.inviteCode,
        createdAt: formatDateTime(farm.createdAt),
        updatedAt: formatDateTime(farm.updatedAt),
        totalMembers: farm._count.members,
        totalTasks: farm._count.tasks,
      },
      members: farm.members.map((member) => ({
        id: member.id,
        role: member.role,
        status: member.status,
        createdAt: formatDateTime(member.createdAt),
        updatedAt: formatDateTime(member.updatedAt),
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          status: member.user.status,
        },
      })),
    });
  } catch (error) {
    console.error('Erro ao carregar dados da fazenda:', error);

    return res.status(500).json({
      message: 'Erro interno ao carregar dados da fazenda.',
    });
  }
}

async function updateMemberStatus(req, res) {
  try {
    const farmId = getAuthenticatedFarmId(req);
    const memberId = Number(req.params.memberId);
    const normalizedStatus = String(req.body.status || '').trim().toUpperCase();

    if (!farmId) {
      return res.status(403).json({
        message: 'Usuário sem fazenda vinculada.',
      });
    }

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return res.status(400).json({
        message: 'ID do membro inválido.',
      });
    }

    if (!['ACTIVE', 'INACTIVE'].includes(normalizedStatus)) {
      return res.status(400).json({
        message: 'Status inválido. Use ACTIVE ou INACTIVE.',
      });
    }

    const member = await prisma.farmMember.findFirst({
      where: {
        id: memberId,
        farmId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return res.status(404).json({
        message: 'Membro não encontrado.',
      });
    }

    if (member.role === 'ADMIN' && normalizedStatus === 'INACTIVE') {
      const activeAdmins = await prisma.farmMember.count({
        where: {
          farmId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdmins <= 1 && member.status === 'ACTIVE') {
        return res.status(400).json({
          message: 'A fazenda precisa manter pelo menos um administrador ativo.',
        });
      }
    }

    const updatedMember = await prisma.farmMember.update({
      where: {
        id: member.id,
      },
      data: {
        status: normalizedStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Status do membro atualizado com sucesso.',
      member: {
        id: updatedMember.id,
        role: updatedMember.role,
        status: updatedMember.status,
        updatedAt: formatDateTime(updatedMember.updatedAt),
        user: {
          id: updatedMember.user.id,
          name: updatedMember.user.name,
          email: updatedMember.user.email,
          status: updatedMember.user.status,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar status do membro:', error);

    return res.status(500).json({
      message: 'Erro interno ao atualizar status do membro.',
    });
  }
}

module.exports = {
  getCurrentFarm,
  updateMemberStatus,
};