import villageBlack from '../assets/villages/village-black.png'
import villageBlue from '../assets/villages/village-blue.png'
import villageGreen from '../assets/villages/village-green.png'
import villageNobodys from '../assets/villages/village-nobodys.png'
import villageOrange from '../assets/villages/village-orange.png'
import villageRed from '../assets/villages/village-red.png'
import villageYellow from '../assets/villages/village-yellow.png'

import cityBlack from '../assets/cities/city-black.png'
import cityBlue from '../assets/cities/city-blue.png'
import cityGreen from '../assets/cities/city-green.png'
import cityNobodys from '../assets/cities/city-nobodys.png'
import cityOrange from '../assets/cities/city-orange.png'
import cityRed from '../assets/cities/city-red.png'
import cityYellow from '../assets/cities/city-yellow.png'


export const villages = {
  nobody: villageNobodys,
  black: villageBlack,
  blue: villageBlue,
  green: villageGreen,
  orange: villageOrange,
  red: villageRed,
  yellow: villageYellow
};

export const cities = {
  nobody: cityNobodys,
  black: cityBlack,
  blue: cityBlue,
  green: cityGreen,
  orange: cityOrange,
  red: cityRed,
  yellow: cityYellow
}

type Village = typeof villages[keyof typeof villages];

type City = typeof cities[keyof typeof cities];

export type House = Village | City;
