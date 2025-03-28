import classes from './Map.module.css';
import initialTiles, {initialNumbers} from '../../../constants/TileRows.ts';
import initialRoads from '../../../constants/RoadRows.ts';
import initialHouses from '../../../constants/HouseRows.ts';
import React, {useEffect, useState} from 'react';
import Loader from '../../UI/loader/Loader.tsx';
import Room from '../../../typesDefinitions/room/room.ts';
import emitter from '../../../typesDefinitions/emitter.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import {House} from '../../../typesDefinitions/houses.ts';
import {changeColorHouse, changeColorRoad} from './mapRelatedFunctions/changeColorOperations.ts';
import {
  addCityToUpdate,
  addRoadToUpdate,
  addVillageToUpdate,
  deleteCityFromUpdate,
  deleteRoadFromUpdate,
  deleteVillageFromUpdate, isSelectedCityInUpdate,
  isSelectedHouseInUpdate,
  isSelectedRoadInUpdate, isSelectedVillageInUpdate
} from './mapRelatedFunctions/updateOperations.ts';
import {getHouses, getRoads, getTiles} from './mapRelatedFunctions/mapObjectsProcessing.ts';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import socket from '../../../socket.ts';
import Costs from '../../../typesDefinitions/costs.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import Inventory from '../../../typesDefinitions/room/inventory.ts';
import updateProps from '../../../typesDefinitions/updateProps.ts';
import house from '../../../typesDefinitions/house/house.ts';
import houseType from '../../../typesDefinitions/house/houseType.ts';
import Trade from './trade/Trade.tsx';
import {Tile} from '../../../typesDefinitions/tiles.ts';
import Map from './Map.tsx';
import InventoryAndCosts from './InventoryAndCosts.tsx';
import PlayersList from './PlayersList.tsx';
import {Box, Button, Card, Typography, useMediaQuery} from '@mui/material';
import VictoryPointsAndDevelopmentCards from './VictoryPointsAndDevelopmentCards.tsx';
import player from '../../../typesDefinitions/room/player.ts';
import UnclosablePopup from '../../UI/UnclosablePopup.tsx';


type mapProps = {
  owner: Owner;
  room: Room;
  isMyTurnNow: boolean;
  me: player;
  inventory: Inventory;
}


