import { Game as PrismaGame, User as PrismaUser } from '../.generated/prisma';

export interface GameDto extends PrismaGame {
  title?: string;
}

export interface UserDto extends PrismaUser {
  game?: GameDto | null;
}

export interface CreateGameReqBody {
  type: string;
}
export interface UpdateGameReqBody {
  phase: string;
}
export interface JoinGameReqBody {
  uuid: string;
  nickname: string;
}
export interface NamesReqBody {
  text: string;
}
export interface StoryReqBody {
  part: string;
}

export interface JoinResBody {
  phase: string;
  users?: string[];
  code?: string;
  nickname?: string;
  isHost?: boolean;
}
export interface NamesResBody extends JoinResBody {
  text?: string;
  placeholder?: string;
  names?: string[];
}
export interface StoryResBody extends JoinResBody {
  prompt?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  story?: string;
  filler?: string;
  round?: number;
  id?: string;
}
export interface StoryArchiveResBody {
  stories: {
    value: string;
    user: { nickname: string; id: string };
  }[];
}

export interface ErrorResBody {
  error?: string;
}
