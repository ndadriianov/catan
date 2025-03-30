import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import {ReactNode} from 'react';
import clsx from 'clsx';
import Owner from '../../../typesDefinitions/owner.ts';
import Coords from '../../../typesDefinitions/coords.ts';


type VertRoadsRowProps = {
  roads: Road[],
  y: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  onClick: (x: number, y: number, isMyTurnNow: boolean, owner: Owner) => void
}

const VertRoadsRow = (
  {roads, y, selectedCoords, isMyTurnNow, owner, onClick}: VertRoadsRowProps): ReactNode => {
  
  return (
    <div className={classes.vertRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(classes.vert, selectedCoords.y === y && selectedCoords.x === index && classes.selected)}
          alt={'road'}
          onClick={(): void => onClick(index, y, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default VertRoadsRow;