import Owner from '../../../../typesDefinitions/owner.ts';
import Room from '../../../../typesDefinitions/room/room.ts';
import Player, {PortTypes} from '../../../../typesDefinitions/room/player.ts';
import {useContext, useEffect, useState} from 'react';
import classes from './Trade.module.css';
import globalClasses from '../../../../styles.module.css';
import MovableModal from '../../../UI/movableModal/MovableModal.tsx';
import socket from '../../../../socket.ts';
import Inventory from '../../../../typesDefinitions/room/inventory.ts';
import UserContext from '../../../../context/UserContext.ts';
import Select from '../../../UI/select/Select.tsx';
import clsx from 'clsx';

type TradeProps = {
  room: Room,
  color: Owner,
  inventory: Inventory
}

enum resourceTypes {
  notChosen,
  clay,
  forrest,
  sheep,
  stone,
  wheat
}

type Purchase = {
  sellerName: string;
  customerName: string;
  resources: number[];
}

type Deal = {
  partner: string;
  succeed: boolean;
}


const Trade = ({room, color, inventory}: TradeProps) => {
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
  
  const {user} = useContext(UserContext)!;
  
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
    })
    return () => {
      socket.off('purchase-update');
    }
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
    })
    setChosenPort(resourceTypes.notChosen);
  }
  
  return (
    <div>
      <div className={classes.wrapper1}>
        <div className={classes.head}>Торговля</div>
        
        <div onClick={() => setShowBankTrade(true)} className={classes.wrapper2}>Через банк</div>
        
        <div className={classes.wrapper2}>
          <div>С игроками</div>
          <div>
            {room.players
              .filter((player: Player) => player.color !== color)
              .map((player: Player, index: number) => (
                <div key={index} className={classes.wrapper4} onClick={() => {
                  setShowTradeWithPlayers(true);
                  setTradePartner(player.username);
                }}>
                  {player.username}
                </div>
              ))}
          </div>
        </div>
        
        {ports.length > 0 &&
          <div className={classes.wrapper2}>
            <div>Через порт</div>
            <div className={classes.wrapper4} style={{flexDirection: 'column'}}>
              {ports.map((port, index) => (
                <div
                  key={index} className={classes.wrapper5}
                  onClick={() => {
                    const cr = ChooseResource(portTypes[port - 1]);
                    if (cr !== resourceTypes.notChosen) setChosenPort(cr);
                    else setShowUniversalPortTrade(true);
                  }}
                >
                  {portTypes[port - 1]}
                </div>
              ))}
            </div>
          </div>
        }
      </div>
      
      
      <div className={classes.wrapper1}>
        <div className={classes.head}>Предложения от игроков</div>
        
        <div className={classes.wrapper2} style={{alignItems: 'center'}}>
          <div>Предложения мне</div>
          
          {purchases
            .filter(p => p.customerName === user.username)
            .map((p, index) => (
              <div key={index} className={classes.wrapper4} style={{flexDirection: 'column'}}
                   onClick={(): void => SelectDeal(p.sellerName)}
              >
                {p.resources
                  .map((n, i) => ({n: n, i: i}))
                  .filter(n => n.n !== 0)
                  .map((p) => (
                    <div key={p.i} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                      <div style={{marginRight: '5px'}}>{options[p.i + 1]}:</div>
                      {p.n < 0 ?
                        <div>получить {-p.n}</div>
                        :
                        <div style={{color: 'red'}}> отдать {p.n}</div>
                      }
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
        
        <div className={classes.wrapper2} style={{alignItems: 'center'}}>
          <div>Мои предложения</div>
          
          {purchases
            .filter(p => p.sellerName === user.username)
            .map((p, index) => (
              <div key={index} className={classes.wrapper4} style={{flexDirection: 'column'}}>
                {p.resources
                  .map((n, i) => ({n: n, i: i}))
                  .filter(n => n.n !== 0)
                  .map((p) => (
                    <div key={p.i} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                      <div style={{marginRight: '5px'}}>{options[p.i+1]}:</div>
                      {p.n > 0 ?
                        <div>получить {p.n}</div>
                        :
                        <div style={{color: 'red'}}> отдать {-p.n}</div>
                      }
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
      
      
      <MovableModal isOpen={showUniversalPortTrade} onClose={() => setShowUniversalPortTrade(false)}>
        <div className={classes.wrapper1} style={{margin: 0}}>
          <div className={classes.wrapper2}>
            <div>продать 3</div>
            <Select
              options={options.slice(1)} initial={options[0]} value={options[upResourceForSale]}
              onChange={(value: string): void => setUpResourceForSale(ChooseResource(value))}
              className={globalClasses.OptionsInput} style={{marginTop: '3px'}}
            />
          </div>
          
          <div className={classes.wrapper2} style={{marginTop: '5px'}}>
            <div>купить 1</div>
            <Select
              options={options.slice(1)} initial={options[0]} value={options[upResourceForPurchase]}
              onChange={(value: string): void => setUpResourceForPurchase(ChooseResource(value))}
              className={globalClasses.OptionsInput} style={{marginTop: '3px'}}
            />
          </div>
          
          <button className={globalClasses.button} onClick={DealWithUniversalPort}>подтвердить</button>
        </div>
      </MovableModal>
      
      
      <MovableModal
        isOpen={chosenPort !== resourceTypes.notChosen}
        onClose={() => setChosenPort(resourceTypes.notChosen)}
      >
        <div className={classes.wrapper1} style={{margin: 0}}>
          <div className={classes.head}>курс: 2 {options[chosenPort]} за 1 {options[chosenPortResource]}</div>
          <div className={classes.wrapper2}>выберите ресурс для покупки</div>
          <Select
            options={options.slice(1)} initial={options[0]} value={options[chosenPortResource]}
            className={globalClasses.OptionsInput}
            onChange={(value: string) => setChosenPortResource(ChooseResource(value))}
          />
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <button className={globalClasses.button} onClick={DealWithPort}>купить</button>
            <button className={globalClasses.button} onClick={() => setChosenPort(resourceTypes.notChosen)}>отмена</button>
          </div>
        </div>
      </MovableModal>
      
      
      <MovableModal isOpen={showBankTrade} onClose={() => setShowBankTrade(false)}>
        <div className={classes.wrapper1} style={{margin: 0}}>
          <div className={classes.wrapper2}>
            <div>продать 4</div>
            <Select
              options={options.slice(1)} initial={options[0]} value={options[resourceForSale]}
              onChange={(value: string): void => setResourceForSale(ChooseResource(value))}
              className={globalClasses.OptionsInput} style={{marginTop: '3px'}}
            />
          </div>
          
          <div className={classes.wrapper2} style={{marginTop: '5px'}}>
            <div>купить 1</div>
            <Select
              options={options.slice(1)} initial={options[0]} value={options[resourceForPurchase]}
              onChange={(value: string): void => setResourceForPurchase(ChooseResource(value))}
              className={globalClasses.OptionsInput} style={{marginTop: '3px'}}
            />
          </div>
          
          <button className={globalClasses.button} onClick={DealWithBank}>подтвердить</button>
        </div>
      </MovableModal>
      
      
      <MovableModal isOpen={showDealActions} onClose={() => setShowDealActions(false)}>
        <div className={globalClasses.modal}>
          <button className={globalClasses.button} onClick={AcceptDeal}>принять</button>
          <button className={globalClasses.button} onClick={DeclineDeal}>отклонить</button>
        </div>
      </MovableModal>
      
      
      <MovableModal isOpen={showTradeWithPlayers} onClose={() => setShowTradeWithPlayers(false)}>
        <div className={classes.wrapper1} style={{margin: 0}}>
          <div className={classes.head}>Предложение игроку {tradePartner} о сделке</div>
          
          {purchase.map((amount, index) => (
            <div key={index} className={classes.wrapper2} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>{options[index + 1]}: {amount}</div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '3px'}}>
                <button className={globalClasses.roundButton} onClick={() => {
                  setPurchase(prev => {
                    const newPurchase = [...prev];
                    newPurchase[index]++;
                    return newPurchase;
                  });
                }}>
                  +
                </button>
                
                <button className={globalClasses.roundButton} onClick={() => {
                  setPurchase(prev => {
                    const newPurchase = [...prev];
                    newPurchase[index]--;
                    return newPurchase;
                  });
                }}>
                  -
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={ProposeDeal} className={globalClasses.button}>Предложить сделку</button>
        </div>
      </MovableModal>
      
      
      <MovableModal isOpen={incorrect} onClose={() => setIncorrect(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Нельзя дарить или просить подарок</div>
      </MovableModal>
      
      <MovableModal isOpen={dontHaveEnoughClay} onClose={() => setDontHaveEnoughClay(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Недостаточно глины</div>
      </MovableModal>
      
      <MovableModal isOpen={dontHaveEnoughForrest} onClose={() => setDontHaveEnoughForrest(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Недостаточно леса</div>
      </MovableModal>
      
      <MovableModal isOpen={dontHaveEnoughSheep} onClose={() => setDontHaveEnoughSheep(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Недостаточно овец</div>
      </MovableModal>
      
      <MovableModal isOpen={dontHaveEnoughStone} onClose={() => setDontHaveEnoughStone(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Недостаточно камня</div>
      </MovableModal>
      
      <MovableModal isOpen={dontHaveEnoughWheat} onClose={() => setDontHaveEnoughWheat(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Недостаточно пшеницы</div>
      </MovableModal>
      
      <MovableModal isOpen={unsuccessful} onClose={() => setUnsuccessful(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Не удалось отправить предложение</div>
      </MovableModal>
      
      <MovableModal isOpen={showDealAcceptationSucceed} onClose={() => setShowDealAcceptationSucceed(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Сделка состоялась</div>
      </MovableModal>
      
      <MovableModal isOpen={showDealAcceptationFailed} onClose={() => setShowDealAcceptationFailed(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Не удалось заключить сделку</div>
      </MovableModal>
      
      <MovableModal isOpen={showDealDeclineSucceed} onClose={() => setShowDealDeclineSucceed(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Сделка отклонена</div>
      </MovableModal>
      
      <MovableModal isOpen={showDealDeclineFailed} onClose={() => setShowDealDeclineFailed(false)}>
        <div>Не удалось отклонить сделку</div>
      </MovableModal>

      
      
      <MovableModal isOpen={dealSucceed} onClose={() => setDealSucceed(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Сделка заключена</div>
      </MovableModal>
      
      <MovableModal isOpen={dealFailed} onClose={() => setDealFailed(false)}>
        <div className={clsx(globalClasses.modal, globalClasses.shortContent)}>Не удалось заключить сделку</div>
      </MovableModal>
      
      
      <MovableModal isOpen={showDealResult} onClose={() => {
        setShowDealResult(false);
        setDealResultList([]);
      }}
        >
        {dealResultList.map((item, index) => (
          <div key={index} className={clsx(globalClasses.modal, globalClasses.shortContent)}>
            {item.succeed ? `сделка с игроком ${item.partner} заключена` : `не удалось заключить сделку с игроком ${item.partner}`}
          </div>
        ))}
      </MovableModal>
    </div>
  );
};

export default Trade;