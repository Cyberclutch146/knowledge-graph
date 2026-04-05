import { PrismaClient } from '@prisma/client';
import { generateGraphFromText } from './src/lib/ai';

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma...");
  try {
    const graphs = await prisma.graph.findMany({ take: 1 });
    console.log("Prisma Connected!", graphs);
  } catch (e) {
    console.error("Prisma Error:", e);
  }

  console.log("Testing AI...");
  try {
    const aiOutput = await generateGraphFromText("Kubernetes", "strict");
    console.log("AI Connected!", aiOutput.substring(0, 50));
  } catch (e) {
    console.error("AI Error:", e);
  }
}

main().catch(console.error);
