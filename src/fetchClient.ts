type RequestDelayFunction = (
  attempt: number,
  error: Error | null,
  response: Response | null,
  input?: string | Request,
) => number;

type RequestRetryOnFunction = (
  attempt: number,
  error: Error | null,
  response: Response | null,
) => boolean | Promise<boolean>;

export interface RequestInitRetryParams {
  retries?: number;
  retryDelay?: number | RequestDelayFunction;
  retryOn?: number[] | RequestRetryOnFunction;
}

export type RequestInitWithRetry = RequestInit & RequestInitRetryParams;

class FetchClient {
  private retries: number;
  private retryDelay: number | RequestDelayFunction;
  private retryOn: number[] | RequestRetryOnFunction;

  constructor(defaults?: RequestInitRetryParams) {
    const baseDefaults: RequestInitRetryParams = {
      retries: 3,
      retryDelay: 1000,
      retryOn: [],
    };

    const finalDefaults = { ...baseDefaults, ...defaults };

    this.validateDefaults(finalDefaults);

    this.retries = finalDefaults.retries!;
    this.retryDelay = finalDefaults.retryDelay!;
    this.retryOn = finalDefaults.retryOn!;
  }

  private validateDefaults(defaults: RequestInitRetryParams): void {
    if (
      defaults.retries !== undefined &&
      !this.isPositiveInteger(defaults.retries)
    ) {
      throw new ArgumentError("retries must be a positive integer");
    }

    if (
      defaults.retryDelay !== undefined &&
      !this.isPositiveInteger(defaults.retryDelay) &&
      typeof defaults.retryDelay !== "function"
    ) {
      throw new ArgumentError(
        "retryDelay must be a positive integer or a function returning a positive integer",
      );
    }

    if (
      defaults.retryOn !== undefined &&
      !Array.isArray(defaults.retryOn) &&
      typeof defaults.retryOn !== "function"
    ) {
      throw new ArgumentError("retryOn property expects an array or function");
    }
  }

  private isPositiveInteger(value: any): value is number {
    return Number.isInteger(value) && value >= 0;
  }

  public fetchRetry(
    input: RequestInfo,
    init?: RequestInitWithRetry,
  ): Promise<Response> {
    let retries = this.retries;
    let retryDelay = this.retryDelay;
    let retryOn = this.retryOn;

    if (init) {
      if (init.retries !== undefined && this.isPositiveInteger(init.retries)) {
        retries = init.retries;
      }

      if (init.retryDelay !== undefined) {
        if (
          this.isPositiveInteger(init.retryDelay) ||
          typeof init.retryDelay === "function"
        ) {
          retryDelay = init.retryDelay;
        }
      }

      if (init.retryOn) {
        if (Array.isArray(init.retryOn) || typeof init.retryOn === "function") {
          retryOn = init.retryOn;
        }
      }
    }

    return new Promise((resolve, reject) => {
      const wrappedFetch = (attempt: number) => {
        const _input = input instanceof Request ? input.clone() : input;
        fetch(_input, init)
          .then((response) => {
            if (Array.isArray(retryOn) && !retryOn.includes(response.status)) {
              resolve(response);
            } else if (typeof retryOn === "function") {
              Promise.resolve(retryOn(attempt, null, response))
                .then((retryOnResponse) => {
                  if (retryOnResponse) {
                    retry(attempt, null, response);
                  } else {
                    resolve(response);
                  }
                })
                .catch(reject);
            } else {
              if (attempt < retries) {
                retry(attempt, null, response);
              } else {
                resolve(response);
              }
            }
          })
          .catch((error) => {
            if (typeof retryOn === "function") {
              Promise.resolve(retryOn(attempt, error, null))
                .then((retryOnResponse) => {
                  if (retryOnResponse) {
                    retry(attempt, error, null);
                  } else {
                    reject(error);
                  }
                })
                .catch(reject);
            } else if (attempt < retries) {
              retry(attempt, error, null);
            } else {
              reject(error);
            }
          });
      };

      const retry = (
        attempt: number,
        error: Error | null,
        response: Response | null,
      ) => {
        const delay =
          typeof retryDelay === "function"
            ? retryDelay(attempt, error, response, input)
            : retryDelay;
        setTimeout(() => {
          wrappedFetch(++attempt);
        }, delay);
      };

      wrappedFetch(0);
    });
  }
}

class ArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArgumentError";
  }
}

export default FetchClient;
