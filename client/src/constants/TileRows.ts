import {tiles, Tile} from '../typesDefinitions/tiles.ts';

const tilesRow1: Tile[] = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep
];
const tilesRow2: Tile[] = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow3: Tile[] = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow4: Tile[] = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow5: Tile[] = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep
];

const initialTiles = [tilesRow1, tilesRow2, tilesRow3, tilesRow4, tilesRow5];

export const initialNumbers = [
  [-1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1]
];

export default initialTiles;