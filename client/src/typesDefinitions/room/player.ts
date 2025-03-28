import ConnectionStatus from '../connectionStatus.ts';
import Owner from '../owner.ts';
import Inventory, {parseInventory} from './inventory.ts';

export enum DevelopmentCard {
  Knight,
  VictoryPoint,
  RoadBuilding,
  Invention,
  Monopoly
}

type Player = {
  username: string;
  status: ConnectionStatus;
  inventory: Inventory;
  color: Owner;
  ports: PortTypes[];
  threwTheDice: boolean;
  usedKnightThisTurn: boolean;
  
  knights: number;
  victoryPoints: number;
  roadBuildings: number;
  inventions: number;
  monopolies: number;
  
  addedKnights: number;
  addedRoadBuildings: number;
  addedInventions: number;
  addedMonopolies: number;
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
    ports: playerJSON.ports,
    threwTheDice: playerJSON.threwTheDice,
    usedKnightThisTurn: playerJSON.usedKnightThisTurn,
    
    knights: playerJSON.knights,
    victoryPoints: playerJSON.victoryPoints,
    roadBuildings: playerJSON.roadBuildings,
    inventions: playerJSON.inventions,
    monopolies: playerJSON.monopolies,
    
    addedKnights: playerJSON.addedKnights,
    addedRoadBuildings: playerJSON.addedRoadBuildings,
    addedInventions: playerJSON.addedInventions,
    addedMonopolies: playerJSON.addedMonopolies
  };
}

export enum PortTypes {
  noPort,
  common,
  clay,
  forrest,
  sheep,
  stone,
  wheat
}

export default Player;