import { PromptContent } from './types.js';

declare class PromptTemplate {
    readonly prompt: PromptContent;
    readonly vars: Array<string>;
    constructor(prompt: PromptContent);
    private extractVariables;
    compile(values: Record<string, string>): PromptContent;
}

export { PromptTemplate };
