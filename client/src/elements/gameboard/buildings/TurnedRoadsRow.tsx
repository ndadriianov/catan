import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import React, {ReactNode} from 'react';
import clsx from 'clsx';
import Owner from '../../../typesDefinitions/owner.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';

type TurnedRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  update: updateProps
}

const TurnedRoadsRow = ({roads, verticalIndex, selectedCoords, isMyTurnNow, owner, update}: TurnedRoadsRowProps): ReactNode => {
  const inUpdate: boolean[] = new Array(roads.length).fill(false);
  update.roads.forEach(road => {
    if (road.y === verticalIndex) inUpdate[road.x] = true;
  });
  
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.turned,
            selectedCoords.y === verticalIndex && selectedCoords.x === index && classes.selected,
            inUpdate[index] && classes.update
          )}
          alt={'road'}
          onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;