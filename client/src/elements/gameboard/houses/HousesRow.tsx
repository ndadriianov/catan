import {House} from '../../../typesDefinitions/houses.ts';
import classes from './HousesRow.module.css'
import clsx from 'clsx'
import {ReactNode} from 'react';
import emitter from '../../../typesDefinitions/emitter.ts';

type HousesRowProps = {
  houses: House[],
  isUpper: boolean,
  verticalIndex: number
}

const HousesRow = ({houses, isUpper, verticalIndex}: HousesRowProps): ReactNode => {
  return (
    <div className={classes.housesRow}>
      {houses.map((house: string, index: number): ReactNode => (
        <img
          src={house}
          key={index}
          className={
          isUpper ?
            index % 2 === 0 ?
              clsx(classes.house, classes.lower)
              :
              classes.house
            :
            index % 2 === 1 ?
              clsx(classes.house, classes.lower)
              :
              classes.house}
          alt={'House'}
          onClick={() => emitter.emit('tap-on-house', verticalIndex, index)}
        />
      ))}
    </div>
  );
};

export default HousesRow;