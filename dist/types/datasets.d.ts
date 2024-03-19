import { InputType, OutputType, MetadataType } from './types.js';

interface DatasetItemValue {
    input: InputType;
    output: OutputType;
    metadata: MetadataType;
}
type DatasetId = string;
interface Dataset {
    id: string;
    name: string;
    description?: string;
}
type DatasetItem = DatasetItemValue & {
    id: string;
};
interface CreateDatasetOptions {
    name: string;
    description?: string;
    items: DatasetItemValue[];
}

export type { CreateDatasetOptions, Dataset, DatasetId, DatasetItem, DatasetItemValue };
