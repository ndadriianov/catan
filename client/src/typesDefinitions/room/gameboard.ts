import tile from './tile.ts';
import Owner from '../owner.ts';
import house from '../house/house.ts';
import Coords from '../coords.ts';

type Gameboard = {
  tiles: tile[][];
  houses: house[][];
  roads: Owner[][];
  numbers: number[][];
  robberPosition: Coords;
}

export function parseGameboard(gameboardJSON: Gameboard) {
  return {
    tiles: gameboardJSON.tiles,
    houses: gameboardJSON.houses,
    roads: gameboardJSON.roads,
    numbers: gameboardJSON.numbers,
    robberPosition: gameboardJSON.robberPosition
  };
}

export default Gameboard;