import StoryArchive from '../pages/StoryArchive';

export interface ReqBody {}
export interface ResBody {
  error?: string;
}

export interface GameDto extends ResBody {
  type: string;
  code: string;
  phase: string;
  test: number;
  createdAt: Date;
  uuid: string;
}

export interface PlayerDto extends ResBody {
  game: GameDto;
  nickname: string;
  uuid: string;
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
export interface SuggestionDto extends ResBody {
  value: string;
  category: string;
  uuid: string;
}
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
