import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.TTS_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

async function simpleFetch(path: string, init: {
  method: string;
  body?: ArrayBuffer;
  contentType?: string | null;
  userId?: string | null;
  turnstileToken?: string | null;
}) {
  const headers: Record<string, string> = {};

  if (init.contentType) headers["Content-Type"] = init.contentType;
  if (init.userId) headers["X-User-Id"] = init.userId;
  if (init.turnstileToken) headers["X-Turnstile-Token"] = init.turnstileToken;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: init.method,
    headers,
    body: ["GET", "HEAD"].includes(init.method) ? undefined : init.body,
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
    const statusRes = await simpleFetch(statusUrl, {
      method: "GET",
      userId: common.userId,
    });

    const statusData = await statusRes.json();
    if (!statusRes.ok) {
      return NextResponse.json(statusData, { status: statusRes.status });
    }

    if (statusData.status === "completed") {
      const resultRes = await simpleFetch(resultUrl, {
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

  const backendResponse = await simpleFetch(finalPath, {
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
