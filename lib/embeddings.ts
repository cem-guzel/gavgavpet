import { pipeline, env } from '@xenova/transformers';
import { prisma } from '@/lib/prisma';
// Modeli her istekte yeniden indirmemesi için cache ayarı
env.cacheDir = '/tmp/.cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function searchKnowledge(query: string, topK: number = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const vectorString = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRaw<{ content: string; category: string; distance: number }[]>`
    SELECT content, category, embedding <=> ${vectorString}::vector AS distance
    FROM "KnowledgeChunk"
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${topK}
  `;

  return results;
}