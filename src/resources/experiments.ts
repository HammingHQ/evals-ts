import { asyncRunContext } from "../asyncStorage";
import type { Hamming } from "../client";
import {
  DatasetId,
  DatasetItem,
  Experiment,
  ExperimentItem,
  ExperimentItemContext,
  ExperimentStatus,
  MetadataType,
  OutputType,
  RunContext,
  RunOptions,
  Runner,
  ScoreType,
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

  async end(itemContext: ExperimentItemContext, output: OutputType) {
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

    const experiment = await this.start(
      name,
      datasetId,
      scoring,
      metadata,
      sampling,
    );
    const baseUrl = new URL(this.client.baseURL);
    const experimentUrl = `${baseUrl.origin}/experiments/${experiment.id}`;

    try {
      for (let sampleId = 0; sampleId < sampleCount; sampleId++) {
        if (opts.parallel) {
          const runFn = async (item: DatasetItem) => {
            const itemCtx = await this.items.start(experiment, item, sampleId);
            const output = await asyncRunContext.run(
              newRunContext(itemCtx.item.id),
              async () => run(item.input),
            );
            await this.items.end(itemCtx, output);
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
            await this.items.end(itemCtx, output);
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
    scoring: ScoreType[],
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
