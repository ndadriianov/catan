import leftNobodys from '../assets/roads/left/left-nobodys.png'
import leftBlack from '../assets/roads/left/left-black.png'
import leftBlue from '../assets/roads/left/left-blue.png'
import leftGreen from '../assets/roads/left/left-green.png'
import leftOrange from '../assets/roads/left/left-orange.png'
import leftRed from '../assets/roads/left/left-red.png'
import leftYellow from '../assets/roads/left/left-yellow.png'

import rightNobodys from '../assets/roads/right/right-nobodys.png'
import rightBlack from '../assets/roads/right/right-black.png'
import rightBlue from '../assets/roads/right/right-blue.png'
import rightGreen from '../assets/roads/right/right-green.png'
import rightOrange from '../assets/roads/right/right-orange.png'
import rightRed from '../assets/roads/right/right-red.png'
import rightYellow from '../assets/roads/right/right-yellow.png'

import straightNobodys from '../assets/roads/straight/staight-nobodys.png'
import straightBlack from '../assets/roads/straight/straight-black.png'
import straightBlue from '../assets/roads/straight/straight-blue.png'
import straightGreen from '../assets/roads/straight/straight-green.png'
import straightOrange from '../assets/roads/straight/straight-orange.png'
import straightRed from '../assets/roads/straight/straight-red.png'
import straightYellow from '../assets/roads/straight/straight-yellow.png'


export const leftRoads = {
  nobody: leftNobodys,
  black: leftBlack,
  blue: leftBlue,
  green: leftGreen,
  orange: leftOrange,
  red: leftRed,
  yellow: leftYellow,
};

export const rightRoads = {
  nobody: rightNobodys,
  black: rightBlack,
  blue: rightBlue,
  green: rightGreen,
  orange: rightOrange,
  red: rightRed,
  yellow: rightYellow,
};

export const straightRoads = {
  nobody: straightNobodys,
  black: straightBlack,
  blue: straightBlue,
  green: straightGreen,
  orange: straightOrange,
  red: straightRed,
  yellow: straightYellow,
};


type LeftRoad = typeof leftRoads[keyof typeof leftRoads];

type RightRoad = typeof rightRoads[keyof typeof rightRoads];

type StraightRoad = typeof straightRoads[keyof typeof straightRoads];

type Road = LeftRoad | RightRoad | StraightRoad;

export type Roads<L extends number> = [Road, ...Road[]] & {length: L};