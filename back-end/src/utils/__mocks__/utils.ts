/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */

import { Game } from '../../.generated/prisma';
import {
  gameExists as gameExistsImpl,
  lowerFirst as lowerFirstImpl,
  upperFirst as upperFirstImpl
} from '../utils';

export function randomNumber(limit: number) {
  return 0;
}
export function randomElement<Type>(arr: Type[]): Type {
  return arr[0];
}
export function shuffleArray<Type>(array: Type[]): void {}
export function lowerFirst(part: string): string {
  return part.slice(0, 1).toLowerCase() + part.slice(1);
}
export function upperFirst(part: string): string {
  return part.slice(0, 1).toUpperCase() + part.slice(1);
}
export function gameExists(game: Game): boolean {
  const twoHours = 2 * 60 * 60 * 1000;
  return new Date().getTime() - twoHours < game.createdAt.getTime();
}
