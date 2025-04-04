import classes from './Map.module.css';
import initialTiles, {initialNumbers} from '../../../constants/TileRows.ts';
import initialRoads from '../../../constants/RoadRows.ts';
import initialHouses from '../../../constants/HouseRows.ts';
import React, {useEffect, useState} from 'react';
import Room from '../../../typesDefinitions/room/room.ts';
import {Road} from '../../../typesDefinitions/roads.ts';
import {House} from '../../../typesDefinitions/houses.ts';
import {changeColorHouse, changeColorRoad} from './mapRelatedFunctions/changeColorOperations.ts';
import {getHouses, getRoads, getTiles} from './mapRelatedFunctions/mapObjectsProcessing.ts';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import socket from '../../../socket.ts';
import Coords from '../../../typesDefinitions/coords.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import Inventory from '../../../typesDefinitions/room/inventory.ts';
import house from '../../../typesDefinitions/house/house.ts';
import houseType from '../../../typesDefinitions/house/houseType.ts';
import Trade from './trade/Trade.tsx';
import {Tile} from '../../../typesDefinitions/tiles.ts';
import Map from './Map.tsx';
import InventoryDisplay from './InventoryDisplay.tsx';
import PlayersList from './PlayersList.tsx';
import {Box, Button, Card, Typography, useMediaQuery} from '@mui/material';
import DevelopmentCards from './DevelopmentCards.tsx';
import player from '../../../typesDefinitions/room/player.ts';
import UnclosablePopup from '../../UI/UnclosablePopup.tsx';
import VictoryPointsAndLastNumber from './VictoryPointsAndLastNumber.tsx';


type mapProps = {
  owner: Owner;
  room: Room;
  isMyTurnNow: boolean;
  me: player;
  inventory: Inventory;
}


