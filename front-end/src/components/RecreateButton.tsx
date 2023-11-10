import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import {
  GameDto,
  JoinGameRequestBody,
  RequestBody,
  UserDto
} from '../utils/types';

interface RecreateProps {
  reset: () => void;
  className?: string;
}

const RecreateButton = ({ reset, className }: RecreateProps): JSX.Element => {
  const { appState, setAppState } = useAppState();

  const recreateGame = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const gameResponse = await axios.post<RequestBody, GameDto>(
        `/api/game/${appState.gameCode}/recreate`
      );
      const userResponse = await axios.post<JoinGameRequestBody, UserDto>(
        '/api/user',
        {
          nickname: appState.nickname.toLowerCase(),
          code: gameResponse.data.code
        }
      );

      setAppState({
        nickname: userResponse.data.nickname,
        userId: userResponse.data.uuid,
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type
      });
      reset();
    } catch (err: unknown) {
      alert('Unable to create game. Please try again in a little bit.');
    }
  };

  if (appState.gameCode) {
    return (
      <button className={className} onClick={recreateGame}>
        Play Again
      </button>
    );
  } else {
    return <></>;
  }
};

export default RecreateButton;
