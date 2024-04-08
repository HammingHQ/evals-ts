import { asyncRunContext } from "../asyncStorage";
import type { Hamming } from "../client";
import {
  CustomScoringConfig,
  DatasetId,
  DatasetItem,
  Experiment,
  ExperimentItem,
  ExperimentItemContext,
  ExperimentStatus,
  InputType,
  LocalScorer,
  MetadataType,
  OutputType,
  RunContext,
  Runner,
  RunOptions,
  Score,
  ScoreType,
  ScoringFunction,
  TracingMode,
} from "../types";
import { runWorkers } from "../worker";

const MAX_SAMPLES = 10;

function newRunContext(itemId: string): RunContext {
  return {
    tracing: {
      experiment: {
        itemId,
      },
    },
  };
}

const defaultScoreTypes = [ScoreType.StringDiff];

interface RegisteredScoringFunction extends ScoringFunction {
  registration: CustomScoringConfig;
}

class ExperimentItems {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async start(
    experiment: Experiment,
    datasetItem: DatasetItem,
    sampleId?: number,
  ): Promise<ExperimentItemContext> {
    const resp = await this.client.fetch(
      `/experiments/${experiment.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          datasetItemId: datasetItem.id,
          output: {},
          metrics: {},
          sampleId,
        }),
      },
    );
    const data = await resp.json();
    const item = data.item as ExperimentItem;

    const startTs = Date.now();
    return {
      item,
      startTs,
    };
  }

  async end(
    itemContext: ExperimentItemContext,
    output: OutputType,
    scores: Record<string, Score> = {},
  ) {
    const { item, startTs } = itemContext;
    const durationMs = Date.now() - startTs;
    await this.client.tracing._flush(item.id);
    // Completing the experiment item should happen after the traces are
    // flushed, since it will automatically trigger scoring.
    await this.client.fetch(
      `/experiments/${item.experimentId}/items/${item.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          output,
          scores,
          metrics: {
            durationMs,
          },
        }),
      },
    );
  }
}

export class Experiments {
  private client: Hamming;
  private items: ExperimentItems;

  constructor(client: Hamming) {
    this.client = client;
    this.items = new ExperimentItems(this.client);
  }

  async run(opts: RunOptions, run: Runner) {
    const { dataset: datasetId } = opts;
    const dataset = await this.client.datasets.load(datasetId);

    this.client.tracing._setMode(TracingMode.EXPERIMENT);

    const {
      name = this.generateName(dataset.name),
      scoring = defaultScoreTypes,
      metadata = {},
      sampling,
    } = opts;

    const sampleCount = sampling ?? 1;
    if (sampleCount > MAX_SAMPLES) {
      throw new Error(`The maximum number of samples is ${MAX_SAMPLES}.`);
    }

    const scoringHelper = new ScoringHelper(this.client, scoring);
    await scoringHelper.initialize();

    const experiment = await this.start(
      name,
      datasetId,
      scoringHelper.getConfig(),
      metadata,
      sampling,
    );
    const baseUrl = new URL(this.client.baseURL);
    const experimentUrl = `${baseUrl.origin}/experiments/${experiment.id}`;

    try {
      for (let sampleId = 0; sampleId < sampleCount; sampleId++) {
        if (opts.parallel) {
          const runFn = async (datasetItem: DatasetItem) => {
            const itemCtx = await this.items.start(
              experiment,
              datasetItem,
              sampleId,
            );
            const output = await asyncRunContext.run(
              newRunContext(itemCtx.item.id),
              async () => run(datasetItem.input),
            );
            const scores = await scoringHelper.score(
              datasetItem.input,
              datasetItem.output,
              output,
            );
            await this.items.end(itemCtx, output, scores);
          };
          const workerCount =
            typeof opts.parallel === "number" ? opts.parallel : undefined;
          await runWorkers(dataset.items, runFn, workerCount);
        } else {
          for (const datasetItem of dataset.items) {
            const itemCtx = await this.items.start(
              experiment,
              datasetItem,
              sampleId,
            );
            const output = await asyncRunContext.run(
              newRunContext(itemCtx.item.id),
              async () => await run(datasetItem.input),
            );
            const scores = await scoringHelper.score(
              datasetItem.input,
              datasetItem.output,
              output,
            );
            await this.items.end(itemCtx, output, scores);
          }
        }
      }
    } catch (err) {
      await this.end(experiment, ExperimentStatus.FAILED);
      throw err;
    } finally {
      await this.end(experiment);
      console.log("See experiment results at:", experimentUrl);
    }
    return { experimentUrl };
  }

  private async start(
    name: string,
    dataset: DatasetId,
    scoring: (ScoreType | CustomScoringConfig)[],
    metadata: MetadataType,
    sampling?: number,
  ): Promise<Experiment> {
    const status = ExperimentStatus.RUNNING;
    const resp = await this.client.fetch(`/experiments`, {
      method: "POST",
      body: JSON.stringify({
        name,
        dataset,
        status,
        scoring,
        metadata,
        sampling,
      }),
    });

    const data = await resp.json();
    return data.experiment as Experiment;
  }

  private async end(
    experiment: Experiment,
    status: ExperimentStatus = ExperimentStatus.FINISHED,
  ) {
    await this.client.fetch(`/experiments/${experiment.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    });
  }

  private generateName(datasetName: string): string {
    const now = new Date();
    return `Experiment for ${datasetName} - ${now.toLocaleString()}`;
  }
}

class ScoringHelper {
  private readonly client: Hamming;

  public readonly standardScoring: ScoreType[];
  public readonly customScoring: ScoringFunction[];

  private registeredFunctions: RegisteredScoringFunction[] = [];
  private initialized = false;

  constructor(client: Hamming, scoring: (ScoringFunction | ScoreType)[]) {
    this.client = client;

    this.standardScoring = scoring.filter(
      (score): score is ScoreType => typeof score === "string",
    );
    this.customScoring = scoring.filter(
      (score): score is ScoringFunction => typeof score !== "string",
    );
  }

  async initialize() {
    await this.registerScoringFunctions();
    this.initialized = true;
  }

  getConfig(): (ScoreType | CustomScoringConfig)[] {
    if (!this.initialized) {
      throw new Error("ScoringHelper is not initialized");
    }
    return [
      ...this.standardScoring,
      ...this.registeredFunctions.map((f) => f.registration),
    ];
  }

  async score(
    input: InputType,
    expected: OutputType,
    output: OutputType,
  ): Promise<Record<string, Score>> {
    if (!this.initialized) {
      throw new Error("ScoringHelper is not initialized");
    }
    const scores = {} as Record<string, Score>;
    const promises = this.registeredFunctions
      .filter((f) => f.scorer.type === "local")
      .map(async (f) => {
        const scorer = f.scorer as LocalScorer;
        const score = await scorer.scoreFn({ input, output, expected });
        scores[f.registration.key_name] = score;
      });
    await Promise.allSettled(promises);
    return scores;
  }

  private async registerScoringFunctions() {
    const scoring = this.customScoring.map((scoringFunc) => ({
      name: scoringFunc.name,
      version: scoringFunc.version,
      score_config: scoringFunc.scoreConfig,
      execution_config: {},
    }));
    const resp = await this.client.fetch(`/scoring/register-functions`, {
      method: "POST",
      body: JSON.stringify({
        scoring: scoring,
      }),
    });

    const data = await resp.json();
    const registrations = (data.scoring ?? []) as CustomScoringConfig[];
    this.registeredFunctions = this.customScoring.map(
      (scoringFunction, idx) => ({
        ...scoringFunction,
        registration: registrations[idx],
      }),
    );
  }
}
