import axios from 'axios';
import List from './List';

const StartGame = (props) => {
  const startGame = async (e) => {
    e.preventDefault();
    await axios.put(`/api/games/${props.code}`, { phase: 'play' });
    props.setPhase('');
  };

  return (
    <>
      <div className="w-100">
        <div className="text-center mb-4">
          <h1 className="text-nowrap">{props.title}</h1>
        </div>
        <form className="row gap-3" onSubmit={startGame}>
          <div className="mb-3 col p-0">
            <label htmlFor="gameCode" className="form-label">
              Game Code:
            </label>
            <input
              className="form-control"
              type="text"
              value={props.code}
              aria-label="game code"
              readOnly
              id="gameCode"
              style={{ minWidth: '100px' }}
              onClick={(e) => e.target.select()}
            />
          </div>
          <div className="mb-3 col p-0">
            <label htmlFor="playerCount" className="form-label">
              Player Count:
            </label>
            <input
              className="form-control"
              type="text"
              value={props.users.length}
              aria-label="player count"
              readOnly
              id="playerCount"
            />
          </div>
          <input
            type="submit"
            value="Start Game"
            className="form-control btn btn-success mt-4 col-12"
          />
        </form>
        <h3 className="text-center mt-5">Players:</h3>
        <List items={props.users}></List>
      </div>
    </>
  );
};

export default StartGame;
