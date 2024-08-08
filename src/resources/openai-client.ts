import type OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import type { Stream } from "openai/streaming.mjs";

import { Hamming } from "../client";
import { PromptTemplate } from "../prompt-template";
import {
  ChatMessage,
  PromptContent,
  PromptWithContent,
  ToolChoice,
} from "../types";

export class OpenAIClient {
  private openai?: OpenAI;

  constructor(private readonly client: Hamming) {}

  async load(): Promise<OpenAI> {
    if (this.openai) {
      return this.openai;
    }
    if (!this.client.openaiApiKey) {
      throw new Error(
        "OpenAI API key not set. Initialize the Hamming client with an OpenAI API key.",
      );
    }
    const module = await import("openai");
    this.openai = new module.OpenAI({
      apiKey: this.client.openaiApiKey,
    });
    return this.openai;
  }

  async createChatCompletion(
    prompt: PromptWithContent,
    variables?: Record<string, string>,
  ): Promise<ChatCompletion> {
    if (!prompt.content) {
      throw new Error("Prompt content not set");
    }

    const template = new PromptTemplate(prompt.content);
    const content = template.compile(variables || {});

    const client = await this.load();
    const params = createChatCompletionParams(content);

    const completion = await client.chat.completions.create({
      ...params,
      stream: false,
    });

    await this._log(content, completion, params, prompt.slug);

    return completion;
  }

  async createChatCompletionStream(
    prompt: PromptWithContent,
    variables?: Record<string, string>,
  ): Promise<Stream<ChatCompletionChunk>> {
    if (!prompt.content) {
      throw new Error("Prompt content not set");
    }
    const template = new PromptTemplate(prompt.content);
    const content = template.compile(variables || {});

    const client = await this.load();
    const params = createChatCompletionParams(content);

    return await client.chat.completions.create({
      ...params,
      stream: true,
    });
  }

  private async _log(
    content: PromptContent,
    completion: ChatCompletion,
    params: ChatCompletionCreateParamsBase,
    slug: string,
  ) {
    const item = await this.client.monitoring.startItem();

    item.setInput(content);
    item.setOutput(completion);

    item.setMetadata({
      sdk: true,
      prompt_slug: slug,
      top_p: params.top_p,
      model: params.model,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
      frequency_penalty: params.frequency_penalty,
      presence_penalty: params.presence_penalty,
      tool_choice: params.tool_choice,
      prompt_tokens_usage: completion.usage?.prompt_tokens,
      completion_tokens_usage: completion.usage?.completion_tokens,
      total_tokens_usage: completion.usage?.total_tokens,
    });

    item.tracing.logGeneration({
      input: JSON.stringify(content.chatMessages),
      output: JSON.stringify(completion),
      metadata: {
        provider: "openai",
        model: params.model,
        temperature: params.temperature || undefined,
        max_tokens: params.max_tokens || undefined,
        n: params.n || undefined,
        seed: params.seed || undefined,
        usage: completion.usage,
      },
    });

    item.end();
  }
}

function createChatCompletionParams(
  content: PromptContent,
): ChatCompletionCreateParamsBase {
  return {
    model: content.languageModel,
    messages: content.chatMessages.map((m) => convertChatMessage(m)),
    temperature: content.promptSettings.temperature,
    max_tokens: content.promptSettings.maxTokens,
    top_p: content.promptSettings.topP,
    frequency_penalty: content.promptSettings.frequencyPenalty,
    presence_penalty: content.promptSettings.presencePenalty,
    tool_choice:
      content.promptSettings.toolChoice && content.tools
        ? convertToolChoice(content.promptSettings.toolChoice)
        : undefined,
    tools: content.tools ? JSON.parse(content.tools) : undefined,
  };
}

function convertChatMessage(message: ChatMessage): ChatCompletionMessageParam {
  switch (message.role) {
    case "system":
      return { role: "system", content: message.content };
    case "user":
      return { role: "user", content: message.content };
    case "assistant":
      return { role: "assistant", content: message.content };
    default:
      throw new Error(`Unsupported message role: ${message.role}`);
  }
}

function convertToolChoice(
  toolChoice: ToolChoice,
): ChatCompletionToolChoiceOption {
  switch (toolChoice.choice) {
    case "none":
      return "none";
    case "auto":
      return "auto";
    case "function":
      return {
        type: "function",
        function: {
          name: toolChoice.functionName,
        },
      };
    default:
      throw new Error(`Unsupported tool choice: ${toolChoice.choice}`);
  }
}

export default OpenAIClient;
