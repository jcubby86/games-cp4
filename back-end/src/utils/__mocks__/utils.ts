/* eslint-disable @typescript-eslint/no-unused-vars */

import { Game } from '../../.generated/prisma';
import {
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
