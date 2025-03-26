import {Tile} from '../../../typesDefinitions/tiles.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import { House } from '../../../typesDefinitions/houses.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';
import classes from './Map.module.css';
import frame from '../../../assets/map/frame.png';
import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import TurnedRoadsRow from '../buildings/TurnedRoadsRow.tsx';
import VertRoadsRow from '../buildings/VertRoadsRow.tsx';
import HousesRow from '../buildings/HousesRow.tsx';
import NumbersRow from '../number/NumbersRow.tsx';
import React, {useEffect, useState} from 'react';


type mapNewProps = {
  tiles: Tile[][];
  roads: Road[][];
  houses: House[][];
  numbers: number[][];
  roadCoords: Coords;
  houseCoords: Coords;
  owner: Owner;
  update: updateProps;
  isMyTurnNow: boolean;
}


const Map = ({tiles, roads, houses, numbers, roadCoords, houseCoords, owner, update, isMyTurnNow}: mapNewProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      const isSquare = Math.abs(window.innerHeight - window.innerWidth) < 320;
      const isPortrait = window.innerHeight > window.innerWidth;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (isSquare) setZoomLevel(0.001 * (width < height ? width : height));
      else if (isPortrait) setZoomLevel(0.0015 * width);
      else setZoomLevel(0.0017 * height);
    };
    
    // Первоначальная настройка
    handleResize();
    
    // Слушатель изменения размера
    window.addEventListener('resize', handleResize);
    
    // Очистка
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={classes.container} style={{zoom: zoomLevel}}>
      <img src={frame} alt={'frame'} className={classes.frame}/>
      
      <div className={classes.grid}>
        <HexagonalRow tiles={tiles[0]}/>
        <HexagonalRow tiles={tiles[1]}/>
        <HexagonalRow tiles={tiles[2]}/>
        <HexagonalRow tiles={tiles[3]}/>
        <HexagonalRow tiles={tiles[4]}/>
      </div>
      
      <div className={classes.roadsContainer}>
        <TurnedRoadsRow roads={roads[0]} verticalIndex={0} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
        <VertRoadsRow roads={roads[1]} verticalIndex={1} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} update={update}/>
        <TurnedRoadsRow roads={roads[2]} verticalIndex={2} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
        <VertRoadsRow roads={roads[3]} verticalIndex={3} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} update={update}/>
        <TurnedRoadsRow roads={roads[4]} verticalIndex={4} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
        <VertRoadsRow roads={roads[5]} verticalIndex={5} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} update={update}/>
        <TurnedRoadsRow roads={roads[6]} verticalIndex={6} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
        <VertRoadsRow roads={roads[7]} verticalIndex={7} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} update={update}/>
        <TurnedRoadsRow roads={roads[8]} verticalIndex={8} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
        <VertRoadsRow roads={roads[9]} verticalIndex={9} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} update={update}/>
        <TurnedRoadsRow roads={roads[10]} verticalIndex={10} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} update={update}/>
      </div>
      
      <div className={classes.housesContainer}>
        <HousesRow houses={houses[0]} isUpper={true} verticalIndex={0} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        <HousesRow houses={houses[1]} isUpper={true} verticalIndex={1} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        <HousesRow houses={houses[2]} isUpper={true} verticalIndex={2} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        <HousesRow houses={houses[3]} isUpper={false} verticalIndex={3} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        <HousesRow houses={houses[4]} isUpper={false} verticalIndex={4} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
        <HousesRow houses={houses[5]} isUpper={false} verticalIndex={5} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} update={update}/>
      </div>
      
      <div className={classes.numbersContainer}>
        <NumbersRow numbers={numbers[0]}/>
        <NumbersRow numbers={numbers[1]}/>
        <NumbersRow numbers={numbers[2]}/>
        <NumbersRow numbers={numbers[3]}/>
        <NumbersRow numbers={numbers[4]}/>
      </div>
    </div>
  );
};

export default Map;