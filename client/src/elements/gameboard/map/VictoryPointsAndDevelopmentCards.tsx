import {Box, Button, Card, Typography} from '@mui/material';
import socket from '../../../socket.ts';
import {useState} from 'react';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import classes from '../../../styles.module.css';
import player from '../../../typesDefinitions/room/player.ts';

type Props = {
  me: player;
  isMyTurnNow: boolean;
}

type CardItemProps = {
  name: string;
  value: number;
  addValue: number;
  onApply: () => void;
  disabled: boolean;
}

const DevCardItem = ({name, value, addValue, onApply, disabled}: CardItemProps) => (
  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2}}>
    <Typography variant="body1" sx={{minWidth: 120 }}>
      {name}:
    </Typography>
    <Typography variant="body1" sx={{fontWeight: 'bold', minWidth: 30, textAlign: 'center'}}>
      {value}
    </Typography>
    <Typography variant="body1" sx={{fontWeight: 'bold', minWidth: 30, textAlign: 'center'}} color={addValue > 0 ? 'green' : 'orange'}>
      (+{addValue})
    </Typography>
    <Button variant="outlined" size="small" onClick={onApply} sx={{ml: 'auto', px: 2}} disabled={disabled}>
      Применить
    </Button>
  </Box>
);

const VictoryPointsAndDevelopmentCards = ({me, isMyTurnNow}: Props) => {
  const [showPurchaseSucceed, setShowPurchaseSucceed] = useState(false);
  const [showPurchaseFailed, setShowPurchaseFailed] = useState(false);
  
  
  function BuyDevCard(): void {
    socket.emit('buy-dev-card', (succeed: boolean): void => {
      if (succeed) setShowPurchaseSucceed(true);
      else setShowPurchaseFailed(true);
    })
  }
  function ActivateKnight(): void {
    socket.emit('activate-knight');
  }
  function ActivateRoadBuilding(): void {
    socket.emit('activate-road-building');
  }
  function ActivateInvention(): void {
  
  }
  function ActivateMonopoly(): void {
  
  }
  
  return (
    <Box>
      <Box
        sx={{display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2,}}>
        <Card sx={{minWidth: 300, boxShadow: 3, bgcolor: 'background.paper',}}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" component="div" sx={{mb: 2, color: 'primary.main', fontWeight: 'bold', textAlign: 'center'}}>
              Победные очки:
              <Box component="span" sx={{ml: 1, fontSize: '1.5rem', color: 'success.main'}}>
                {me.victoryPoints}
              </Box>
            </Typography>
            
            <Card sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{mt: 2, m: 1, fontWeight: 'medium', color: 'text.secondary'}}>
                Карты развития
              </Typography>
              
              <Button variant="outlined" size="small" onClick={BuyDevCard} sx={{mr: 1}} disabled={!isMyTurnNow || !me.threwTheDice}>
                купить
              </Button>
            </Card>
            
            
            <Card variant="outlined" sx={{p: 2, borderColor: 'divider', bgcolor: 'action.hover',}}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DevCardItem
                  name="Рыцарь"
                  value={me.knights}
                  addValue={me.addedKnights}
                  onApply={ActivateKnight}
                  disabled={!(isMyTurnNow && (!me.threwTheDice && !me.usedKnightThisTurn) && me.knights > 0)}
                />
                <DevCardItem
                  name="Строительство дорог"
                  value={me.roadBuildings}
                  addValue={me.addedRoadBuildings}
                  onApply={ActivateRoadBuilding}
                  disabled={!(isMyTurnNow && me.roadBuildings > 0 && me.threwTheDice)}
                />
                <DevCardItem
                  name="Изобретение"
                  value={me.inventions}
                  addValue={me.addedInventions}
                  onApply={ActivateInvention}
                  disabled={!(isMyTurnNow && me.inventions > 0 && me.threwTheDice)}
                />
                <DevCardItem
                  name="Монополия"
                  value={me.monopolies}
                  addValue={me.addedMonopolies}
                  onApply={ActivateMonopoly}
                  disabled={!(isMyTurnNow && me.monopolies > 0 && me.threwTheDice)}
                />
              </Box>
            </Card>
          </Box>
        </Card>
      </Box>
      
      
      <MovableModal id={'vpadc-ps'} isOpen={showPurchaseSucceed} onClose={() => setShowPurchaseSucceed(false)}>
        <Card className={classes.centeredModal}>
          <Typography whiteSpace={'nowrap'}>покупка карты развития состоялась</Typography>
        </Card>
      </MovableModal>
      
      <MovableModal id={'vpadc-pf'} isOpen={showPurchaseFailed} onClose={() => setShowPurchaseFailed(false)}>
        <Card className={classes.centeredModal}>
          <Typography whiteSpace={'nowrap'}>покупка карты развития не состоялась</Typography>
        </Card>
      </MovableModal>
    </Box>
  );
};

export default VictoryPointsAndDevelopmentCards;