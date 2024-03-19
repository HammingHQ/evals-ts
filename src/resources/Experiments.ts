import type { Hamming } from "../index";
import { DatasetId, DatasetItem } from "../types/datasets";
import {
  Experiment,
  ExperimentItem,
  ExperimentItemContext,
  ExperimentStatus,
  Runner,
  RunOptions,
} from "../types/experiments";
import { TracingMode } from "../types/tracing";
import {
  DefaultScoreTypes,
  MetadataType,
  OutputType,
  ScoreType,
} from "../types/types";
import { runWorkers } from "../utils/worker";

class ExperimentItems {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async start(
    experiment: Experiment,
    datasetItem: DatasetItem,
  ): Promise<ExperimentItemContext> {
    const resp = await this.client.fetch(
      `/experiments/${experiment.id}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          datasetItemId: datasetItem.id,
          output: {},
          metrics: {},
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
    this.client.tracing._setMode(TracingMode.EXPERIMENT);

    const { dataset: datasetId } = opts;
    const dataset = await this.client.datasets.load(datasetId);

    const {
      name = this.generateName(dataset.name),
      scoring = DefaultScoreTypes,
      metadata = {},
    } = opts;

    const experiment = await this.start(name, datasetId, scoring, metadata);
    const baseUrl = new URL(this.client.baseURL);
    const experimentUrl = `${baseUrl.origin}/experiments/${experiment.id}`;

    try {
      if (opts.parallel) {
        const runFn = async (item: DatasetItem) => {
          const itemContext = await this.items.start(experiment, item);
          const output = await run(item.input);
          await this.items.end(itemContext, output);
        };
        const workerCount =
          typeof opts.parallel === "number" ? opts.parallel : undefined;
        await runWorkers(dataset.items, runFn, workerCount);
      } else {
        for (const datasetItem of dataset.items) {
          const itemContext = await this.items.start(experiment, datasetItem);
          const output = await run(datasetItem.input);
          await this.items.end(itemContext, output);
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
