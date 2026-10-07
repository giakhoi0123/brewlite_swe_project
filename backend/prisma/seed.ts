import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { sampleProducts } from './seed-products';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('BrewLite123!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@brewlite.coffee' },
    update: { name: 'Demo Barista', passwordHash },
    create: { email: 'demo@brewlite.coffee', name: 'Demo Barista', passwordHash },
  });

  // Insert only: re-running seed must not restock products or overwrite edited prices.
  await prisma.product.createMany({ data: sampleProducts, skipDuplicates: true });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
