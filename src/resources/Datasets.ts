import type { Hamming } from "../index";
import {
  CreateDatasetOptions,
  Dataset,
  DatasetId,
  DatasetItem,
} from "../types/datasets";

type DatasetWithItems = Dataset & { items: DatasetItem[] };

export class Datasets {
  private client: Hamming;

  constructor(client: Hamming) {
    this.client = client;
  }

  async load(id: DatasetId): Promise<DatasetWithItems> {
    const resp = await this.client.fetch(`/datasets/${id}`, {
      method: "GET",
    });

    let data: { dataset: DatasetWithItems };
    try {
      data = await resp.json();
    } catch (error) {
      throw new Error(
        `Failed to parse dataset response as JSON for dataset ID: ${id}: ${error}`,
      );
    }
    return data.dataset as DatasetWithItems;
  }

  async list(): Promise<Dataset[]> {
    const resp = await this.client.fetch(`/datasets`);
    const data = await resp.json();
    return data.datasets as Dataset[];
  }

  async create(opts: CreateDatasetOptions): Promise<DatasetWithItems> {
    const { name, description, items } = opts;
    const resp = await this.client.fetch("/datasets", {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        items,
      }),
    });
    const data = await resp.json();
    return data.dataset as DatasetWithItems;
  }
}
