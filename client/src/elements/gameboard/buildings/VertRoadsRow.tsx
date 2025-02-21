import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import {ReactNode} from 'react';
import {Coords} from '../map/operations.ts';
import clsx from 'clsx';
import {Owner} from '../../../typesDefinitions/room.ts';


type VertRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner
}

const VertRoadsRow = ({roads, verticalIndex, selectedCoords, isMyTurnNow, owner}: VertRoadsRowProps): ReactNode => {
  return (
    <div className={classes.vertRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.vert,
            selectedCoords.y === verticalIndex && selectedCoords.x === index && classes.selected
          )}
          alt={'road'}
          onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default VertRoadsRow;