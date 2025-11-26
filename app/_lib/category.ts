export function mapCategoryToText(category: string): string {
  switch (category) {
    case "random":
      return "Random Thoughts";
    case "school":
      return "School";
    case "personal":
      return "Personal";
    default:
      return "Unknown";
  }
}
