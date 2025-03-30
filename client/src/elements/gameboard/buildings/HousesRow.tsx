import {House} from '../../../typesDefinitions/houses.ts';
import classes from './Buildings.module.css'
import clsx from 'clsx'
import {ReactNode} from 'react';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';


type HousesRowProps = {
  houses: House[],
  isUpper: boolean,
  y: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  onClick: (x: number, y: number, isMyTurnNow: boolean, owner: Owner) => void
}

const HousesRow = (
  {houses, isUpper, y, selectedCoords, isMyTurnNow, owner, onClick}: HousesRowProps) => {
  
  return (
    <div className={classes.housesRow}>
      {houses.map((house: string, index: number): ReactNode => (
        <img
          src={house}
          key={index}
          className={clsx(
            classes.house,
            ((isUpper && index % 2 === 0) || (!isUpper && index % 2 === 1)) && classes.lower,
            selectedCoords.y === y && selectedCoords.x === index&& classes.selected
          )}
          alt={'House'}
          onClick={() => onClick(index, y, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default HousesRow;