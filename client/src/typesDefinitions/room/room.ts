import Player, {jsonPlayer, parsePlayer} from './player.ts';
import Gameboard, {parseGameboard} from './gameboard.ts';


type Room = {
  id: number;
  players: Player[];
  activePlayer: string;
  counter: number;
  lastNumber: number;
  haveStarted: boolean;
  gameboard?: Gameboard;
  robberShouldBeMoved: boolean;
  debtors: string[];
  playWithRobber: boolean;
  debutMode: boolean;
  pointsToWin: number;
}

export type jsonRoom = Omit<Room, 'players'> & {
  players: jsonPlayer[];
}

export function parseRoom(roomJSON: jsonRoom|null): Room|null {
  if (!roomJSON) return null;
  try {
    return {
      id: roomJSON.id,
      players: roomJSON.players.map((player: jsonPlayer): Player => {
        return parsePlayer(player);
      }),
      activePlayer: roomJSON.activePlayer,
      counter: roomJSON.counter,
      lastNumber: roomJSON.lastNumber,
      haveStarted: roomJSON.haveStarted as boolean,
      gameboard: roomJSON.gameboard ? parseGameboard(roomJSON.gameboard) : undefined,
      robberShouldBeMoved: roomJSON.robberShouldBeMoved,
      debtors: roomJSON.debtors,
      playWithRobber: roomJSON.playWithRobber,
      debutMode: roomJSON.debutMode,
      pointsToWin: roomJSON.pointsToWin,
    };
  } catch (e) {
    console.log("Error parsing room:", e);
    return null;
  }
}

export default Room;
