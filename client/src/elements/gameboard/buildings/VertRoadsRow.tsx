import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Buildings.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import {ReactNode} from 'react';
import {Coords} from '../map/operations.ts';
import clsx from 'clsx';


type VertRoadsRowProps = {
  roads: Road[],
  verticalIndex: number,
  selectedCoords: Coords
}

const VertRoadsRow = ({roads, verticalIndex, selectedCoords}: VertRoadsRowProps): ReactNode => {
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
          onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index)}
        />
      ))}
    </div>
  );
};

export default VertRoadsRow;