const Gameboard = ({owner, room, isMyTurnNow, me, inventory}: mapProps) => {
  const [tiles, setTiles] = useState<Tile[][]>(initialTiles);
  const [numbers, setNumbers] = useState<number[][]>(initialNumbers);
  const [roads, setRoads] = useState<Road[][]>(initialRoads);
  const [houses, setHouses] = useState<House[][]>(initialHouses);
  const [isRoadNobodys, setIsRoadNobodys] = useState(false);
  const [isHouseNobodys, setIsHouseNobodys] = useState(false);
  const [isMyVillage, setIsMyVillage] = useState(false);
  const [showHouseModal, setShowHouseModal] = useState<boolean>(false);
  const [showRoadModal, setShowRoadModal] = useState<boolean>(false);
  const [isTurnIncorrect, setIsTurnIncorrect] = useState<boolean>(false);
  const [houseCoords, setHouseCoords] = useState<Coords>({x: -1, y: -1});
  const [roadCoords, setRoadCoords] = useState<Coords>({x: -1, y: -1});
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [robberPosition, setRobberPosition] = useState<Coords>({x: -1, y: -1});
  const [showNumbersModal, setShowNumbersModal] = useState(false);
  const [newRobberPosition, setNewRobberPosition] = useState<Coords>({x: -1, y: -1});
  const [showChooseVictim, setShowChooseVictim] = useState<boolean>(false);
  const [showTheftSucceed, setShowTheftSucceed] = useState<boolean>(false);
  const [showTheftFailed, setShowTheftFailed] = useState<boolean>(false);
  const [roadPurchaseFailed, setRoadPurchaseFailed] = useState(false);
  const [villagePurchaseFailed, setVillagePurchaseFailed] = useState(false);
  const [cityPurchaseFailed, setCityPurchaseFailed] = useState(false);
  const [showDevelopmentCards, setShowDevelopmentCards] = useState(false);
  const [winner, setWinner] = useState<string>('');
  
  
  function endTurn(): void {
    socket.emit('end-turn', (succeed: boolean) => {
      if (!succeed) setIsTurnIncorrect(true);
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
  
  function RoadHandler(x: number, y: number, isMyTurnNow: boolean, owner: Owner): void {
    const isNobodys: boolean = room.gameboard?.roads[y][x] === Owner.nobody;
    
    if (isMyTurnNow && isNobodys) {
      setRoadCoords({x: x, y: y});
      setIsRoadNobodys(isNobodys);
      changeColorRoad({coords: {x: x, y: y}, owner: owner, setRoads: setRoads});
      setShowRoadModal(true);
    }
  }
  function HouseHandler(x: number, y: number, isMyTurnNow: boolean, owner: Owner): void {
    const currentHouse: house | undefined = room.gameboard?.houses[y][x];
    const isNobodys: boolean = currentHouse?.owner === Owner.nobody;
    const isMyVillage: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.village;
    const isMyCity: boolean = currentHouse?.owner === owner && currentHouse?.type === houseType.city;
    
    if (isMyTurnNow && (isNobodys || isMyVillage) && !isMyCity) {
      setHouseCoords({y: y, x: x});
      setIsHouseNobodys(isNobodys);
      setIsMyVillage(isMyVillage);
      changeColorHouse({coords: {x: x, y: y}, owner: owner, toCity: isMyVillage, setHouses: setHouses});
      setShowHouseModal(true);
    }
  }
  
  function BuyRoad(): void {
    setShowRoadModal(false);
    setRoadCoords({x: -1, y: -1});
    socket.emit('buy-road', roadCoords, (succeed: boolean) => {
      if (!succeed) {
        if (isRoadNobodys) changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
        setRoadPurchaseFailed(true);
      }
    });
  }
  function CancelRoadPurchase(): void {
    if (isRoadNobodys) changeColorRoad({coords: roadCoords, owner: Owner.nobody, setRoads: setRoads});
    setRoadCoords({y: -1, x: -1});
    setShowRoadModal(false);
  }
  
  function BuyVillage(): void {
    setShowHouseModal(false);
    setHouseCoords({x: -1, y: -1});
    socket.emit('buy-village', houseCoords, (succeed: boolean) => {
      if (!succeed) {
        if (isHouseNobodys) changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
        setVillagePurchaseFailed(true);
      }
    });
  }
  function CancelVillagePurchase(): void {
    if (isHouseNobodys) changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
    setHouseCoords({y: -1, x: -1});
    setShowHouseModal(false);
  }
  function BuyCity(): void {
    setShowHouseModal(false);
    setHouseCoords({x: -1, y: -1});
    socket.emit('buy-city', houseCoords, (succeed: boolean) => {
      if (!succeed) {
        if (room.gameboard?.houses[houseCoords.y][houseCoords.x].owner === owner) {
          changeColorHouse({coords: houseCoords, owner: owner, toCity: false, setHouses: setHouses});
        }
        setCityPurchaseFailed(true);
      }
    });
  }
  function CancelCityPurchase(): void {
    if (isHouseNobodys) changeColorHouse({coords: houseCoords, owner: Owner.nobody, toCity: false, setHouses: setHouses});
    else changeColorHouse({coords: houseCoords, owner: owner, toCity: false, setHouses: setHouses});
    setHouseCoords({y: -1, x: -1});
    setShowHouseModal(false);
  }
  
  
  useEffect(() => {
    if (room.gameboard) {
      setRoads(getRoads(room.gameboard.roads));
      setHouses(getHouses(room.gameboard.houses));
      setRobberPosition(room.gameboard.robberPosition)
      if (room.gameboard.tiles) setTiles(getTiles(room.gameboard.tiles));
      if (room.gameboard.numbers) setNumbers(room.gameboard.numbers);
    }
  }, [room.gameboard]);
  
  useEffect(() => {
    if (room && room.debtors.length > 0) setShowChooseVictim(true);
  }, [room])
  
  useEffect(() => {
    socket.on('win', (winnerName: string): void => {
      setWinner(winnerName);
    })
    
    return () => {
      socket.off('win');
    }
  }, []);
  
  
  const isSmallMobile = useMediaQuery('(max-height: 890px) and (orientation: portrait)');
  const isMobile = useMediaQuery('(orientation: portrait)');
  const haveEnoughSpace = useMediaQuery('(min-height: 1000px) and (orientation: landscape) and (min-width: 1536px)');
  const isLowScreen = useMediaQuery('(max-height: 760px)');
  const isSquare = Math.abs(window.innerHeight - window.innerWidth) < 330;
  
  const renderResources = !isSmallMobile;
  const renderTrade = haveEnoughSpace;
  const renderDevCards = !isLowScreen && !isMobile;
  
  
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
      
      {isSquare ||
      <Map tiles={tiles} roads={roads} houses={houses} numbers={numbers} roadCoords={roadCoords}
           robberPosition={robberPosition} houseCoords={houseCoords} owner={owner} isMyTurnNow={isMyTurnNow}
           onNumberClick={onNumberClick} houseHandler={HouseHandler} roadHandler={RoadHandler}
      />}
      
      
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, marginTop: '5px'}}>
        <Box sx={{display: 'flex', flexDirection: { xs: 'column', md: 'column' }, gap: 1, alignItems: 'center',}}>
          <Button variant="contained" onClick={throwTheDice} disabled={me.threwTheDice || !isMyTurnNow || room.debutMode}>
            Бросить кубики
          </Button>
          
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <VictoryPointsAndLastNumber victoryPoints={me.victoryPoints} lastNumber={room.lastNumber}/>
            {renderResources && <InventoryDisplay inventory={inventory}/>}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {renderResources || <Button variant="contained" onClick={() => setShowResourceModal(true)}>
              Показать ресурсы
            </Button>}
            {renderTrade || <Button variant="contained" onClick={() => setShowTradeModal(true)}>
              Открыть меню торговли
            </Button>}
            {renderDevCards || <Button variant="contained" onClick={() => setShowDevelopmentCards(true)}>
              Открыть карты развития
            </Button>}
          </Box>
          
          {renderDevCards && <DevelopmentCards me={me} isMyTurnNow={isMyTurnNow}/>}
        </Box>
        
        {renderTrade && <Trade room={room} color={me.color} inventory={inventory}/>}
      </Box>
      
      {isSquare &&
        <Map tiles={tiles} roads={roads} houses={houses} numbers={numbers} roadCoords={roadCoords}
             robberPosition={robberPosition} houseCoords={houseCoords} owner={owner} isMyTurnNow={isMyTurnNow}
             onNumberClick={onNumberClick} houseHandler={HouseHandler} roadHandler={RoadHandler}
        />
      }
      
      
      {renderResources ||
        <MovableModal id={'res'} isOpen={showResourceModal} onClose={() => setShowResourceModal(false)}>
          <InventoryDisplay inventory={inventory}/>
        </MovableModal>
      }
      
      {renderDevCards ||
        <MovableModal id={'development'} isOpen={showDevelopmentCards} onClose={() => setShowDevelopmentCards(false)}>
          <DevelopmentCards me={me} isMyTurnNow={isMyTurnNow}/>
        </MovableModal>
      }
      
      {renderTrade ||
        <MovableModal id={'trd'} isOpen={showTradeModal} onClose={() => setShowTradeModal(false)}>
          <Trade room={room} color={me.color} inventory={inventory}/>
        </MovableModal>
      }
      
      
      
      <MovableModal id={'roads'} isOpen={showRoadModal} onClose={CancelRoadPurchase}>
        <Box className={classes.buttonGroup}>
          <Button variant="contained" color="primary" size="small" onClick={BuyRoad}>
            Купить дорогу
          </Button>
          <Button variant="outlined" size="small" onClick={CancelRoadPurchase}>
            Отмена
          </Button>
        </Box>
      </MovableModal>
      
      <MovableModal id={'roads-f'} isOpen={roadPurchaseFailed} onClose={() => setRoadPurchaseFailed(false)}>
        <Box className={classes.buttonGroup}>
          Не удалось купить дорогу
        </Box>
      </MovableModal>
      
      
      <MovableModal id={'houses'} isOpen={showHouseModal} onClose={isMyVillage ? CancelCityPurchase : CancelVillagePurchase}>
        <Box className={classes.buttonGroup}>
          {isMyVillage ?
            <>
              <Button variant="contained" color="primary" size="small" onClick={BuyCity}>
                Купить город
              </Button>
              <Button variant="contained" color="error" size="small" onClick={CancelCityPurchase}>
                Отмена
              </Button>
            </>
            :
            <>
              <Button variant="contained" color="primary" size="small" onClick={BuyVillage}>
                Купить деревню
              </Button>
              <Button variant="contained" color="error" size="small" onClick={CancelVillagePurchase}>
                Отмена
              </Button>
            </>
          }
        </Box>
      </MovableModal>
      
      <MovableModal id={'village-f'} isOpen={villagePurchaseFailed} onClose={() => setVillagePurchaseFailed(false)}>
        <Box className={classes.buttonGroup}>
          Не удалось купить деревню
        </Box>
      </MovableModal>
      
      <MovableModal id={'city-f'} isOpen={cityPurchaseFailed} onClose={() => setCityPurchaseFailed(false)}>
        <Box className={classes.buttonGroup}>
          Не удалось купить деревню
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


      <UnclosablePopup
          message={`У вас осталось ${me.freeVillages} неиспользованных бесплатных поселений!
          Если их не использовать за этот ход, то они исчезнут!`}
          visible={me.freeVillages > 0}
      />


      <UnclosablePopup
        message={`У вас осталось ${me.freeRoads} неиспользованных бесплатных дороги!
         Если их не использовать за этот ход, то они исчезнут!`}
        visible={me.freeRoads > 0}
      />

      
      <UnclosablePopup message={"Необходимо передвинуть разбойника!"} visible={room.robberShouldBeMoved && isMyTurnNow}/>
      
      <UnclosablePopup message={`Игрок ${winner} победил`} visible={winner !== ''}/>
      
      <MovableModal id={'incorrect-turn'} isOpen={isTurnIncorrect} onClose={() => setIsTurnIncorrect(false)}>
        <Box className={classes.buttonGroup}>
          Такой ход невозможен. Попробуйте снова
        </Box>
      </MovableModal>
    </div>
  );
};

export default Gameboard;