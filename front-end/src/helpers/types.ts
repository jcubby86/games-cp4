export interface GameDto {
  type: string;
  code: string;
  phase: string;
  test: number;
  createdAt: Date;
  title?: string;
}

export interface UserDto {
  game: GameDto;
  nickname: string;
  uuid: string;
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
  users: string[];
  code?: string;
  nickname?: string;
  isHost: boolean;
}
export interface NamesResponseBody extends JoinPhaseResponseBody{
  text?: string;
  placeholder: string;
  names: string[];
}
export interface StoryResponseBody extends JoinPhaseResponseBody {
  prompt: string;
  placeholder: string;
  prefix: string;
  suffix: string;
  story: string;
  filler: string;
  round?: number;
  id: string;
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

export type RequestBody = never;