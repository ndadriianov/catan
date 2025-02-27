import tile from './tile.ts';
import Owner from '../owner.ts';
import house from '../house/house.ts';

type Gameboard = {
  tiles: tile[][];
  houses: house[][];
  roads: Owner[][];
  numbers: number[][];
}

export function parseGameboard(gameboardJSON: Gameboard) {
  return {
    tiles: gameboardJSON.tiles,
    houses: gameboardJSON.houses,
    roads: gameboardJSON.roads,
    numbers: gameboardJSON.numbers,
  };
}

export default Gameboard;