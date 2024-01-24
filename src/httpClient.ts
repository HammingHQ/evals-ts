import FetchClient from "./fetchClient";

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

    const finalInit = {
      ...init,
      headers: { authorization: `Bearer ${this.apiKey}` },
    };

    const resp = await this.fetchClient.fetchRetry(url, {
      ...finalInit,
      retryOn: function (attempt, error, response) {
        // Retry on too many requests, internal server error, or TypeError
        const status = response?.status;

        return (
          error instanceof TypeError ||
          status === TOO_MANY_REQUESTS ||
          (status !== undefined && status >= INTERNAL_SERVER_ERROR)
        );
      },
      retryDelay: function (attempt, error, response, input) {
        if (this.debug) {
          console.log(
            `Attempt input: ${input}, #${attempt}, error=${error}, response=${response}`,
          );
        }
        return Math.pow(2, attempt) * 1000;
      },
    });

    return resp;
  }
}
