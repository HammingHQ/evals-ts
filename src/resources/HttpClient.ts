import FetchClient from "./FetchClient";

const TOO_MANY_REQUESTS = 429;
const INTERNAL_SERVER_ERROR = 500;

interface HttpClientOptions {
  apiKey: string;
  baseURL: string;
}

/**
 * The HttpClient provides methods to perform HTTP requests.
 * The `fetch` method is used to make a request to a specified endpoint.
 * It includes retry logic for transient errors, where it will retry the request
 * according to the `maxRetries` and `retryDelay` parameters.
 * For non-transient errors, it will fail fast and not retry the request.
 * @param input - The endpoint to which the request will be made.
 * @param init - The request options.
 * @param maxRetries - The maximum number of retries for the request.
 * @param retryDelay - The delay between retries.
 * @returns A promise that resolves to the response of the request, or rejects
 *          with an error if the request fails or all retries are exhausted.
 */
export class HttpClient {
  apiKey: string;
  baseURL: string;
  fetchClient: FetchClient;
  debug: boolean = false;
  retries: number = 3;

  constructor(opts: HttpClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseURL = this.sanitizeBaseUrl(opts.baseURL);
    this.fetchClient = new FetchClient();
    this.debug = process.env.NODE_ENV === "development";
  }

  /**
   * Sanitizes the base URL by trimming whitespace and removing trailing slashes.
   * @param baseURL - The base URL to sanitize.
   * @returns The sanitized base URL.
   */
  private sanitizeBaseUrl(baseURL: string): string {
    return baseURL.trim().replace(/\/$/, "");
  }

  async fetch(
    input: string,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = this.baseURL + input;

    const requestInit = {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": init?.headers?.["Content-Type"] ?? "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
    };

    const isDebug = this.debug;

    if (isDebug) {
      console.debug(
        `\nFetching URL: ${url}` +
          `\nMethod: ${requestInit.method || "GET"}` +
          `${requestInit.body ? `\nBody: ${requestInit.body}` : ""}` +
          `\nHeaders: ${JSON.stringify(requestInit.headers, null, 2)}`,
      );
    }

    const numRetries = this.retries;
    const resp = await this.fetchClient.fetchRetry(url, {
      ...requestInit,
      retryOn: function (attempt, error, response) {
        if (attempt >= numRetries) return false;

        // Retry on too many requests, internal server error, or TypeError
        const status = response?.status;

        return (
          error instanceof TypeError ||
          status === TOO_MANY_REQUESTS ||
          (status !== undefined && status >= INTERNAL_SERVER_ERROR)
        );
      },
      retryDelay: function (attempt, error, response, input) {
        console.warn(
          `Fetch attempt #${attempt}: input=${input}, error=${error?.message}, response status=${response?.status}, response status text=${response?.statusText}`,
        );
        return Math.pow(2, attempt) * 1000;
      },
    });

    if (isDebug) {
      console.debug(`Response for ${url}: ${resp.status} ${resp.statusText}\n`);
    }

    return resp;
  }
}
