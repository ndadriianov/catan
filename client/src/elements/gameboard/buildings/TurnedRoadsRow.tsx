import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import React, {ReactNode} from 'react';
import {Coords} from '../map/operations.ts';
import clsx from 'clsx';

type TurnedRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords
}

const TurnedRoadsRow = ({roads, verticalIndex, selectedCoords}: TurnedRoadsRowProps): ReactNode => {
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.turned,
            selectedCoords.y === verticalIndex && selectedCoords.x === index && classes.selected
          )}
          alt={'road'}
          onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index)}
        />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;