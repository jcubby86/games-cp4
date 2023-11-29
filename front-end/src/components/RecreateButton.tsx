import { useAppContext } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { alertError } from '../utils/errorHandler';
import { GameDto, JoinGameReqBody, PlayerDto, ReqBody } from '../utils/types';

interface RecreateProps {
  reset: () => void;
  className?: string;
}

const RecreateButton = ({ reset, className }: RecreateProps): JSX.Element => {
  const { context, dispatchContext } = useAppContext();

  const recreateGame = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const gameResponse = await axios.post<ReqBody, GameDto>(
        `/api/game/${context.gameId}/recreate`
      );
      const playerResponse = await axios.post<JoinGameReqBody, PlayerDto>(
        '/api/player',
        {
          nickname: context.nickname!,
          uuid: gameResponse.data.uuid
        }
      );

      dispatchContext({
        type: 'join',
        player: playerResponse.data
      });
      reset();
    } catch (err: unknown) {
      alertError(
        'Unable to create game. Please try again in a little bit.',
        err
      );
    }
  };

  if (context.gameCode) {
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
