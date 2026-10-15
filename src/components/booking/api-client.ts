/** Typed fetch for our JSON API routes (browser side). */
export type ApiFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: undefined })
    | { error: { code: string; message: string; fields?: Record<string, string> } }
    | null;

  if (response.ok && payload && !("error" in payload && payload.error)) {
    return { ok: true, data: payload as T };
  }
  const error = payload && "error" in payload && payload.error ? payload.error : null;
  return {
    ok: false,
    status: response.status,
    code: error?.code ?? "unknown_error",
    message: error?.message ?? "Something went wrong. Please try again.",
    fields: error?.fields,
  };
}

/** API field keys may be prefixed ("booking.phone"); form fields are not. */
export function stripFieldPrefix(fields: Record<string, string> | undefined, prefix: string) {
  const out: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields ?? {})) {
    out[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = message;
  }
  return out;
}
