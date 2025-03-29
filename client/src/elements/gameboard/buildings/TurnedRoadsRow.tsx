import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import React, {ReactNode} from 'react';
import clsx from 'clsx';
import Owner from '../../../typesDefinitions/owner.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';

type TurnedRoadsRowProps = {
  roads: Road[],
  y: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  update: updateProps,
  onClick: (x: number, y: number, isMyTurnNow: boolean, owner: Owner) => void
}

const TurnedRoadsRow = ({roads, y, selectedCoords, isMyTurnNow, owner, update, onClick}: TurnedRoadsRowProps): ReactNode => {
  const inUpdate: boolean[] = new Array(roads.length).fill(false);
  update.roads.forEach(road => {
    if (road.y === y) inUpdate[road.x] = true;
  });
  
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.turned,
            selectedCoords.y === y && selectedCoords.x === index && classes.selected,
            inUpdate[index] && classes.update
          )}
          alt={'road'}
          onClick={(): void => onClick(index, y, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;