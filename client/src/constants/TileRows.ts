import {tiles, Tiles} from '../typesDefinitions/tiles.ts';

const tilesRow1: Tiles<3> = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep
];
const tilesRow2: Tiles<4> = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow3: Tiles<5> = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow4: Tiles<4> = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
  tiles.sheep,
];
const tilesRow5: Tiles<3> = [
  tiles.sheep,
  tiles.sheep,
  tiles.sheep
];

export const initialTiles = [tilesRow1, tilesRow2, tilesRow3, tilesRow4, tilesRow5];