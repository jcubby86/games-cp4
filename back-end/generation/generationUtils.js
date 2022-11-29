export const randomNumber = (limit) => Math.floor(Math.random() * limit);
export const randomElement = (arr) => arr[randomNumber(arr.length)];
