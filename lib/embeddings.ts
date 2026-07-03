import { pipeline, env } from '@xenova/transformers';
import { prisma } from '@/lib/prisma';
// Modeli her istekte yeniden indirmemesi için cache ayarı
env.cacheDir = '/tmp/.cache';
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

// Node.js ortamında native binary yerine web/wasm gibi davranmasını sağla
env.backends.onnx.wasm.simd = true;

env.cacheDir = '/tmp/.cache';
env.allowLocalModels = false;

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