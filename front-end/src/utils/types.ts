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

export interface UserDto extends ResBody {
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
  users?: string[];
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
  user: { nickname: string; id: string };
}
export interface StoryArchiveResBody extends ResBody {
  stories: StoryArchive[];
}
