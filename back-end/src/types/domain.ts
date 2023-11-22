import {
  Game,
  NameEntry,
  Player,
  StoryEntry,
  Suggestion
} from '../.generated/prisma';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReqBody {}
export interface ResBody {
  error?: string;
}

export interface GameDto extends Game, ResBody {}

export interface PlayerDto extends Player, ResBody {
  game?: GameDto | null;
  storyEntries?: StoryEntry[];
  nameEntries?: NameEntry[];
}

export interface CreateGameReqBody extends ReqBody {
  type: string;
}
export interface UpdateGameReqBody extends ReqBody {
  phase: string;
}
export interface JoinGameReqBody extends ReqBody {
  uuid: string;
  nickname: string;
}
export interface EntryReqBody extends ReqBody {
  value: string;
}

export interface GameStatusResBody extends ResBody {
  phase: string;
  players?: string[];
  code?: string;
  nickname?: string;
  isHost?: boolean;
  placeholder?: string;
}
export interface NamesResBody extends GameStatusResBody {
  names?: string[];
}
export interface StoryResBody extends GameStatusResBody {
  prompt?: string;
  prefix?: string;
  suffix?: string;
  story?: string;
  filler?: string;
  round?: number;
}
export interface StoryArchive {
  value: string;
  player: { nickname: string; id: string };
}
export interface StoryArchiveResBody extends ResBody {
  stories: StoryArchive[];
}

export interface SuggestionDto extends Suggestion, ResBody {}
export interface SuggestionReqBody extends ReqBody {
  value: string;
  category: string;
}

export interface LoginReqBody extends ReqBody {
  username: string;
  password: string;
}
export interface AdminResBody extends ResBody {
  username: string;
  uuid: string;
}
