import { NextRequest } from 'next/server';
import { SecurityError } from '@/lib/security/errors';

export const AI_GUARDRAILS = {
  maxBodyBytes: Number(process.env.AI_MAX_BODY_BYTES || '100000'),
  maxMessages: Number(process.env.AI_MAX_MESSAGES || '40'),
  maxMessageChars: Number(process.env.AI_MAX_MESSAGE_CHARS || '4000'),
  maxInputTokens: Number(process.env.AI_MAX_INPUT_TOKENS || '8000'),
  maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || '2048'),
  requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || '30000'),
};

export async function parseJsonWithLimit<T>(
  request: NextRequest,
  maxBytes: number
): Promise<T> {
  const raw = await request.text();
  const byteLength = Buffer.byteLength(raw, 'utf8');

  if (byteLength > maxBytes) {
    throw new SecurityError(413, 'payload_too_large', 'Request body too large');
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new SecurityError(400, 'invalid_json', 'Invalid JSON payload');
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function enforceMessageLimits(
  messages: Array<{ role: string; content: string }>,
  limits = AI_GUARDRAILS
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new SecurityError(400, 'invalid_messages', 'Messages are required');
  }

  if (messages.length > limits.maxMessages) {
    throw new SecurityError(413, 'too_many_messages', 'Too many messages');
  }

  let totalChars = 0;
  for (const message of messages) {
    if (typeof message?.content !== 'string') {
      throw new SecurityError(400, 'invalid_messages', 'Message content must be text');
    }
    if (message.content.length > limits.maxMessageChars) {
      throw new SecurityError(413, 'message_too_large', 'Message too large');
    }
    totalChars += message.content.length;
  }

  const estimatedTokens = Math.ceil(totalChars / 4);
  if (estimatedTokens > limits.maxInputTokens) {
    throw new SecurityError(413, 'input_too_large', 'Input exceeds token limit');
  }
}

export function createAbortController(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}
