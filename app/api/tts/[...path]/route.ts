import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const BACKEND_URL = (process.env.TTS_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");
const FRONTEND_KEY_ID = process.env.FRONTEND_KEY_ID || "tts-frontend";
const FRONTEND_PRIVATE_KEY_PEM = process.env.FRONTEND_PRIVATE_KEY_PEM || "";

function getPrivateKey() {
  if (!FRONTEND_PRIVATE_KEY_PEM) return null;
  const pem = FRONTEND_PRIVATE_KEY_PEM.replace(/\\n/g, "\n");
  return crypto.createPrivateKey(pem);
}

function buildSignature(method: string, path: string, timestamp: string, nonce: string, body: ArrayBuffer) {
  const bodyHash = crypto.createHash("sha256").update(new Uint8Array(body)).digest("hex");
  const payload = `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
  const privateKey = getPrivateKey();
  if (!privateKey) {
    throw new Error("FRONTEND_PRIVATE_KEY_PEM no configurado en frontend");
  }
  const signature = crypto.sign(null, Buffer.from(payload, "utf-8"), privateKey);
  return signature.toString("base64");
}

async function signedFetch(path: string, init: {
  method: string;
  body?: ArrayBuffer;
  contentType?: string | null;
  userId?: string | null;
  turnstileToken?: string | null;
}) {
  try {
    getPrivateKey();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "FRONTEND_PRIVATE_KEY_PEM inválido" }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const body = init.body ?? new ArrayBuffer(0);
  let signature: string;
  try {
    signature = buildSignature(init.method, path, timestamp, nonce, body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error firmando solicitud" }, { status: 500 });
  }

  const headers: Record<string, string> = {
    "X-Frontend-Key-Id": FRONTEND_KEY_ID,
    "X-Frontend-Timestamp": timestamp,
    "X-Frontend-Nonce": nonce,
    "X-Frontend-Signature": signature,
  };

  if (init.contentType) headers["Content-Type"] = init.contentType;
  if (init.userId) headers["X-User-Id"] = init.userId;
  if (init.turnstileToken) headers["X-Turnstile-Token"] = init.turnstileToken;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: init.method,
    headers,
    body: ["GET", "HEAD"].includes(init.method) ? undefined : body,
    cache: "no-store",
  });

  return response;
}

async function waitJobResult(statusUrl: string, resultUrl: string, common: {
  userId?: string | null;
  turnstileToken?: string | null;
}) {
  const start = Date.now();
  const timeoutMs = 20 * 60 * 1000;

  while (Date.now() - start < timeoutMs) {
    const statusRes = await signedFetch(statusUrl, {
      method: "GET",
      userId: common.userId,
    });

    const statusData = await statusRes.json();
    if (!statusRes.ok) {
      return NextResponse.json(statusData, { status: statusRes.status });
    }

    if (statusData.status === "completed") {
      const resultRes = await signedFetch(resultUrl, {
        method: "GET",
        userId: common.userId,
      });
      if (!resultRes.ok) {
        let errData: unknown;
        try {
          errData = await resultRes.json();
        } catch {
          errData = { error: "Error obteniendo resultado del job" };
        }
        return NextResponse.json(errData as object, { status: resultRes.status });
      }

      const audio = Buffer.from(await resultRes.arrayBuffer());
      return new NextResponse(audio, {
        status: 200,
        headers: {
          "Content-Type": resultRes.headers.get("content-type") || "audio/wav",
          "Cache-Control": "no-store",
        },
      });
    }

    if (statusData.status === "failed") {
      return NextResponse.json({ error: statusData.error || "Job fallido" }, { status: 409 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  return NextResponse.json({ error: "Timeout esperando resultado del job" }, { status: 504 });
}

async function handleProxy(req: NextRequest, params: { path?: string[] }) {
  const method = req.method.toUpperCase();
  const targetPath = `/${(params.path || []).join("/")}`;
  const search = req.nextUrl.search || "";
  const finalPath = `${targetPath}${search}`;

  const userId = req.headers.get("X-User-Id");
  const turnstileToken = req.headers.get("X-Turnstile-Token");

  let rawBody: ArrayBuffer = new ArrayBuffer(0);
  const hasBody = !["GET", "HEAD"].includes(method);
  let contentType: string | null = null;
  if (hasBody) {
    rawBody = await req.arrayBuffer();
    contentType = req.headers.get("content-type");
  }

  const backendResponse = await signedFetch(finalPath, {
    method,
    body: rawBody,
    contentType,
    userId,
    turnstileToken,
  });

  if (["/clone", "/voices"].some((prefix) => targetPath.startsWith(prefix)) && backendResponse.status === 202) {
    const payload = await backendResponse.json();
    if (payload?.status_url && payload?.result_url) {
      return waitJobResult(payload.status_url, payload.result_url, { userId, turnstileToken });
    }
  }

  const contentTypeRes = backendResponse.headers.get("content-type") || "application/json";
  const bodyBuffer = Buffer.from(await backendResponse.arrayBuffer());

  return new NextResponse(bodyBuffer, {
    status: backendResponse.status,
    headers: {
      "Content-Type": contentTypeRes,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, await context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, await context.params);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, await context.params);
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}
