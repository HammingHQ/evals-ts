import type { InputType, MetadataType, OutputType } from "./types";

export interface DatasetItemValue {
  input: InputType;
  output: OutputType;
  metadata: MetadataType;
}

export type DatasetId = string;

export interface Dataset {
  id: string;
  name: string;
  description?: string;
}

export type DatasetItem = DatasetItemValue & { id: string };

export interface CreateDatasetOptions {
  name: string;
  description?: string;
  items: DatasetItemValue[];
}
