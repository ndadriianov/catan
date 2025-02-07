import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Roads.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import React, {ReactNode} from 'react';

type TurnedRoadsRowProps = {
  roads: Road[],
  verticalIndex: number
}

const TurnedRoadsRow = ({roads, verticalIndex}: TurnedRoadsRowProps): ReactNode => {
  return (
    <div className={classes.turnedRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img src={road} key={index} className={classes.turned} alt={'road'} onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index)} />
      ))}
    </div>
  );
};

export default TurnedRoadsRow;