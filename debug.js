// debug.js
const { PrismaClient } = require('@prisma/client');

console.log('1. Iniciando script de debug...');

try {
  console.log('2. Tentando instanciar PrismaClient puro...');
  const prisma = new PrismaClient();
  console.log('3. Instância criada com SUCESSO!');
  
  console.log('4. Tentando conectar...');
  prisma.$connect().then(() => {
    console.log('5. Conexão realizada com sucesso!');
    prisma.$disconnect();
  }).catch(err => {
    console.error('ERRO NA CONEXÃO:', err);
  });

} catch (e) {
  console.error('!!! FALHA FATAL NA INSTANCIAÇÃO !!!');
  console.error(e);
}