const Gameboard = ({owner, room, isMyTurnNow, me, inventory}: mapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tiles, setTiles] = useState<Tile[][]>(initialTiles);
  const [numbers, setNumbers] = useState<number[][]>(initialNumbers);
  const [roads, setRoads] = useState<Road[][]>(initialRoads);
  const [houses, setHouses] = useState<House[][]>(initialHouses);
  const [isRoadNobodys, setIsRoadNobodys] = useState(false);
  const [isHouseNobodys, setIsHouseNobodys] = useState(false);
  const [isMyVillage, setIsMyVillage] = useState(false);
  const [isMyUpdateVillage, setIsMyUpdateVillage] = useState(false);
  const [isMyUpdateCity, setIsMyUpdateCity] = useState(false);
  const [isConfirmationRequiredHouse, setIsConfirmationRequiredHouse] = useState<boolean>(false);
  const [isConfirmationRequiredRoad, setIsConfirmationRequiredRoad] = useState<boolean>(false);
  const [isTurnIncorrect, setIsTurnIncorrect] = useState<boolean>(false);
  const [houseCoords, setHouseCoords] = useState<Coords>({x: -1, y: -1});
  const [roadCoords, setRoadCoords] = useState<Coords>({x: -1, y: -1});
  const [update, setUpdate] = useState<updateProps>({villages: [], cities: [], roads: []});
  const [costs, setCosts] = useState<Costs>({clay: 0, forrest: 0, sheep: 0, stone: 0, wheat: 0});
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [robberPosition, setRobberPosition] = useState<Coords>({x: -1, y: -1});
  const [showNumbersModal, setShowNumbersModal] = useState(false);
  const [newRobberPosition, setNewRobberPosition] = useState<Coords>({x: -1, y: -1});
  const [showChooseVictim, setShowChooseVictim] = useState<boolean>(false);
  const [showTheftSucceed, setShowTheftSucceed] = useState<boolean>(false);
  const [showTheftFailed, setShowTheftFailed] = useState<boolean>(false);
  
  
  useEffect(() => {
    function roadHandler(y: number, x: number, isMyTurnNow: boolean, owner: Owner): void {
      const isNobodys: boolean = room.gameboard?.roads[y][x] === Owner.nobody;
      
      console.log(x, y)
      
      if (isMyTurnNow && isNobodys) {
        setRoadCoords({x: x, y: y});
        setIsRoadNobodys(isNobodys);
        changeColorRoad({coords: {x: x, y: y}, owner: owner, setRoads: setRoads});
        setIsConfirmationRequiredRoad(true);
      }
    }
    
    function houseHandler(y: number, x: number, isMyTurnNow: boolean, owner: Owner, update: updateProps): void {
      const currentHouse: house | undefined = room.gameboard?.houses[y][x];
      const isNobodys: boolean = currentHouse?.owner === Owner.nobody;
      const isMyVillage: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.village;
      const isMyUpdateVillage: boolean = !!update.villages.find((village: Coords):boolean => village.x === x && village.y === y);
      const isMyCity: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.city;
      const isMyUpdateCity: boolean = !!update.cities.find((city: Coords): boolean => city.x === x && city.y === y);
      
      console.log(x, y);
      
      if (isMyTurnNow && (isNobodys || isMyVillage || isMyUpdateVillage) && !isMyCity) {
        setHouseCoords({y: y, x: x});
        setIsHouseNobodys(isNobodys);
        setIsMyVillage(isMyVillage);
        setIsMyUpdateVillage(isMyUpdateVillage);
        setIsMyUpdateCity(isMyUpdateCity);
        changeColorHouse({coords: {x: x, y: y}, owner: owner, toCity: isMyUpdateCity, setHouses: setHouses});
        setIsConfirmationRequiredHouse(true);
      }
    }
    
    emitter.on('tap-on-road', roadHandler);
    emitter.on('tap-on-house', houseHandler);
    
    return (): void => {
      emitter.off('tap-on-road', roadHandler);
      emitter.off('tap-on-house', houseHandler);
    };
  }, [owner]);
  
  
  useEffect(() => {
    if (room.gameboard?.tiles) {
      setTiles(getTiles(room.gameboard?.tiles));
      setNumbers(room.gameboard.numbers);
    }
  }, [room.gameboard?.tiles]);
  
  useEffect(() => {
    if (room.gameboard) {
      setRoads(getRoads(room.gameboard.roads));
      setHouses(getHouses(room.gameboard.houses));
      setRobberPosition(room.gameboard.robberPosition)
      update.roads.forEach(r => changeColorRoad({coords: r, owner: owner, setRoads: setRoads}));
      update.villages.forEach(v => changeColorHouse({coords: v, owner: owner, toCity: false, setHouses: setHouses}));
      update.cities.forEach(c => changeColorHouse({coords: c, owner: owner, toCity: true, setHouses: setHouses}));
    }
  }, [room.gameboard]);
  
  useEffect(() => {
    if (room && room.debtors.length > 0) setShowChooseVictim(true);
  }, [room])
  
  function closeRoadModal(): void {
    if (!isSelectedRoadInUpdate(update, roadCoords) && isRoadNobodys) {
      changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    }
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  function buyRoad(): void {
    if (!isSelectedRoadInUpdate(update, roadCoords) && update.roads.length >= me.freeRoads) {
      costs.clay++;
      costs.forrest++;
    }
    setUpdate(update => addRoadToUpdate(update, roadCoords));
    setRoadCoords({y: -1, x: -1});
    setIsConfirmationRequiredRoad(false);
  }
  function cancelRoadPurchase(): void {
    if (isRoadNobodys) changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    setRoadCoords({y: -1, x: -1});
    setIsConfirmationRequiredRoad(false);
  }
  function deleteRoad(): void {
    if (isSelectedRoadInUpdate(update, roadCoords) && update.roads.length > me.freeRoads) {
      costs.clay--;
      costs.forrest--;
    }
    setUpdate(update => deleteRoadFromUpdate(update, roadCoords));
    changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  function cancelRoadDeletion(): void {
    setIsConfirmationRequiredRoad(false);
    setRoadCoords({y: -1, x: -1});
  }
  
  function closeHouseModal(): void {
    if (!isSelectedHouseInUpdate(update, houseCoords) && isHouseNobodys) {
      changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: true, setHouses: setHouses});
    }
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  function buyVillage(): void {
    if (!isSelectedVillageInUpdate(update, houseCoords)) {
      costs.clay++;
      costs.forrest++;
      costs.sheep++;
      costs.wheat++;
    }
    setUpdate((update: updateProps): updateProps => addVillageToUpdate(update, houseCoords));
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function buyCity(): void {
    if (!isSelectedCityInUpdate(update, houseCoords)) {
      costs.wheat += 2;
      costs.stone += 3;
    }
    setUpdate((update: updateProps): updateProps => addCityToUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: owner, toCity: true, setHouses: setHouses});
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function cancelVillagePurchase(): void {
    changeColorHouse({
      coords: houseCoords,
      owner: Owner.nobody,
      toCity: false,
      setHouses: setHouses
    });
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function cancelCityPurchase(): void {
    setHouseCoords({y: -1, x: -1});
    setIsConfirmationRequiredHouse(false);
  }
  function deleteVillage(): void {
    if (isSelectedVillageInUpdate(update, houseCoords)) {
      costs.clay--;
      costs.forrest--;
      costs.sheep--;
      costs.wheat--;
    }
    setUpdate(update => deleteVillageFromUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  function degradeToVillage(): void {
    if (isSelectedCityInUpdate(update, houseCoords)) {
      costs.wheat -= 2;
      costs.stone -= 3;
    }
    setUpdate(update => deleteCityFromUpdate(update, houseCoords));
    changeColorHouse({coords: houseCoords, owner: owner, toCity: false, setHouses: setHouses});
    setIsConfirmationRequiredHouse(false);
    setHouseCoords({y: -1, x: -1});
  }
  
  function endTurn(): void {
    socket.emit('end-turn', update, (succeed: boolean) => {
      if (!succeed) setIsTurnIncorrect(true);
      setUpdate({villages: [], cities: [], roads: []});
      setCosts({clay: 0, forrest: 0, sheep: 0, stone: 0, wheat: 0});
      socket.emit('refresh-room', room.id);
    });
  }
  
  
  function onNumberClick(coords: Coords): void {
    if (isMyTurnNow) {
      setNewRobberPosition(coords);
      setShowNumbersModal(true);
    }
  }
  function moveRobber(): void {
    if (isMyTurnNow) {
      setShowNumbersModal(false);
      socket.emit('move-robber', newRobberPosition);
    }
  }
  function throwTheDice(): void {
    if (isMyTurnNow) socket.emit('throw-the-dice');
  }
  function stealResource(victimName: string): void {
    socket.emit('steal-resource', victimName, (succeed: boolean) => {
      if (succeed) setShowTheftSucceed(true);
      else setShowTheftFailed(true);
    });
  }
  
  
  const isSmallMobile = useMediaQuery('(max-height: 890px) and (orientation: portrait)');
  const strangeMobile = useMediaQuery('(max-height: 920px) and (min-width: 480px) and (max-width: 520px)');
  const isTablet = useMediaQuery('(min-width: 600px) and (max-width: 1199px)');
  const haveEnoughSpace = useMediaQuery('(min-height: 1000px) and (orientation: landscape) and (min-width: 1536px)');
  const isColumnLayout = useMediaQuery('(max-width: 1536px)');
  const isLowScreen = useMediaQuery('(max-height: 880px)');
  
  console.log(room.debtors);
  
  if (isLoading) return <Loader/>;
  
  // если высота хотя бы 1000 при горизонтальной ориентации, то можно отображать Trade
  
  return (
    <div className={classes.wrapper}>
      <Box>
        <Card className={classes.upperCard}>
          <Card sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '5px' }}>
            <Typography margin={1} variant="h6" color="primary" textTransform='uppercase'>ход {room.counter}</Typography>
            <Button onClick={endTurn} variant='contained' disabled={!isMyTurnNow}>завершить ход</Button>
          </Card>
          
          <PlayersList players={room.players}/>
        </Card>
      </Box>
      
      
      <Map tiles={tiles} roads={roads} houses={houses} numbers={numbers} roadCoords={roadCoords} robberPosition={robberPosition}
           houseCoords={houseCoords} owner={owner} update={update} isMyTurnNow={isMyTurnNow} onNumberClick={onNumberClick}/>
      
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: 'flex-start'
      }}>
        {/* Левый столбец (основной контент) */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          width: { xs: '100%', md: 'auto' }
        }}>
          {/* Кнопки для мобильных */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {(isSmallMobile || isTablet || strangeMobile || (isColumnLayout && isLowScreen)) &&
              <Button variant="contained" onClick={() => setShowResourceModal(true)}>
                Показать ресурсы
              </Button>
            }
            {haveEnoughSpace ||
              <Button variant="contained" onClick={() => setShowTradeModal(true)}>
                Открыть меню торговли
              </Button>
            }
            <Button variant="contained" onClick={throwTheDice} disabled={!isMyTurnNow || me.threwTheDice || room.debutMode}>Бросить кубики</Button>
          </Box>
          
          {/* Основные компоненты */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {(isSmallMobile || isTablet || strangeMobile || (isColumnLayout && isLowScreen)) ||
              <InventoryAndCosts inventory={inventory} costs={costs} lastNumber={room.lastNumber} robberShouldBeMoved={room.robberShouldBeMoved} isMyTurnNow={isMyTurnNow}/>
            }
            <VictoryPointsAndDevelopmentCards me={me} isMyTurnNow={isMyTurnNow}/>
          </Box>
        </Box>
        
        {/* Правый столбец (только Trade, если есть место) */}
        {haveEnoughSpace && (
          <Box sx={{
            position: { xs: 'static', md: 'sticky' },
            marginTop: 2,
            width: { xs: '100%', md: '300px' },
            ml: { md: 0.5 }
          }}>
            <Trade room={room} color={owner} inventory={inventory} />
          </Box>
        )}
      </Box>
      
      
      {(isSmallMobile || isTablet || strangeMobile || (isColumnLayout && isLowScreen)) &&
        <MovableModal id={'inventory'} isOpen={showResourceModal} onClose={() => setShowResourceModal(false)}>
          <InventoryAndCosts inventory={inventory} costs={costs} lastNumber={room.lastNumber} robberShouldBeMoved={room.robberShouldBeMoved} isMyTurnNow={isMyTurnNow}/>
        </MovableModal>
      }
      
      {haveEnoughSpace ||
        <MovableModal id={'trade'} isOpen={showTradeModal} onClose={() => setShowTradeModal(false)}>
          <Trade room={room} color={owner} inventory={inventory}/>
        </MovableModal>
      }
      
      
      <MovableModal id={'roads'} isOpen={isConfirmationRequiredRoad} onClose={closeRoadModal}>
        <Box className={classes.buttonGroup}>
          {!isSelectedRoadInUpdate(update, roadCoords) ? (
            <>
              <Button variant="contained" color="primary" size="small" onClick={buyRoad}>
                Подтвердить
              </Button>
              <Button variant="outlined" size="small" onClick={cancelRoadPurchase}>
                Отмена
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" color="error" size="small" onClick={deleteRoad}>
                Удалить
              </Button>
              <Button variant="outlined" size="small" onClick={cancelRoadDeletion}>
                Отмена
              </Button>
            </>
          )}
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'houses'} isOpen={isConfirmationRequiredHouse} onClose={closeHouseModal}>
        <Box className={classes.buttonGroup}>
          {(isMyVillage || isMyUpdateVillage) && !isMyUpdateCity ? (
            <>
              <Button variant="contained" color="primary" size="small" onClick={buyCity}>
                купить город
              </Button>
              {isHouseNobodys && (
                <Button variant="contained" color="error" size="small" onClick={deleteVillage}>
                  удалить деревню
                </Button>
              )}
              <Button variant="outlined" size="small" onClick={cancelCityPurchase}>
                отмена
              </Button>
            </>
          ) : isMyUpdateCity ? (
            <>
              <Button variant="contained" color="secondary" size="small" onClick={degradeToVillage}>
                понизить до деревни
              </Button>
              <Button variant="outlined" size="small" onClick={cancelCityPurchase}>
                отмена
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" color="primary" size="small" onClick={buyVillage}>
                купить деревню
              </Button>
              <Button variant="outlined" size="small" onClick={cancelVillagePurchase}>
                отмена
              </Button>
            </>
          )}
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'numbers'} isOpen={showNumbersModal} onClose={() => setShowNumbersModal(false)}>
        <Box className={classes.buttonGroup}>
          <Button variant="contained" color="primary" size="small" onClick={moveRobber}>
            переместить разбойника сюда
          </Button>
          <Button  variant="contained" color="secondary" size="small" onClick={() => setShowNumbersModal(false)}>
            отмена
          </Button>
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'victim'} isOpen={showChooseVictim} onClose={() => setShowChooseVictim(false)}>
        <Box className={classes.buttonGroup}>
          {room.debtors.map((debtor, index) => (
            <Button key={index} sx={{m: 1, textAlign: 'center'}} onClick={() => stealResource(debtor)}>{debtor}</Button>
          ))}
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'theft-s'} isOpen={showTheftSucceed} onClose={() => setShowTheftSucceed(false)}>
        <Box className={classes.buttonGroup}>
          Ресурс украден у игрока
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'theft-f'} isOpen={showTheftFailed} onClose={() => setShowTheftFailed(false)}>
        <Box className={classes.buttonGroup}>
          Не удалось украсть ресурс у игрока
        </Box>
      </MovableModal>
      
      
      <UnclosablePopup message={`У вас осталось ${me.freeRoads - update.roads.length} неиспользованных бесплатных дороги! Если их не использовать за этот ход, то они исчезнут!`} visible={me.freeRoads - update.roads.length > 0}/>
      
      
      <MovableModal id={'incorrect-turn'} isOpen={isTurnIncorrect} onClose={() => setIsTurnIncorrect(false)}>
        <Box className={classes.buttonGroup}>
          Такой ход невозможен. Попробуйте снова
        </Box>
      </MovableModal>
    </div>
  );
};

export default Gameboard;