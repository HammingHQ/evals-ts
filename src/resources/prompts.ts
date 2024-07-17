import type { Hamming } from "../client";
import { Prompt, PromptWithContent } from "../types";

interface ListPromptsResponse {
  prompts: Prompt[];
}

interface GetPromptResponse {
  prompt: PromptWithContent;
}

export class Prompts {
  constructor(private readonly client: Hamming) {}

  async list(label?: string): Promise<Prompt[]> {
    let url = "/prompts";
    if (label) {
      url += `?label=${label}`;
    }
    const resp = await this.client.fetch(url);
    const prompts = (await resp.json()) as ListPromptsResponse;
    return prompts.prompts;
  }

  async get(
    slug: string,
    label?: string,
    version?: string,
  ): Promise<PromptWithContent> {
    let url = `/prompts/${slug}`;
    if (label) {
      url += `?label=${label}`;
    }
    if (version) {
      url += `&version=${version}`;
    }
    const resp = await this.client.fetch(url);
    const prompt = (await resp.json()) as GetPromptResponse;
    return prompt.prompt;
  }
}
