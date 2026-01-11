import { createEmbeddingProvider } from '@/lib/spine/embeddingProvider';

const DEFAULT_DIMENSIONS = 1536;

export function getKbccEmbeddingProvider() {
  const provider = process.env.KBCC_EMBEDDING_PROVIDER
    ? createEmbeddingProvider({ provider: process.env.KBCC_EMBEDDING_PROVIDER as 'openai' | 'ollama' | 'mock' })
    : createEmbeddingProvider({ provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock' });

  if (provider.dimensions !== DEFAULT_DIMENSIONS) {
    throw new Error(`KBCC embedding dimension mismatch (${provider.dimensions}); expected ${DEFAULT_DIMENSIONS}.`);
  }

  return provider;
}
