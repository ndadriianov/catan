import {Box, Button, Card, Typography} from '@mui/material';
import socket from '../../../socket.ts';
import {useState} from 'react';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import classes from '../../../styles.module.css';

type Props = {
  victoryPoints: number;
  knightAmount: {current: number; add: number};
  roadBuildingAmount: {current: number; add: number};
  inventionAmount: {current: number; add: number};
  monopolyAmount: {current: number; add: number};
}

type CardItemProps = {
  name: string;
  value: number;
  addValue: number;
  onApply: () => void;
}

const DevCardItem = ({name, value, addValue, onApply}: CardItemProps) => (
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
    <Button variant="outlined" size="small" onClick={onApply} sx={{ml: 'auto', px: 2}}>
      Применить
    </Button>
  </Box>
);

const VictoryPointsAndDevelopmentCards = ({victoryPoints, knightAmount, roadBuildingAmount, inventionAmount, monopolyAmount}: Props) => {
  const [showPurchaseSucceed, setShowPurchaseSucceed] = useState(false);
  const [showPurchaseFailed, setShowPurchaseFailed] = useState(false);
  
  
  function BuyDevCard(): void {
    socket.emit('buy-dev-card', (succeed: boolean): void => {
      if (succeed) setShowPurchaseSucceed(true);
      else setShowPurchaseFailed(true);
    })
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
                {victoryPoints}
              </Box>
            </Typography>
            
            <Card sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
              <Typography variant="subtitle1" sx={{mt: 2, m: 1, fontWeight: 'medium', color: 'text.secondary'}}>
                Карты развития
              </Typography>
              
              <Button variant="outlined" size="small" onClick={BuyDevCard} sx={{mr: 1}}>
                купить
              </Button>
            </Card>
            
            
            <Card variant="outlined" sx={{p: 2, borderColor: 'divider', bgcolor: 'action.hover',}}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DevCardItem
                  name="Рыцарь"
                  value={knightAmount.current}
                  addValue={knightAmount.add}
                  onApply={() => {}}
                />
                <DevCardItem
                  name="Строительство дорог"
                  value={roadBuildingAmount.current}
                  addValue={roadBuildingAmount.add}
                  onApply={() => {}}
                />
                <DevCardItem
                  name="Изобретение"
                  value={inventionAmount.current}
                  addValue={inventionAmount.add}
                  onApply={() => {}}
                />
                <DevCardItem
                  name="Монополия"
                  value={monopolyAmount.current}
                  addValue={monopolyAmount.add}
                  onApply={() => {}}
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