import { useAppContext } from '../contexts/AppContext';
import useJoinGame from '../hooks/useJoinGame';
import axios from '../utils/axiosWrapper';
import { alertError } from '../utils/errorHandler';
import { GameDto, ReqBody } from '../utils/types';

interface RecreateProps {
  reset: () => void;
  className?: string;
}

const RecreateButton = ({ reset, className }: RecreateProps): JSX.Element => {
  const { context } = useAppContext();
  const joinGame = useJoinGame();

  const recreateGame = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const gameResponse = await axios.post<ReqBody, GameDto>(
        `/api/game/${context.gameId}/recreate`
      );

      await joinGame(context.nickname!, gameResponse.data.uuid);
      reset();
    } catch (err: unknown) {
      alertError(
        'Unable to create game. Please try again in a little bit.',
        err
      );
    }
  };

  if (context.gameId) {
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
