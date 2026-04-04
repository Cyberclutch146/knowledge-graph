import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

let prisma;
try {
  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error("PrismaClient Init FAILED", error);
  process.exit(1);
}

async function main() {
  try {
    await prisma.$connect();
    console.log("DB SUCCESSFULLY CONNECTED");
  } catch (error) {
    fs.writeFileSync('db_error_out.json', JSON.stringify({ message: error.message, stack: error.stack, clientVersion: error.clientVersion, errorCode: error.errorCode }, null, 2));
    console.error("DB FAILED. Written to db_error_out.json");
  } finally {
    await prisma.$disconnect();
  }
}

main();
