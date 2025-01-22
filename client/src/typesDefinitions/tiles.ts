import Clay from '../assets/map/clay.png';
import Forrest  from '../assets/map/forrest.png';
import Sheep from '../assets/map/sheeps.png';
import Stone from '../assets/map/stone.png';
import Wasteland from '../assets/map/wasteland.png';
import Wheat from '../assets/map/wheat.png';


export const tiles = {
  clay: Clay,
  forrest: Forrest,
  sheep: Sheep,
  stone: Stone,
  wasteland: Wasteland,
  wheat: Wheat
}

type Tile = typeof tiles[keyof typeof tiles];

export type Tiles<L extends number> = [Tile, ...Tile[]] & {length: L};
