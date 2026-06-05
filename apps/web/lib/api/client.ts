export type ApiHttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export interface ApiClientErrorPayload {
  readonly message: string;
  readonly code?: string;
  readonly details?: unknown;
}

export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly fetcher?: typeof fetch;
  readonly getToken?: () => Promise<string | null | undefined> | string | null | undefined;
  readonly onError?: (error: ApiClientError) => void;
}

export interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, "body" | "headers" | "method"> {
  readonly body?: TBody;
  readonly headers?: HeadersInit;
  readonly method?: ApiHttpMethod;
  readonly token?: string | null;
}

export interface ApiResult<TData> {
  readonly data: TData | null;
  readonly error: ApiClientError | null;
  readonly ok: boolean;
}

type BackendErrorBody = {
  readonly message?: string | string[];
  readonly error?: string;
  readonly code?: string;
  readonly details?: unknown;
};

const DEFAULT_API_BASE_URL = "http://localhost:4000";
const toastedApiErrors = new WeakSet<ApiClientError>();

export class ApiClientError extends Error {
  readonly code?: string;
  readonly details?: unknown;
  readonly status: number;

  constructor(status: number, payload: ApiClientErrorPayload) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL);
  const fetcher = options.fetcher ?? fetch;

  async function request<TData, TBody = unknown>(
    path: string,
    requestOptions: ApiRequestOptions<TBody> = {}
  ): Promise<TData> {
    const response = await fetcher(buildUrl(baseUrl, path), {
      ...requestOptions,
      body: serializeBody(requestOptions.body),
      headers: await buildHeaders(requestOptions),
      method: requestOptions.method ?? (requestOptions.body === undefined ? "GET" : "POST")
    });

    if (!response.ok) {
      const error = await toApiClientError(response);
      options.onError?.(error);
      throw error;
    }

    return parseResponse<TData>(response);
  }

  async function requestResult<TData, TBody = unknown>(
    path: string,
    requestOptions: ApiRequestOptions<TBody> = {}
  ): Promise<ApiResult<TData>> {
    try {
      return {
        data: await request<TData, TBody>(path, requestOptions),
        error: null,
        ok: true
      };
    } catch (error) {
      const apiError = normalizeError(error);

      return {
        data: null,
        error: apiError,
        ok: false
      };
    }
  }

  async function buildHeaders<TBody>(requestOptions: ApiRequestOptions<TBody>): Promise<Headers> {
    const headers = new Headers(requestOptions.headers);
    const token = requestOptions.token ?? (await options.getToken?.());

    if (shouldSerializeAsJson(requestOptions.body) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  return {
    request,
    requestResult
  };
}

export const apiClient = createApiClient();

export function normalizeError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiClientError(0, { message: error.message });
  }

  return new ApiClientError(0, { message: "Unexpected request failure" });
}

export function hasApiErrorToastBeenShown(error: ApiClientError): boolean {
  return toastedApiErrors.has(error);
}

export function markApiErrorToastShown(error: ApiClientError): void {
  toastedApiErrors.add(error);
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(baseUrl: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (typeof body === "string" || isNativeBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

function shouldSerializeAsJson(body: unknown): body is Record<string, unknown> {
  return isPlainObject(body);
}

function isNativeBody(body: unknown): body is BodyInit {
  return body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

async function parseResponse<TData>(response: Response): Promise<TData> {
  if (response.status === 204) {
    return null as TData;
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as TData;
  }

  return (await response.text()) as TData;
}

async function toApiClientError(response: Response): Promise<ApiClientError> {
  const payload = await readErrorPayload(response);

  return new ApiClientError(response.status, {
    code: payload.code,
    details: payload.details,
    message: payload.message
  });
}

async function readErrorPayload(response: Response): Promise<ApiClientErrorPayload> {
  const fallbackMessage = response.statusText || "Request failed";
  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return { message: text || fallbackMessage };
  }

  const body = (await response.json().catch(() => null)) as BackendErrorBody | null;
  const message = formatBackendMessage(body?.message ?? body?.error ?? fallbackMessage);

  return {
    code: body?.code,
    details: body?.details,
    message
  };
}

function formatBackendMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}
