import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { GameDto, JoinGameReqBody, PlayerDto, ReqBody } from '../utils/types';

interface RecreateProps {
  reset: () => void;
  className?: string;
}

const RecreateButton = ({ reset, className }: RecreateProps): JSX.Element => {
  const { appState, setAppState } = useAppState();

  const recreateGame = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const gameResponse = await axios.post<ReqBody, GameDto>(
        `/api/game/${appState.gameId}/recreate`
      );
      const playerResponse = await axios.post<JoinGameReqBody, PlayerDto>(
        '/api/player',
        {
          nickname: appState.nickname,
          uuid: gameResponse.data.uuid
        }
      );

      setAppState({
        nickname: playerResponse.data.nickname,
        playerId: playerResponse.data.uuid,
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type,
        gameId: gameResponse.data.uuid
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
