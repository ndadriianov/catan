import ConnectionStatus from '../connectionStatus.ts';
import Owner from '../owner.ts';
import Inventory, {parseInventory} from './inventory.ts';

type Player = {
  username: string;
  status: ConnectionStatus;
  inventory: Inventory;
  color: Owner;
}

export type jsonPlayer = Player & {
  leftTheRoom: boolean;
}

export function parsePlayer(playerJSON: jsonPlayer): Player {
  if (playerJSON.status === ConnectionStatus.Green && playerJSON.leftTheRoom) playerJSON.status = ConnectionStatus.Gray;
  return {
    username: playerJSON.username,
    status: playerJSON.status as ConnectionStatus,
    inventory: parseInventory(playerJSON.inventory),
    color: playerJSON.color,
  };
}

export default Player;