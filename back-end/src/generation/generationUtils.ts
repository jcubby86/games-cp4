export const randomNumber = (limit: number) =>
  Math.floor(Math.random() * limit);
export const randomElement = (arr: any[]) => arr[randomNumber(arr.length)];
