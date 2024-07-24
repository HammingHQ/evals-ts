import type { Anthropic } from "@anthropic-ai/sdk";
import type {
  Message,
  MessageCreateParams,
  MessageCreateParamsNonStreaming,
  MessageParam,
  RawMessageStreamEvent,
  Tool,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import type { Stream } from "@anthropic-ai/sdk/streaming.mjs";
import { Hamming } from "../client";
import { PromptTemplate } from "../prompt-template";
import {
  ChatMessage,
  PromptContent,
  PromptWithContent,
  ToolChoice,
} from "../types";

export const DEFAULT_ANTHROPIC_MAX_TOKENS = 4096;

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

function createMessageParams(
  content: PromptContent,
): MessageCreateParamsNonStreaming {
  const systemMessage = content.chatMessages.find(
    (message) => message.role === "system",
  );
  const messages = content.chatMessages.filter(
    (message) => message.role !== "system",
  );
  return {
    model: content.languageModel,
    system: systemMessage?.content,
    messages: messages.map(convertChatMessage),
    max_tokens:
      content.promptSettings.maxTokens ?? DEFAULT_ANTHROPIC_MAX_TOKENS,
    top_p: content.promptSettings.topP,
    temperature: content.promptSettings.temperature,
    tools: content.tools ? (JSON.parse(content.tools) as Tool[]) : undefined,
    tool_choice: content.promptSettings.toolChoice
      ? convertAnthropicToolChoice(content.promptSettings.toolChoice)
      : undefined,
  };
}

function convertChatMessage(message: ChatMessage): MessageParam {
  switch (message.role) {
    case "user":
      return {
        role: "user",
        content: message.content,
      };
    case "assistant":
      return {
        role: "assistant",
        content: message.content,
      };
    default:
      throw new Error(`Unsupported role: ${message.role}`);
  }
}

function convertAnthropicToolChoice(
  input: ToolChoice,
):
  | MessageCreateParams.ToolChoiceAuto
  | MessageCreateParams.ToolChoiceAny
  | MessageCreateParams.ToolChoiceTool {
  switch (input.choice) {
    case "auto":
      return { type: "auto" };
    case "any":
      return { type: "any" };
    case "tool":
      return { type: "tool", name: input.functionName ?? "" };
    default:
      throw new Error("Invalid tool choice type");
  }
}

export default AnthropicClient;
