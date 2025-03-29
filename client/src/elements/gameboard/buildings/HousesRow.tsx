import {House} from '../../../typesDefinitions/houses.ts';
import classes from './Buildings.module.css'
import clsx from 'clsx'
import {ReactNode} from 'react';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';


type HousesRowProps = {
  houses: House[],
  isUpper: boolean,
  y: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  update: updateProps
  onClick: (x: number, y: number, isMyTurnNow: boolean, owner: Owner, update: updateProps) => void
}

const HousesRow = (
  {houses, isUpper, y, selectedCoords, isMyTurnNow, owner, update, onClick}: HousesRowProps) => {
  
  const inUpdate: boolean[] = new Array(houses.length).fill(false);
  update.villages.forEach(village => {
    if (village.y === y) inUpdate[village.x] = true;
  });
  update.cities.forEach(city => {
    if (city.y === y) inUpdate[city.x] = true;
  });
  
  return (
    <div className={classes.housesRow}>
      {houses.map((house: string, index: number): ReactNode => (
        <img
          src={house}
          key={index}
          className={clsx(
            classes.house,
            ((isUpper && index % 2 === 0) || (!isUpper && index % 2 === 1)) && classes.lower,
            selectedCoords.y === y && selectedCoords.x === index&& classes.selected,
            inUpdate[index] && classes.update
          )}
          alt={'House'}
          onClick={() => onClick(index, y, isMyTurnNow, owner, update)}
        />
      ))}
    </div>
  );
};

export default HousesRow;