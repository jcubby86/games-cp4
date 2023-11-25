/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, jest, test } from '@jest/globals';

import { Category } from '../../../src/.generated/prisma';
import { getSuggestion } from '../../../src/models/suggestion';
import prisma from '../../../src/prisma';

jest.mock('../../../src/prisma');
jest.mock('../../../src/utils/utils');

const prismaMock = prisma as jest.Mocked<typeof prisma>;

test('oneOption', async () => {
  prismaMock.suggestion.findMany.mockResolvedValue([{ value: 'test' } as any]);

  const suggestion = await getSuggestion(Category.STATEMENT);
  expect(suggestion).toMatchObject({ value: 'test' });
});

test('multipleOptions', async () => {
  prismaMock.suggestion.findMany.mockResolvedValue([
    { value: 'test1' },
    { value: 'test2' },
    { value: 'test3' }
  ] as any);

  const suggestion = await getSuggestion(Category.STATEMENT);
  expect(suggestion).toMatchObject({ value: 'test1' });
});
