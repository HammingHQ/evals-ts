const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const TOO_MANY_REQUESTS = 429;
const INTERNAL_SERVER_ERROR = 500;
const BAD_GATEWAY = 502;
const SERVICE_UNAVAILABLE = 503;
const GATEWAY_TIMEOUT = 504;

interface HttpClientOptions {
  apiKey: string;
  baseURL: string;
}

const DEFAULT_RETRY_DELAY = 1000;

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

  constructor(opts: HttpClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseURL = this.sanitizeBaseUrl(opts.baseURL);
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
    maxRetries: number = 3, // default to 3 retries
    retryDelay: number = DEFAULT_RETRY_DELAY, // default to 1 second delay
  ): Promise<Response> {
    const url = this.baseURL + input;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.attemptFetch(url, init);

        // Check for OK response
        if (response.ok) return response;

        // If not ok, then generate an error message
        const errorMessage = this.generateErrorMessage(response, url);
        lastError = new Error(errorMessage);

        // Fail fast for non-transient errors
        if (this.nonTransientError(response)) break;

        // Retry logic for transient errors
        if (this.shouldRetry(response)) {
          await this.handleRetry(response, retryDelay);
        } else {
          // For other errors, throw an error
          throw new Error(errorMessage);
        }
      } catch (error) {
        lastError = error as Error;

        // Fail fast for a non-transient error
        if (!this.isNetworkError(error)) break;
        await this.delay(retryDelay);
      }
    }
    throw lastError;
  }

  private nonTransientError(response: Response): boolean {
    return [UNAUTHORIZED, FORBIDDEN, NOT_FOUND].includes(response.status);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(response: Response): boolean {
    return (
      response.status === TOO_MANY_REQUESTS ||
      response.status >= INTERNAL_SERVER_ERROR
    );
  }

  // Network error check
  private isNetworkError(error: any): boolean {
    return error instanceof TypeError;
  }

  // This could be redundant if we sent the correct error message from the server
  private generateErrorMessage(response: Response, url: string) {
    const status = response.status;
    const statusText = response.statusText;

    let errorMessage = `Request failed with status ${status} ${statusText} while accessing ${url}.`;

    if (status === UNAUTHORIZED) {
      errorMessage = `UNAUTHORIZED: Invalid API key ending in '${this.apiKey.slice(
        -4,
      )}'. Visit https://app.hamming.ai/settings to see valid API keys.`;
    } else if (status === FORBIDDEN) {
      errorMessage = `FORBIDDEN: You do not have permission to access ${url}.`;
    } else if (status === NOT_FOUND) {
      errorMessage = `NOT FOUND: The requested resource at ${url} could not be found.`;
    } else if (status === TOO_MANY_REQUESTS) {
      errorMessage = `TOO MANY REQUESTS: You are being rate limited. Please wait before making additional requests. If the issue persists, feel free to email us at founders@hamming.ai for help.`;
    } else if (status >= 500) {
      errorMessage = `SERVER ERROR: There was a problem with the server while accessing ${url}. If the issue persists, feel free to email us at founders@hamming.ai for help.`;
    }
    return errorMessage;
  }

  private async attemptFetch(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const headers = this.createHeaders(init?.headers);
    const response = await fetch(url, { ...init, headers });
    return response;
  }

  private createHeaders(existingHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      ...existingHeaders,
      authorization: `Bearer ${this.apiKey}`,
    };
    if (!existingHeaders || !("content-type" in existingHeaders)) {
      headers["content-type"] = "application/json";
    }
    return headers;
  }

  /**
   * If the 'Retry-After' header is present in the response, it indicates how long
   * the client should wait before making a new request.
   *
   * If not, we use the retryDelay parameter to determine how long to wait.
   */
  private async handleRetry(
    response: Response,
    retryDelay: number,
  ): Promise<void> {
    const retryAfter = response.headers.get("Retry-After");
    const retryDelayMs = retryAfter
      ? this.calculateRetryDelayForHeaders(retryAfter, retryDelay)
      : retryDelay;
    await this.delay(retryDelayMs);
  }

  private calculateRetryDelayForHeaders(
    retryAfter: string,
    retryDelay: number,
  ): number {
    if (parseInt(retryAfter, 10)) {
      return parseInt(retryAfter, 10) * 1000;
    }
    // If Retry-After is an HTTP-date, calculate delay until that date
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return date.getTime() - Date.now();
    }
    return retryDelay;
  }
}
