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
  title?: string;
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
export interface NamesReqBody extends ReqBody {
  text: string;
}
export interface StoryReqBody extends ReqBody {
  part: string;
}

export interface JoinResBody extends ResBody {
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
export interface StoryArchive {
  value: string;
  user: { nickname: string; id: string };
}
export interface StoryArchiveResBody extends ResBody {
  stories: StoryArchive[];
}
