export enum ScoreType {
  AccuracyAI = "accuracy_ai",
  FactsCompare = "facts_compare",
  ContextRecall = "context_recall",
  ContextPrecision = "context_precision",
  Hallucination = "hallucination",
  StringDiff = "string_diff",
  Refusal = "refusal",
  SqlAst = "sql_ast",
}

export const DefaultScoreTypes = [ScoreType.StringDiff];

export type InputType = Record<string, any>;
export type OutputType = Record<string, any>;
export type MetadataType = Record<string, any>;
