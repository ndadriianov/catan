import {Tile} from '../../../typesDefinitions/tiles.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import { House } from '../../../typesDefinitions/houses.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import classes from './Map.module.css';
import frame from '../../../assets/map/frame.png';
import HexagonalRow from '../hexagonalRow/HexagonalRow.tsx';
import TurnedRoadsRow from '../buildings/TurnedRoadsRow.tsx';
import VertRoadsRow from '../buildings/VertRoadsRow.tsx';
import HousesRow from '../buildings/HousesRow.tsx';
import NumbersRow from '../number/NumbersRow.tsx';
import React, {useEffect, useRef, useState} from 'react';


type mapNewProps = {
  tiles: Tile[][];
  roads: Road[][];
  houses: House[][];
  numbers: number[][];
  roadCoords: Coords;
  houseCoords: Coords;
  owner: Owner;
  isMyTurnNow: boolean;
  robberPosition: Coords;
  roadHandler: (x: number, y: number, isMyTurnNow: boolean, owner: Owner) => void;
  houseHandler: (x: number, y: number, isMyTurnNow: boolean, owner: Owner) => void;
  onNumberClick: (coords: Coords) => void;
  handleImageLoad: () => void;
}


const Map = (
  {tiles, roads, houses, numbers, roadCoords, houseCoords, owner, isMyTurnNow,
  robberPosition, roadHandler, houseHandler, onNumberClick, handleImageLoad}: mapNewProps) => {

  const gridRef = useRef<HTMLDivElement>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      const isSquare = Math.abs(window.innerHeight - window.innerWidth) < 330;
      const isPortrait = window.innerHeight > window.innerWidth;
      const isLow = window.innerHeight < 620;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (isSquare) setZoomLevel(0.001 * (width < height ? width : height));
      else if (isPortrait) setZoomLevel(0.0015 * width);
      else if (isLow) setZoomLevel(0.0015 * height);
      else setZoomLevel(0.0017 * height);
    };
    
    // Первоначальная настройка
    handleResize();
    
    // Слушатель изменения размера
    window.addEventListener('resize', handleResize);
    
    // Очистка
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    const el = gridRef.current;

    const timeoutId = setTimeout(() => {
      if (el) {
        el.style.transform = 'translateY(0.1px)';
        requestAnimationFrame(() => {
          el.style.transform = 'translateY(0)';
        });
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, []);



  return (
    <div className={classes.container} style={{zoom: zoomLevel}}>
      <img src={frame} alt={'frame'} className={classes.frame} onLoad={handleImageLoad}/>

      <div className={classes.grid} ref={gridRef}>
        <HexagonalRow tiles={tiles[0]}/>
        <HexagonalRow tiles={tiles[1]}/>
        <HexagonalRow tiles={tiles[2]}/>
        <HexagonalRow tiles={tiles[3]}/>
        <HexagonalRow tiles={tiles[4]}/>
      </div>
      
      <div className={classes.roadsContainer}>
        <TurnedRoadsRow roads={roads[0]} y={0} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
        <VertRoadsRow roads={roads[1]} y={1} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} onClick={roadHandler}/>
        <TurnedRoadsRow roads={roads[2]} y={2} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
        <VertRoadsRow roads={roads[3]} y={3} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} onClick={roadHandler}/>
        <TurnedRoadsRow roads={roads[4]} y={4} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
        <VertRoadsRow roads={roads[5]} y={5} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} onClick={roadHandler}/>
        <TurnedRoadsRow roads={roads[6]} y={6} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
        <VertRoadsRow roads={roads[7]} y={7} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} onClick={roadHandler}/>
        <TurnedRoadsRow roads={roads[8]} y={8} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
        <VertRoadsRow roads={roads[9]} y={9} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                      owner={owner} onClick={roadHandler}/>
        <TurnedRoadsRow roads={roads[10]} y={10} selectedCoords={roadCoords} isMyTurnNow={isMyTurnNow}
                        owner={owner} onClick={roadHandler}/>
      </div>
      
      <div className={classes.housesContainer}>
        <HousesRow houses={houses[0]} isUpper={true} y={0} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
        <HousesRow houses={houses[1]} isUpper={true} y={1} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
        <HousesRow houses={houses[2]} isUpper={true} y={2} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
        <HousesRow houses={houses[3]} isUpper={false} y={3} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
        <HousesRow houses={houses[4]} isUpper={false} y={4} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
        <HousesRow houses={houses[5]} isUpper={false} y={5} selectedCoords={houseCoords}
                   isMyTurnNow={isMyTurnNow} owner={owner} onClick={houseHandler}/>
      </div>
      
      
      <div className={classes.numbersContainer}>
        <NumbersRow numbers={numbers[0]} y={0} robberPosition={robberPosition} onClick={onNumberClick}/>
        <NumbersRow numbers={numbers[1]} y={1} robberPosition={robberPosition} onClick={onNumberClick}/>
        <NumbersRow numbers={numbers[2]} y={2} robberPosition={robberPosition} onClick={onNumberClick}/>
        <NumbersRow numbers={numbers[3]} y={3} robberPosition={robberPosition} onClick={onNumberClick}/>
        <NumbersRow numbers={numbers[4]} y={4} robberPosition={robberPosition} onClick={onNumberClick}/>
      </div>
    </div>
  );
};

export default Map;