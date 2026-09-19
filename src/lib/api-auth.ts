// Autenticação da API REST (`/api/v1/*`), usada pelo app Expo.
//
// A web autentica por cookie de sessão do Auth.js. Um app nativo não tem
// cookie de navegador, então emitimos um token assinado que ele guarda no
// SecureStore e envia em `Authorization: Bearer <token>`.
//
// O token é um HMAC-SHA256 sobre um payload JSON, usando o mesmo AUTH_SECRET
// do Auth.js. Sem dependência nova: `node:crypto` já vem no runtime Node.

import { createHmac, timingSafeEqual } from "node:crypto";

import { auth } from "@/lib/auth";

/** Validade padrão do token do app, em dias. */
const DEFAULT_TTL_DAYS = 30;

interface TokenPayload {
  /** id da usuária */
  sub: string;
  /** emitido em (epoch ms) */
  iat: number;
  /** expira em (epoch ms) */
  exp: number;
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error(
      "AUTH_SECRET não definido — necessário para assinar os tokens da API.",
    );
  }
  return value;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(data: string): string {
  return b64url(createHmac("sha256", secret()).update(data).digest());
}

/** Emite um token para a usuária. Guardado pelo app no SecureStore. */
export function signApiToken(
  userId: string,
  ttlDays: number = DEFAULT_TTL_DAYS,
): string {
  const now = Date.now();
  const payload: TokenPayload = {
    sub: userId,
    iat: now,
    exp: now + ttlDays * 24 * 60 * 60 * 1000,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/**
 * Verifica assinatura e validade. Retorna o id da usuária ou null.
 * A comparação da assinatura é feita em tempo constante.
 */
export function verifyApiToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString()) as TokenPayload;
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/**
 * Resolve a usuária da requisição.
 *
 * 1. `Authorization: Bearer <token>` — o caminho do app.
 * 2. Cookie de sessão do Auth.js — deixa a mesma rota utilizável pela web
 *    (útil para testar no navegador, já logada).
 *
 * Retorna null quando não há credencial válida.
 */
export async function resolveApiUser(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyApiToken(header.slice(7).trim());
  }

  const session = await auth();
  return session?.user?.id ?? null;
}

/** Resposta padrão de 401. */
export function unauthorized() {
  return Response.json({ error: "Não autorizado." }, { status: 401 });
}

/** Resposta padrão de 400 a partir de um erro do Zod. */
export function badRequest(message: string, fieldErrors?: unknown) {
  return Response.json({ error: message, fieldErrors }, { status: 400 });
}

/**
 * Resposta ao preflight CORS.
 *
 * Requisição com `Content-Type: application/json` não é "simples", então o
 * navegador manda um OPTIONS antes. O Next não responde OPTIONS sozinho, e
 * sem isto a versão web do app não consegue chamar a API.
 *
 * Os cabeçalhos de CORS em si vêm do `headers()` do next.config.ts, e só em
 * desenvolvimento. No celular nada disso é usado — app nativo não faz CORS.
 */
export function corsPreflight() {
  return new Response(null, { status: 204 });
}
