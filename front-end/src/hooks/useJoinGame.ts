import { useAppContext } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { JoinGameReqBody, PlayerDto } from '../utils/types';

const useJoinGame = () => {
  const { dispatchContext } = useAppContext();

  return async (nickname: string, uuid: string) => {
    const response = await axios.post<JoinGameReqBody, PlayerDto>(
      '/api/player',
      { nickname, uuid }
    );

    dispatchContext({
      type: 'join',
      player: response.data
    });

    return response.data;
  };
};

export default useJoinGame;
