import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('BrewLite123!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@brewlite.coffee' },
    update: { name: 'Demo Barista', passwordHash },
    create: { email: 'demo@brewlite.coffee', name: 'Demo Barista', passwordHash },
  });
}

main().finally(() => prisma.$disconnect());
