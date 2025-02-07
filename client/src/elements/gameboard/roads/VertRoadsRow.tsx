import {Road} from '../../../typesDefinitions/roads.ts';
import classes from './Roads.module.css';
import emitter from '../../../typesDefinitions/emitter.ts';
import {ReactNode} from 'react';


type VertRoadsRowProps = {
  roads: Road[],
  verticalIndex: number
}

const VertRoadsRow = ({roads, verticalIndex}: VertRoadsRowProps): ReactNode => {
  return (
    <div className={classes.vertRoadsRow}>
      {roads.map((road: string, index: number): ReactNode => (
        <img src={road} key={index} className={classes.vert} alt={'road'} onClick={(): boolean => emitter.emit('tap-on-road', verticalIndex, index)} />
      ))}
    </div>
  );
};

export default VertRoadsRow;