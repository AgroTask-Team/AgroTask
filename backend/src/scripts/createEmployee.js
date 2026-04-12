const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function createEmployee() {
  try {
    const email = 'employee@agrotask.com';
    const plainPassword = '123456';

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log('Já existe um usuário EMPLOYEE com esse email.');
      console.log(`Email: ${existingUser.email}`);
      return;
    }

    const farm = await prisma.farm.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        name: true,
        segment: true,
        inviteCode: true,
      },
    });

    if (!farm) {
      console.log('Nenhuma fazenda encontrada.');
      console.log('Crie primeiro uma fazenda/admin ou execute o script createAdmin.js.');
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: 'Funcionário Teste',
          email,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      const membership = await tx.farmMember.create({
        data: {
          userId: user.id,
          farmId: farm.id,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
        },
      });

      return { user, membership };
    });

    console.log('Usuário EMPLOYEE criado com sucesso.');
    console.log({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      status: result.user.status,
      role: result.membership.role,
      farm: farm.name,
      inviteCode: farm.inviteCode,
    });
    console.log('Login para teste:');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${plainPassword}`);
  } catch (error) {
    console.error('Erro ao criar usuário EMPLOYEE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployee();