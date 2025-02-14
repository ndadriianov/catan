import Clay from '../assets/map/clay.png';
import Forrest  from '../assets/map/forrest.png';
import Sheep from '../assets/map/sheeps.png';
import Stone from '../assets/map/stone.png';
import Wasteland from '../assets/map/wasteland.png';
import Wheat from '../assets/map/wheat.png';


export const tiles = {
  forrest: Forrest,
  wheat: Wheat,
  sheep: Sheep,
  clay: Clay,
  stone: Stone,
  wasteland: Wasteland,
}

export type Tile = typeof tiles[keyof typeof tiles];
