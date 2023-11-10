import { Game as PrismaGame, User as PrismaUser } from '../.generated/prisma';

export interface GameDto extends PrismaGame {
  title?: string;
}

export interface UserDto extends PrismaUser {
  game?: GameDto | null;
}

export interface CreateGameRequestBody {
  type: string;
}
export interface UpdateGameRequestBody {
  phase: string;
}
export interface JoinGameRequestBody {
  code: string;
  nickname: string;
}
export interface NamesRequestBody {
  text: string;
}
export interface StoryRequestBody {
  part: string;
}

export interface JoinPhaseResponseBody {
  phase: string;
  users?: string[];
  code?: string;
  nickname?: string;
  isHost?: boolean;
}
export interface NamesResponseBody extends JoinPhaseResponseBody {
  text?: string;
  placeholder?: string;
  names?: string[];
}
export interface StoryResponseBody extends JoinPhaseResponseBody {
  prompt?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  story?: string;
  filler?: string;
  round?: number;
  id?: string;
}
export interface StoryArchiveResponseBody {
  stories: {
    value: string;
    user: { nickname: string; id: string };
  }[];
}

export interface ErrorResponseBody {
  error?: string;
}
