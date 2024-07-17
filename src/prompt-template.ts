import { ChatMessage, PromptContent } from "./types";

export class PromptTemplate {
  readonly prompt: PromptContent;
  readonly vars: Array<string>;

  constructor(prompt: PromptContent) {
    this.prompt = prompt;
    this.vars = this.extractVariables(prompt.chatMessages ?? []);
  }

  private extractVariables(messages: ChatMessage[]): string[] {
    const content = messages.map((message) => message.content).join("\n\n");
    const matches = content.match(/\{\{([^}]+)\}\}/g) ?? [];
    return matches.map((match) => match.replace(/\{\{([^}]+)\}\}/g, "$1"));
  }

  compile(values: Record<string, string>): PromptContent {
    return {
      ...this.prompt,
      chatMessages: this.prompt.chatMessages.map((message) => {
        return {
          ...message,
          content: message.content.replace(
            /\{\{([^}]+)\}\}/g,
            (match, pattern) => {
              return values[pattern] || match;
            },
          ),
        };
      }),
    };
  }
}
