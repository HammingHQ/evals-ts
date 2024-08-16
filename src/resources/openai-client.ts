import type OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Stream } from "openai/streaming.mjs";

import { Hamming } from "../client";
import { PromptTemplate } from "../prompt-template";
import {
  ChatMessage,
  GenerationMetadata,
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

    const completion = await this.client.monitoring.runItem(async (item) => {
      item.setInput(params);
      item.setMetadata({
        sdk: {
          type: "openai_prompt",
          stream: false,
          prompt: {
            slug: prompt.slug,
          },
          variables,
        },
      });
      const meta: GenerationMetadata = {
        model: params.model,
        stream: false,
        temperature: params.temperature ?? undefined,
        max_tokens: params.max_tokens ?? undefined,
        n: params.n ?? undefined,
        seed: params.seed ?? undefined,
      };
      try {
        const completion = await client.chat.completions.create({
          ...params,
          stream: false,
        });
        item.tracing.logGeneration({
          input: JSON.stringify(params),
          output: JSON.stringify(completion),
          metadata: {
            ...meta,
            usage: completion.usage,
          },
        });
        item.setOutput(completion);
        return completion;
      } catch (e) {
        item.tracing.logGeneration({
          input: JSON.stringify(params),
          metadata: {
            ...meta,
            error: true,
            error_message: (e as Error).message,
          },
        });
        throw e;
      }
    });
    return completion as ChatCompletion;
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

    const item = await this.client.monitoring.startItem();
    item.setInput(params);
    item.setMetadata({
      sdk: {
        type: "openai_prompt",
        stream: true,
        prompt: {
          slug: prompt.slug,
        },
        variables,
      },
    });

    const meta: GenerationMetadata = {
      model: params.model,
      stream: true,
      temperature: params.temperature ?? undefined,
      max_tokens: params.max_tokens ?? undefined,
      n: params.n ?? undefined,
      seed: params.seed ?? undefined,
    };

    try {
      const original = await client.chat.completions.create({
        ...params,
        stream: true,
      });
      const stream = new Stream<ChatCompletionChunk>(async function* () {
        const chunks: ChatCompletionChunk[] = [];
        for await (const chunk of original) {
          chunks.push(chunk);
          yield chunk;
        }
        const lastChunk = chunks.length > 0 ? chunks[chunks.length - 1] : null;
        item.tracing.logGeneration({
          input: JSON.stringify(params),
          output: JSON.stringify({ chunks }),
          metadata: {
            ...meta,
            usage: lastChunk?.usage,
          },
        });
        item.setOutput({ chunks });
        item.end();
      }, original.controller);
      return stream;
    } catch (e) {
      item.tracing.logGeneration({
        input: JSON.stringify(params),
        metadata: {
          ...meta,
          error: true,
          error_message: (e as Error).message,
        },
      });
      item.end(true, (e as Error).message);
      throw e;
    } finally {
    }
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
