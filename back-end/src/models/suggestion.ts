import { Category, Suggestion } from '../.generated/prisma';
import InvalidRequestError from '../errors/InvalidRequestError';
import prisma from '../prisma';
import { SuggestionReqBody } from '../types/domain';
import { randomElement } from '../utils/utils';

export async function getSuggestion(category: Category): Promise<string> {
  const suggestions: Suggestion[] = await prisma.suggestion.findMany({
    where: { category }
  });
  return randomElement(suggestions.map((x) => x.value));
}

export async function getAll() {
  const suggestions: Suggestion[] = await prisma.suggestion.findMany();
  return suggestions;
}

function getCategory(type: string): Category {
  const normalized = type.toUpperCase();
  if ((Object.values(Category) as string[]).includes(normalized)) {
    return normalized as Category;
  } else {
    throw new InvalidRequestError('Invalid Category');
  }
}

export async function addSuggestion(value: string, category: string) {
  const suggestion = await prisma.suggestion.create({
    data: {
      value: value,
      category: getCategory(category)
    }
  });
  return suggestion;
}

export async function addSuggestions(suggestions: SuggestionReqBody[]) {
  await prisma.suggestion.createMany({
    data: suggestions.map((s) => ({
      value: s.value,
      category: getCategory(s.category)
    }))
  });
}

export async function deleteSuggestion(uuid: string) {
  await prisma.suggestion.delete({
    where: {
      uuid
    }
  });
}

export async function updateSuggestion(
  uuid: string,
  value?: string,
  category?: string
) {
  const suggestion = await prisma.suggestion.update({
    where: { uuid },
    data: {
      value: value,
      category: category === undefined ? undefined : getCategory(category)
    }
  });
  return suggestion;
}
