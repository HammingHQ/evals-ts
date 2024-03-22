import { DatasetId } from "./datasets";
import { ITracing } from "./tracing";
import type { InputType, MetadataType, OutputType, ScoreType } from "./types";

export enum ExperimentStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  SCORING = "SCORING",
  SCORING_FAILED = "SCORING_FAILED",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export interface Experiment {
  id: string;
  name: string;
  description?: string | null;
  datasetId: number;
  datasetVersionId?: number;
  status: ExperimentStatus;
}

export interface ExperimentContext {
  experiment: {
    itemId?: string;
  };
}

export interface ExperimentItemMetrics {
  durationMs?: number;
}

export interface ExperimentItem {
  id: string;
  experimentId: string;
  datasetItemId: string;
  output: OutputType;
  metrics: ExperimentItemMetrics;
}

export interface ExperimentItemContext {
  item: ExperimentItem;
  startTs: number;
}

export type RunContext = {
  tracing: ITracing;
};

export type Runner = (input: InputType, ctx: RunContext) => Promise<OutputType>;

export interface RunOptions {
  dataset: DatasetId;
  name?: string;
  scoring?: ScoreType[];
  metadata?: MetadataType;
  parallel?: boolean | number;
}
