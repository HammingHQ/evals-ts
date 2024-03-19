import { AsyncLogger } from "./resources/AsyncLogger";
import { Datasets } from "./resources/Datasets";
import { Experiments } from "./resources/Experiments";
import { HttpClient } from "./resources/HttpClient";
import { Monitoring } from "./resources/Monitoring";
import { Tracing } from "./resources/Tracing";

export { ScoreType } from "./types/types";

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
}

const CLIENT_OPTIONS_KEYS: (keyof ClientOptions)[] = ["apiKey", "baseURL"];

export class Hamming extends HttpClient {
  constructor(config: ClientOptions) {
    const unexpectedConfigKeys = Object.keys(config).filter(
      (key) => !CLIENT_OPTIONS_KEYS.includes(key as keyof ClientOptions),
    );

    if (unexpectedConfigKeys.length > 0) {
      console.warn(
        `WARNING: Unexpected config keys found: ${unexpectedConfigKeys.join(
          ", ",
        )}. Valid config keys are: ${CLIENT_OPTIONS_KEYS.join(
          ", ",
        )}. The unexpected keys will be ignored.`,
      );
    }

    super({
      apiKey: config.apiKey,
      baseURL: config.baseURL ?? "https://app.hamming.ai/api/rest",
    });

    this._logger.start();
  }

  experiments = new Experiments(this);
  datasets = new Datasets(this);
  tracing = new Tracing(this);
  monitoring = new Monitoring(this);

  _logger = new AsyncLogger(this);
}
