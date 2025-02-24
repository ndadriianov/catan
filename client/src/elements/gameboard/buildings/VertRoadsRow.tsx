import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import {ReactNode} from 'react';
import {Coords} from '../map/operations.ts';
import clsx from 'clsx';
import {Owner, updateProps} from '../../../typesDefinitions/room.ts';


type VertRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner,
  update: updateProps
}

const VertRoadsRow = ({roads, verticalIndex, selectedCoords, isMyTurnNow, owner, update}: VertRoadsRowProps): ReactNode => {
  const inUpdate: boolean[] = new Array(roads.length).fill(false);
  update.roads.forEach(road => {
    if (road.y === verticalIndex) inUpdate[road.x] = true;
  });
  
  return (
    <div className={classes.vertRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img
          src={road}
          key={index}
          className={clsx(
            classes.vert,
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

export default VertRoadsRow;