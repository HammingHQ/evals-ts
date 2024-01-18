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
declare class HttpClient {
    apiKey: string;
    baseURL: string;
    constructor(opts: HttpClientOptions);
    /**
     * Sanitizes the base URL by trimming whitespace and removing trailing slashes.
     * @param baseURL - The base URL to sanitize.
     * @returns The sanitized base URL.
     */
    private sanitizeBaseUrl;
    fetch(input: string, init?: RequestInit | undefined, maxRetries?: number, retryDelay?: number): Promise<Response>;
    private nonTransientError;
    private delay;
    private shouldRetry;
    private isNetworkError;
    private generateErrorMessage;
    private attemptFetch;
    private createHeaders;
    /**
     * If the 'Retry-After' header is present in the response, it indicates how long
     * the client should wait before making a new request.
     *
     * If not, we use the retryDelay parameter to determine how long to wait.
     */
    private waitForRetry;
    private calculateRetryDelayForHeaders;
}

export { HttpClient };
