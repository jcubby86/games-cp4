export const randomNumber = (limit: number) =>
  Math.floor(Math.random() * limit);
export function randomElement<Type>(arr: Type[]): Type {
  return arr[randomNumber(arr.length)];
}
