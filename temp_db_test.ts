import { prisma } from "./src/lib/db";

async function main() {
  try {
    const count = await prisma.graph.count();
    console.log("Successfully connected to the database!");
    console.log("Graph count:", count);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
