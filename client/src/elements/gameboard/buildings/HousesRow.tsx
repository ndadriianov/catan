import {House} from '../../../typesDefinitions/houses.ts';
import classes from './Buildings.module.css'
import clsx from 'clsx'
import {ReactNode} from 'react';
import emitter from '../../../typesDefinitions/emitter.ts';
import {Coords} from '../map/operations.ts';
import {Owner} from '../../../typesDefinitions/room.ts';

type HousesRowProps = {
  houses: House[],
  isUpper: boolean,
  verticalIndex: number,
  selectedCoords: Coords,
  isMyTurnNow: boolean,
  owner: Owner
}

const HousesRow = ({houses, isUpper, verticalIndex, selectedCoords, isMyTurnNow, owner}: HousesRowProps): ReactNode => {
  return (
    <div className={classes.housesRow}>
      {houses.map((house: string, index: number): ReactNode => (
        <img
          src={house}
          key={index}
          className={clsx(
            classes.house,
            ((isUpper && index % 2 === 0) || (!isUpper && index % 2 === 1)) && classes.lower,
            selectedCoords.y === verticalIndex && selectedCoords.x === index&& classes.selected
          )}
          alt={'House'}
          onClick={() => emitter.emit('tap-on-house', verticalIndex, index, isMyTurnNow, owner)}
        />
      ))}
    </div>
  );
};

export default HousesRow;