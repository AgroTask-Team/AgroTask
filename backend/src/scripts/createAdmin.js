const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function createAdmin() {
  try {
    const email = 'admin@agrotask.com';
    const plainPassword = '123456';
    const inviteCode = 'AGRODEMO';

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Usuário admin já existe.');
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      let farm = await tx.farm.findUnique({
        where: {
          inviteCode,
        },
      });

      if (!farm) {
        farm = await tx.farm.create({
          data: {
            name: 'Fazenda Demo AgroTask',
            segment: 'Pecuária',
            inviteCode,
          },
        });
      }

      const user = await tx.user.create({
        data: {
          name: 'Administrador AgroTask',
          email,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      const membership = await tx.farmMember.create({
        data: {
          userId: user.id,
          farmId: farm.id,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      return { user, farm, membership };
    });

    console.log('Usuário admin criado com sucesso.');
    console.log({
      id: result.user.id,
      email: result.user.email,
      senha_temporaria: plainPassword,
      farm: result.farm.name,
      inviteCode: result.farm.inviteCode,
      role: result.membership.role,
    });
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();