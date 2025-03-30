import Inventory from '../../../typesDefinitions/room/inventory.ts';
import {Box, Card, Typography} from '@mui/material';
import React from 'react';

type inventoryAndCostsProps = { inventory: Inventory; }

const InventoryDisplay = ({inventory}: inventoryAndCostsProps) => {
  const styles = {
    card: {
      flex: 1,
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  };
  
  return (
    <Box>
      <Card sx={styles.card}>
        <Typography variant="h6" color="primary" gutterBottom>
          ресурсы
        </Typography>
        
        <Box width="100%">
          <Typography variant="body1" sx={{mb: 1}}>
            {inventory.clay} - глина
          </Typography>
          <Typography variant="body1" sx={{mb: 1}}>
            {inventory.forrest} - лес
          </Typography>
          <Typography variant="body1" sx={{mb: 1}}>
            {inventory.sheep} - овцы
          </Typography>
          <Typography variant="body1" sx={{mb: 1}}>
            {inventory.stone} - камень
          </Typography>
          <Typography variant="body1">
            {inventory.wheat} - пшеница
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default InventoryDisplay;