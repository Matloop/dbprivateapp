// test-prisma.ts
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Tentando conectar...");
  await prisma.$connect();
  console.log("Conectado com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());