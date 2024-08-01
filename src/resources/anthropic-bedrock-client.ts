import type { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";
import type {
  Message,
  RawMessageStreamEvent,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import type { Stream } from "@anthropic-ai/sdk/streaming.mjs";
import { Hamming } from "../client";
import { PromptTemplate } from "../prompt-template";
import { PromptWithContent } from "../types";
import { createMessageParams } from "./anthropic";

class AnthropicBedrockClient {
  private anthropic?: AnthropicBedrock;

  constructor(private readonly client: Hamming) {}

  async load(): Promise<AnthropicBedrock> {
    if (this.anthropic) {
      return this.anthropic;
    }
    if (!this.client.bedrock) {
      // We're relying on ~/.aws/credentials or AWS_SECRET_ACCESS_KEY and AWS_ACCESS_KEY_ID env vars
      console.log(
        "Anthropic Bedrock config is not set. Using environment credentials.",
      );
    }
    const module = await import("@anthropic-ai/bedrock-sdk");
    this.anthropic = new module.AnthropicBedrock({
      awsSecretKey: this.client.bedrock?.awsSecretKey,
      awsAccessKey: this.client.bedrock?.awsAccessKey,
      awsRegion: this.client.bedrock?.awsRegion,
      awsSessionToken: this.client.bedrock?.awsSessionToken,
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

export default AnthropicBedrockClient;
