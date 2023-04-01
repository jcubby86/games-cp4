import { useAppState } from '../contexts/AppContext';
import { Game } from '../helpers/types';
import axios, { AxiosResponse } from 'axios';
import { JOIN } from '../helpers/constants';

interface RecreateProps {
  reset: (newPhase: string, nickname: string) => void;
}

const Recreate = ({ reset }: RecreateProps): JSX.Element => {
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
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type
      });
      reset(JOIN, userResponse.data.nickname);
    } catch (err) {
      alert('Unable to create game. Please try again in a little bit.');
    }
  };

  return (
    <button
      className={'btn opacity-75 btn-outline-success'}
      onClick={recreateGame}
    >
      Play Again
    </button>
  );
};

export default Recreate;
