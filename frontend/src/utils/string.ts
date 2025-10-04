export const stringToTitleCase = (name: string): string => {
  if (!name || typeof name !== "string") return "";

  return name
    .trim()
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
