type RequestDelayFunction = (attempt: number, error: Error | null, response: Response | null, input?: string | Request) => number;
type RequestRetryOnFunction = (attempt: number, error: Error | null, response: Response | null) => boolean | Promise<boolean>;
interface RequestInitRetryParams {
    retries?: number;
    retryDelay?: number | RequestDelayFunction;
    retryOn?: number[] | RequestRetryOnFunction;
}
type RequestInitWithRetry = RequestInit & RequestInitRetryParams;
declare class FetchClient {
    private retries;
    private retryDelay;
    private retryOn;
    constructor(defaults?: RequestInitRetryParams);
    private validateDefaults;
    private isPositiveInteger;
    fetchRetry(input: RequestInfo, init?: RequestInitWithRetry): Promise<Response>;
}

export { type RequestInitRetryParams, type RequestInitWithRetry, FetchClient as default };
