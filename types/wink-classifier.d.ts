declare module "wink-naive-bayes-text-classifier" {
  interface NaiveBayesTextClassifier {
    definePrepTasks(tasks: Array<(text: string) => string[]>): void;
    defineConfig(config: { considerOnlyPresence?: boolean; smoothingFactor?: number }): void;
    learn(text: string, label: string): void;
    consolidate(): void;
    predict(text: string): string;
  }

  export default function createClassifier(): NaiveBayesTextClassifier;
}

declare module "wink-naive-bayes-text-classifier/src/prep-text.js" {
  const prepText: (text: string) => string[];
  export default prepText;
}
