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
    return await client.chat.completions.create({
      ...params,
      stream: false,
    });
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
