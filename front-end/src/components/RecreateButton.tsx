import { useAppState } from '../contexts/AppContext';
import { Game } from '../helpers/types';
import axios, { AxiosResponse } from 'axios';

interface RecreateProps {
  reset: () => void;
  className?: string;
}

const RecreateButton = ({ reset, className }: RecreateProps): JSX.Element => {
  const { appState, setAppState } = useAppState();

  const recreateGame = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const gameResponse = await axios.post<Game, AxiosResponse<Game>, unknown>(
        `/api/game/${appState.gameCode}/recreate`
      );
      const userResponse = await axios.post('/api/user', {
        nickname: appState.nickname.toLowerCase(),
        code: gameResponse.data.code
      });

      setAppState({
        nickname: userResponse.data.nickname,
        userId: userResponse.data._id,
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type
      });
      reset();
    } catch (err) {
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
