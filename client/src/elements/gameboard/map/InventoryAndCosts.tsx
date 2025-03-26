import Inventory from '../../../typesDefinitions/room/inventory.ts';
import Costs from '../../../typesDefinitions/costs.ts';
import {Box, Card, Typography} from '@mui/material';
import React from 'react';

type inventoryAndCostsProps = {
  inventory: Inventory;
  costs: Costs;
  lastNumber: number
}

const InventoryAndCosts = ({inventory, costs, lastNumber}: inventoryAndCostsProps) => {
  const styles = {
    card: {
      flex: 1,
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }
  
  return (
    <Box>
      <Card>
        {lastNumber > 0 &&
          <Typography
            variant="h6"
            color="primary"
            style={{margin: '16px', textAlign: 'center', textTransform: 'uppercase'}}
          >
            выпало число {lastNumber}
          </Typography>}
        
        
        <Box display="flex" flexDirection={{ md: 'column', xl: 'row' }} justifyContent="space-between" gap={2} margin={1}>
          <Card sx={styles.card}>
            <Typography variant="h6" color="primary" gutterBottom>
              ресурсы
            </Typography>
            
            <Box width="100%">
              <Typography variant="body1" sx={{ mb: 1 }}>
                {inventory.clay} - глина
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {inventory.forrest} - лес
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {inventory.sheep} - овцы
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {inventory.stone} - камень
              </Typography>
              <Typography variant="body1">
                {inventory.wheat} - пшеница
              </Typography>
            </Box>
          </Card>
          
          <Card sx={styles.card}>
            <Typography variant="h6" color="primary" gutterBottom>
              цена покупок
            </Typography>
            
            <Box width="100%">
              <Typography variant="body1" sx={{ mb: 1 }}>
                {costs.clay} - глина
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {costs.forrest} - лес
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {costs.sheep} - овцы
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {costs.stone} - камень
              </Typography>
              <Typography variant="body1">
                {costs.wheat} - пшеница
              </Typography>
            </Box>
          </Card>
        </Box>
      </Card>
    </Box>
  );
};

export default InventoryAndCosts;