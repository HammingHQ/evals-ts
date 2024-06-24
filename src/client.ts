import { HttpClient } from "./httpClient";
import { Logger } from "./logger";
import { Datasets } from "./resources/datasets";
import { Experiments } from "./resources/experiments";
import { Monitoring } from "./resources/monitoring";
import { Tracing } from "./resources/tracing";
import { Prompts } from "./resources/prompts";
import { ClientOptions } from "./types";

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
  }

  experiments = new Experiments(this);
  datasets = new Datasets(this);
  tracing = new Tracing(this);
  monitoring = new Monitoring(this);
  prompts = new Prompts(this);

  _logger = new Logger(this);
}
