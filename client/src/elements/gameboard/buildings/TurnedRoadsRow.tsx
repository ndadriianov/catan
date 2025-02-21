import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import React, {ReactNode} from 'react';
import {Coords} from '../map/operations.ts';
import clsx from 'clsx';
import {Owner} from '../../../typesDefinitions/room.ts';

type TurnedRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner
}

const TurnedRoadsRow = ({roads, verticalIndex, selectedCoords, isMyTurnNow, owner}: TurnedRoadsRowProps): ReactNode => {
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.turned,
            selectedCoords.y === verticalIndex && selectedCoords.x === index && classes.selected,
            classes.update
          )}
          alt={'road'}
          onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;