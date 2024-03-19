declare enum ScoreType {
    AccuracyAI = "accuracy_ai",
    FactsCompare = "facts_compare",
    ContextRecall = "context_recall",
    ContextPrecision = "context_precision",
    Hallucination = "hallucination",
    StringDiff = "string_diff",
    Refusal = "refusal",
    SqlAst = "sql_ast"
}
declare const DefaultScoreTypes: ScoreType[];
type InputType = Record<string, any>;
type OutputType = Record<string, any>;
type MetadataType = Record<string, any>;

export { DefaultScoreTypes, type InputType, type MetadataType, type OutputType, ScoreType };
