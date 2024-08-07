import type { Anthropic } from "@anthropic-ai/sdk";
import type {
  Message,
  RawMessageStreamEvent,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import type { Stream } from "@anthropic-ai/sdk/streaming.mjs";
import { Hamming } from "../client";
import { PromptTemplate } from "../prompt-template";
import { PromptWithContent } from "../types";
import { createMessageParams } from "./anthropic";

class AnthropicClient {
  private anthropic?: Anthropic;

  constructor(private readonly client: Hamming) {}

  async load(): Promise<Anthropic> {
    if (this.anthropic) {
      return this.anthropic;
    }
    if (!this.client.anthropicApiKey) {
      throw new Error("Anthropic API key is not set");
    }
    const module = await import("@anthropic-ai/sdk");
    this.anthropic = new module.Anthropic({
      apiKey: this.client.anthropicApiKey,
    });
    return this.anthropic;
  }

  async createMessage(
    prompt: PromptWithContent,
    variables?: Record<string, string>,
  ): Promise<Message> {
    if (!prompt.content) {
      throw new Error("Prompt content is not set");
    }
    const template = new PromptTemplate(prompt.content);
    const content = template.compile(variables || {});

    const client = await this.load();
    const params = createMessageParams(content);

    return client.messages.create({
      ...params,
      stream: false,
    });
  }

  async createMessageStream(
    prompt: PromptWithContent,
    variables?: Record<string, string>,
  ): Promise<Stream<RawMessageStreamEvent>> {
    if (!prompt.content) {
      throw new Error("Prompt content is not set");
    }
    const template = new PromptTemplate(prompt.content);
    const content = template.compile(variables || {});

    const client = await this.load();
    const params = createMessageParams(content);

    return client.messages.create({
      ...params,
      stream: true,
    });
  }
}

export default AnthropicClient;
