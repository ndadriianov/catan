import    { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import Owner from '../../../../typesDefinitions/owner.ts';
import Room from '../../../../typesDefinitions/room/room.ts';
import Player, { PortTypes } from '../../../../typesDefinitions/room/player.ts';
import socket from '../../../../socket.ts';
import Inventory from '../../../../typesDefinitions/room/inventory.ts';
import UserContext from '../../../../context/UserContext.ts';
import classes from './Trade.module.css'
import globalClasses from '../../../../styles.module.css';
import MovableModal from '../../../UI/movableModal/MovableModal.tsx';


type TradeProps = { room: Room, color: Owner, inventory: Inventory }

enum resourceTypes {notChosen, clay, forrest, sheep, stone, wheat}

type Purchase = { sellerName: string; customerName: string; resources: number[]; }

type Deal = { partner: string; succeed: boolean; }


const Trade = ({ room, color, inventory }: TradeProps) => {
  const options = ['не выбрано', 'глина', 'лес', 'овцы', 'камень', 'пшеница'];
  const portTypes = ['стандартный', 'глина', 'лес', 'овцы', 'камень', 'пшеница'];
  
  const [showTradeWithPlayers, setShowTradeWithPlayers] = useState(false);
  const [tradePartner, setTradePartner] = useState<string>('');
  const [ports, setPorts] = useState<PortTypes[]>([]);
  const [purchase, setPurchase] = useState<number[]>([0, 0, 0, 0, 0]);
  const [incorrect, setIncorrect] = useState<boolean>(false);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  
  const [dontHaveEnoughClay, setDontHaveEnoughClay] = useState<boolean>(false);
  const [dontHaveEnoughForrest, setDontHaveEnoughForrest] = useState<boolean>(false);
  const [dontHaveEnoughSheep, setDontHaveEnoughSheep] = useState<boolean>(false);
  const [dontHaveEnoughStone, setDontHaveEnoughStone] = useState<boolean>(false);
  const [dontHaveEnoughWheat, setDontHaveEnoughWheat] = useState<boolean>(false);
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  const [sellerName, setSellerName] = useState<string>('');
  const [showDealActions, setShowDealActions] = useState<boolean>(false);
  const [showDealAcceptationSucceed, setShowDealAcceptationSucceed] = useState<boolean>(false);
  const [showDealAcceptationFailed, setShowDealAcceptationFailed] = useState<boolean>(false);
  const [showDealDeclineSucceed, setShowDealDeclineSucceed] = useState<boolean>(false);
  const [showDealDeclineFailed, setShowDealDeclineFailed] = useState<boolean>(false);
  const [showDealResult, setShowDealResult] = useState<boolean>(false);
  const [dealResultList, setDealResultList] = useState<Deal[]>([]);
  const [showDeals, setShowDeals] = useState<boolean>(false);
  
  const [showBankTrade, setShowBankTrade] = useState<boolean>(false);
  const [resourceForSale, setResourceForSale] = useState<resourceTypes>(resourceTypes.notChosen);
  const [resourceForPurchase, setResourceForPurchase] = useState<resourceTypes>(resourceTypes.notChosen);
  
  const [chosenPort, setChosenPort] = useState<resourceTypes>(resourceTypes.notChosen);
  const [chosenPortResource, setChosenPortResource] = useState<resourceTypes>(resourceTypes.notChosen);
  
  const [showUniversalPortTrade, setShowUniversalPortTrade] = useState<boolean>(false);
  const [upResourceForSale, setUpResourceForSale] = useState<resourceTypes>(resourceTypes.notChosen);
  const [upResourceForPurchase, setUpResourceForPurchase] = useState<resourceTypes>(resourceTypes.notChosen);
  
  const [dealSucceed, setDealSucceed] = useState<boolean>(false);
  const [dealFailed, setDealFailed] = useState<boolean>(false);
  
  const { user } = useContext(UserContext)!;
  
  useEffect(() => {
    const player = room.players.find(p => p.color === color);
    if (player) setPorts(player.ports);
  }, [room]);
  
  useEffect(() => {
    socket.emit('load-purchase', (jsonPurchases: Purchase[]): void => {
      setPurchases(jsonPurchases);
    });
    socket.on('purchase-update', (jsonPurchases: Purchase[]): void => {
      setPurchases(jsonPurchases);
    });
    socket.on('inform-about-deal', (partner: string, succeed: boolean): void => {
      setDealResultList((prev) => [...prev, { partner, succeed }]);
      setShowDealResult(true);
    });
    return () => {
      socket.off('purchase-update');
    };
  }, []);
  
  function ChooseResource(input: string): resourceTypes {
    switch (input) {
      case 'глина': return resourceTypes.clay;
      case 'лес': return resourceTypes.forrest;
      case 'овцы': return resourceTypes.sheep;
      case 'камень': return resourceTypes.stone;
      case 'пшеница': return resourceTypes.wheat;
      default: return resourceTypes.notChosen;
    }
  }
  
  function ProposeDeal(): void {
    if (!purchase.find(n => n < 0) || !purchase.find(n => n > 0)) {
      setIncorrect(true);
      return;
    }
    
    let isEnough = true;
    if (purchase[resourceTypes.clay - 1] < 0 && -purchase[resourceTypes.clay - 1] > inventory.clay) {
      setDontHaveEnoughClay(true);
      isEnough = false;
    }
    if (purchase[resourceTypes.forrest - 1] < 0 && -purchase[resourceTypes.forrest - 1] > inventory.forrest) {
      setDontHaveEnoughForrest(true);
      isEnough = false;
    }
    if (purchase[resourceTypes.sheep - 1] < 0 && -purchase[resourceTypes.sheep - 1] > inventory.sheep) {
      setDontHaveEnoughSheep(true);
      isEnough = false;
    }
    if (purchase[resourceTypes.stone - 1] < 0 && -purchase[resourceTypes.stone - 1] > inventory.stone) {
      setDontHaveEnoughStone(true);
      isEnough = false;
    }
    if (purchase[resourceTypes.wheat - 1] < 0 && -purchase[resourceTypes.wheat - 1] > inventory.wheat) {
      setDontHaveEnoughWheat(true);
      isEnough = false;
    }
    if (!isEnough) {
      setPurchase([0, 0, 0, 0, 0]);
      return;
    }
    
    setShowTradeWithPlayers(false);
    setPurchase([0, 0, 0, 0, 0]);
    socket.emit('propose-deal', purchase, user.username, tradePartner, (succeed: boolean) => {
      if (!succeed) setUnsuccessful(true);
    });
  }
  
  function SelectDeal(sellerName: string): void {
    setSellerName(sellerName);
    setShowDealActions(true);
  }
  
  function AcceptDeal(): void {
    setShowDealActions(false);
    socket.emit('accept-deal', sellerName, (succeed: boolean) => {
      if (succeed) setShowDealAcceptationSucceed(true);
      else setShowDealAcceptationFailed(true);
    });
  }
  
  function DeclineDeal(): void {
    setShowDealActions(false);
    socket.emit('decline-deal', sellerName, (succeed: boolean) => {
      if (succeed) setShowDealDeclineSucceed(true);
      else setShowDealDeclineFailed(true);
    });
  }
  
  function DealWithBank(): void {
    socket.emit('deal-with-port', resourceForSale - 1, resourceForPurchase - 1, 4, (succeed: boolean) => {
      if (succeed) setDealSucceed(true);
      else setDealFailed(true);
    });
    setShowBankTrade(false);
  }
  
  function DealWithUniversalPort(): void {
    socket.emit('deal-with-port', upResourceForSale - 1, upResourceForPurchase - 1, 3, (succeed: boolean) => {
      if (succeed) setDealSucceed(true);
      else setDealFailed(true);
    });
    setShowUniversalPortTrade(false);
  }
  
  function DealWithPort(): void {
    socket.emit('deal-with-port', chosenPort - 1, chosenPortResource - 1, 2, (succeed: boolean) => {
      if (succeed) setDealSucceed(true);
      else setDealFailed(true);
    });
    setChosenPort(resourceTypes.notChosen);
  }
  
  function getResourceColor(index: number) {
    const colors = [
      '#8D6E63', // глина
      '#689F38', // лес
      '#AED581', // овцы
      '#78909C', // камень
      '#FFD54F'  // пшеница
    ];
    return colors[index] || '#9E9E9E';
  }
  
  return (
    <Box>
      <Box>
        {/* Основная секция торговли */}
        <Card style={{padding: '16px', minWidth: '250px'}}>
          <Typography
            variant="h6"
            color="primary"
            style={{marginBottom: '16px', textAlign: 'center'}}
          >
            Торговля
          </Typography>
          
          <Button
            variant="contained"
            style={{width: '100%', marginBottom: '8px'}}
            onClick={() => setShowBankTrade(true)}
          >
            Через банк
          </Button>
          
          <Card
            variant="outlined"
            style={{padding: '16px', marginBottom: '8px'}}
          >
            <Typography variant="subtitle1">С игроками</Typography>
            <Stack spacing={1} style={{marginTop: '8px'}}>
              {room.players
                .filter((player: Player) => player.color !== color)
                .map((player: Player) => (
                  <Button
                    key={player.username}
                    variant="outlined"
                    onClick={() => {
                      setShowTradeWithPlayers(true);
                      setTradePartner(player.username);
                    }}
                  >
                    {player.username}
                  </Button>
                ))}
            </Stack>
          </Card>
          
          {ports.length > 0 && (
            <Card
              variant="outlined"
              style={{padding: '16px'}}
            >
              <Typography variant="subtitle1">Через порт</Typography>
              <Stack spacing={1} style={{marginTop: '8px'}}>
                {ports.map((port, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    onClick={() => {
                      const cr = ChooseResource(portTypes[port - 1]);
                      if (cr !== resourceTypes.notChosen) setChosenPort(cr);
                      else setShowUniversalPortTrade(true);
                    }}
                  >
                    {portTypes[port - 1]}
                  </Button>
                ))}
              </Stack>
            </Card>
          )}
        </Card>
        
        {/* Секция предложений */}
        <Card style={{padding: '16px', minWidth: '250px'}}>
          <Typography
            variant="h6"
            color="primary"
            style={{marginBottom: '16px', textAlign: 'center'}}
          >
            Предложения от игроков
          </Typography>
          
          <Card
            variant="outlined"
            style={{padding: '16px', marginBottom: '8px'}}
          >
            <Typography variant="subtitle1">{room.activePlayer !== user.username
              ?
              `Предложения мне: ${purchases.filter(p => (p.customerName === user.username)).length}`
              :
              `Мои предложения: ${purchases.filter(p => (p.sellerName === user.username)).length}`
            }</Typography>
            
            <Button onClick={() => {
              setShowDeals(true);
            }} variant="contained" style={{width: '100%', marginTop: '15px'}}>
              показать
            </Button>
          </Card>
        </Card>
      </Box>
      
      <MovableModal id={'deals'} isOpen={showDeals} onClose={() => setShowDeals(false)}>
        <Card>
          <Typography variant="h6" className={classes.dealsHeader}>
            {room.activePlayer !== user.username ? 'Предложения вам' : 'Ваши предложения'}
          </Typography>
          
          <Box className={classes.dealsList}>
            {purchases
              .filter(p => room.activePlayer !== user.username
                ? (p.customerName === user.username)
                : (p.sellerName === user.username))
              .map((p, index) => (
                <Card
                  key={index}
                  className={classes.dealCard}
                  onClick={() => SelectDeal(p.sellerName)}
                >
                  <Stack spacing={1.5}>
                    <Box className={classes.dealHeader}>
                      <Typography variant="subtitle2" className={classes.dealTitle}>
                        {room.activePlayer !== user.username
                          ? `От: ${p.sellerName}`
                          : `Для: ${p.customerName}`}
                      </Typography>
                    </Box>
                    
                    {p.resources
                      .map((n, i) => ({n, i}))
                      .filter(n => n.n !== 0)
                      .map((item) => (
                        <Box key={item.i} className={classes.resourceItem}>
                          <Box className={classes.resourceLabel}>
                            <Box
                              className={classes.resourceColor}
                              style={{ backgroundColor: getResourceColor(item.i) }}
                            />
                            <Typography>{options[item.i + 1]}</Typography>
                          </Box>
                          <Typography
                            className={`${classes.resourceValue} ${
                              (room.activePlayer !== user.username
                                ? (item.n < 0)
                                : (item.n > 0))
                                ? classes.resourcePositive
                                : classes.resourceNegative
                            }`}
                          >
                            {(room.activePlayer !== user.username ?
                              (item.n < 0) ? `+${-item.n}` : `${-item.n}`
                              :
                              (item.n > 0) ? `+${item.n}` : `${item.n}`)
                            }
                          </Typography>
                        </Box>
                      ))}
                  </Stack>
                </Card>
              ))}
          </Box>
        </Card>
      </MovableModal>
      
      
      {/* Модальное окно для универсального порта */}
      <MovableModal id={'up'} isOpen={showUniversalPortTrade} onClose={() => setShowUniversalPortTrade(false)}>
        <Card>
          <CardContent>
            <FormControl
              style={{width: '100%'}}
            >
              <InputLabel>Продать 3</InputLabel>
              <Select
                value={options[upResourceForSale]}
                onChange={(e) => setUpResourceForSale(ChooseResource(e.target.value))}
                label={'Продать 3'}
                MenuProps={{style: { zIndex: 9999 }}}
              >
                {options.slice(1).map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl
              style={{width: '100%', marginTop: '8px'}}
            >
              <InputLabel>Купить 1</InputLabel>
              <Select
                value={options[upResourceForPurchase]}
                onChange={(e) => setUpResourceForPurchase(ChooseResource(e.target.value))}
                label={'Купить 1'}
                MenuProps={{style: { zIndex: 9999 }}}
              >
                {options.slice(1).map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              style={{width: '100%', marginTop: '16px'}}
              onClick={DealWithUniversalPort}
            >
              Подтвердить
            </Button>
          </CardContent>
        </Card>
      </MovableModal>
      
      {/* Модальное окно для порта */}
      <MovableModal id={'port'} isOpen={chosenPort !== resourceTypes.notChosen} onClose={() => setChosenPort(resourceTypes.notChosen)}>
        <Card>
          <CardContent>
            <Typography variant="h6" color={'primary'} style={{ whiteSpace: "nowrap", marginBottom: '16px' }}>
              Курс: 2 {options[chosenPort]} за 1 {options[chosenPortResource]}
            </Typography>
            <FormControl
              style={{ width: '100%', marginTop: '8px' }}
            >
              <InputLabel>Выберите ресурс для покупки</InputLabel>
              <Select
                value={options[chosenPortResource]}
                onChange={(e) => setChosenPortResource(ChooseResource(e.target.value))}
                label={"Выберите ресурс для покупки"}
                MenuProps={{style: { zIndex: 9999 }}}
              >
                {options.slice(1).map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack
              direction="row"
              spacing={2}
              style={{ marginTop: '16px' }}
            >
              <Button
                variant="contained"
                onClick={DealWithPort}
              >
                Купить
              </Button>
              <Button
                variant="outlined"
                onClick={() => setChosenPort(resourceTypes.notChosen)}
              >
                Отмена
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </MovableModal>
      
      {/* Модальное окно для торговли с банком */}
      <MovableModal id={'bank'} isOpen={showBankTrade} onClose={() => setShowBankTrade(false)}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Продать 4</InputLabel>
              <Select
                value={options[resourceForSale]}
                onChange={(e) => setResourceForSale(ChooseResource(e.target.value as string))}
                label="Продать 4"
                MenuProps={{style: { zIndex: 9999 }}}
              >
                {options.slice(1).map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl
              style={{ width: '100%', marginTop: '8px' }}
            >
              <InputLabel>Купить 1</InputLabel>
              <Select
                value={options[resourceForPurchase]}
                onChange={(e) => setResourceForPurchase(ChooseResource(e.target.value))}
                label="Купить 1"
                MenuProps={{style: { zIndex: 9999 }}}
              >
                {options.slice(1).map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              style={{ width: '100%', marginTop: '16px' }}
              onClick={DealWithBank}
            >
              Подтвердить
            </Button>
          </CardContent>
        </Card>
      </MovableModal>
      
      {/* Модальное окно для действий со сделкой */}
      <MovableModal id={'deal'} isOpen={showDealActions} onClose={() => setShowDealActions(false)}>
        <Card>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={AcceptDeal}
            >
              Принять
            </Button>
            <Button
              variant="outlined"
              onClick={DeclineDeal}
            >
              Отклонить
            </Button>
          </Stack>
        </Card>
      </MovableModal>
      
      {/* Модальное окно для торговли с игроками */}
      <MovableModal id={'trade-with-players'} isOpen={showTradeWithPlayers} onClose={() => setShowTradeWithPlayers(false)}>
        <Card>
          <CardContent sx={{
            minWidth: '170px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ marginBottom: '16px', textAlign: 'center' }} color="primary">
              Предложение игроку {tradePartner} о сделке
            </Typography>
            
            {purchase.map((amount, index) => (
              <Box
                key={index}
                sx={{marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}
              >
                <Typography sx={{ whiteSpace: 'nowrap', mb: 1 }}>
                  {options[index + 1]}: {amount === 0 ? '0' : amount > 0 ? `купить ${amount}` : `продать ${-amount}`}
                </Typography>
                
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
                  <Button variant="outlined" size="small"
                    onClick={() => {
                      setPurchase(prev => {
                        const newPurchase = [...prev];
                        newPurchase[index]++;
                        return newPurchase;
                      });
                    }}
                  >
                    +
                  </Button>
                  
                  <Button variant="outlined" size="small"
                    onClick={() => {
                      setPurchase(prev => {
                        const newPurchase = [...prev];
                        newPurchase[index]--;
                        return newPurchase;
                      });
                    }}
                  >
                    -
                  </Button>
                </Stack>
              </Box>
            ))}
            
            <Button
              variant="contained"
              sx={{ width: '100%', marginTop: '16px' }}
              onClick={ProposeDeal}
            >
              Предложить сделку
            </Button>
          </CardContent>
        </Card>
      </MovableModal>
      
      
      {/* Модальные окна для ошибок и успехов */}
      <MovableModal id={'trade-errors'} isOpen={incorrect} onClose={() => setIncorrect(false)}>
        <Card>
          <Typography>Нельзя дарить или просить подарок</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'dontHaveEnoughClay'} isOpen={dontHaveEnoughClay} onClose={() => setDontHaveEnoughClay(false)}>
        <Card>
          <Typography>Недостаточно глины</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'dontHaveEnoughForrest'} isOpen={dontHaveEnoughForrest} onClose={() => setDontHaveEnoughForrest(false)}>
        <Card>
          <Typography>Недостаточно леса</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'dontHaveEnoughSheep'} isOpen={dontHaveEnoughSheep} onClose={() => setDontHaveEnoughSheep(false)}>
        <Card>
          <Typography>Недостаточно овец</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'dontHaveEnoughStone'} isOpen={dontHaveEnoughStone} onClose={() => setDontHaveEnoughStone(false)}>
        <Card>
          <Typography>Недостаточно камня</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'dontHaveEnoughWheat'} isOpen={dontHaveEnoughWheat} onClose={() => setDontHaveEnoughWheat(false)}>
        <Card>
          <Typography>Недостаточно пшеницы</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'trade-unsuccessful'} isOpen={unsuccessful} onClose={() => setUnsuccessful(false)}>
        <Card>
          <Typography>Не удалось отправить предложение</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-das'} isOpen={showDealAcceptationSucceed} onClose={() => setShowDealAcceptationSucceed(false)}>
        <Card>
          <Typography>Сделка состоялась</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-daf'} isOpen={showDealAcceptationFailed} onClose={() => setShowDealAcceptationFailed(false)}>
        <Card>
          <Typography>Не удалось заключить сделку</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-dds'} isOpen={showDealDeclineSucceed} onClose={() => setShowDealDeclineSucceed(false)}>
        <Card>
          <Typography>Сделка отклонена</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-ddf'} isOpen={showDealDeclineFailed} onClose={() => setShowDealDeclineFailed(false)}>
        <Card>
          <Typography>Не удалось отклонить сделку</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-ds'} isOpen={dealSucceed} onClose={() => setDealSucceed(false)}>
        <Card>
          <Typography>Сделка заключена</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-df'} isOpen={dealFailed} onClose={() => setDealFailed(false)}>
        <Card>
          <Typography>Не удалось заключить сделку</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'deal-sdr'} isOpen={showDealResult} onClose={() => {
        setDealResultList([]);
        setShowDealResult(false);
      }}>
        <Card>
          <Stack spacing={1}>
            {dealResultList.map((item, index) => (
              <Typography key={index}>
                {item.succeed ? `Сделка с игроком ${item.partner} заключена` : `Не удалось заключить сделку с игроком ${item.partner}`}
              </Typography>
            ))}
          </Stack>
        </Card>
      </MovableModal>
    </Box>
  );
};

export default Trade;