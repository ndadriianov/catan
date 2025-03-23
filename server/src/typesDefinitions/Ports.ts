import {Coords} from './Player';

export const commonPortLocations: Coords[] = [
  {x: 2, y: 0},
  {x: 3, y: 0},
  {x: 5, y: 0},
  {x: 6, y: 0},
  {x: 10, y: 2},
  {x: 10, y: 3},
  {x: 0, y: 5},
  {x: 1, y: 5}
];

export const clayPortLocations: Coords[] = [
  {x: 8, y: 4},
  {x: 7, y: 4}
];

export const forrestPortLocations: Coords[] = [
  {x: 3, y: 5},
  {x: 4, y: 5}
];

export const sheepPortLocations: Coords[] = [
  {x: 8, y: 1},
  {x: 9, y: 2}
];

export const stonePortLocations: Coords[] = [
  {x: 0, y: 1},
  {x: 1, y: 2}
];

export const wheatPortLocations: Coords[] = [
  {x: 1, y: 3},
  {x: 0, y: 4}
];


export enum PortTypes {
  noPort,
  common,
  clay,
  forrest,
  sheep,
  stone,
  wheat
}