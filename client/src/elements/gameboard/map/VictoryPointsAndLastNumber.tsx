import { Box, Typography } from '@mui/material';

interface VictoryPointsAndLastNumberProps {
  victoryPoints: number;
  lastNumber: number;
}

const VictoryPointsAndLastNumber = ({victoryPoints, lastNumber}: VictoryPointsAndLastNumberProps) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    p: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    width: 'fit-content',
    bgcolor: 'background.default'
  };
  
  const labelStyle = {
    fontWeight: 500,
    fontSize: { xs: '0.875rem', sm: '1rem' },
    color: 'text.secondary',
    lineHeight: 1.2
  };
  
  const valueStyle = {
    fontWeight: 700,
    fontSize: { xs: '1.25rem', sm: '1.5rem' },
    color: 'text.primary',
    lineHeight: 1
  };
  
  const dividerStyle = {
    width: '100%',
    height: '1px',
    bgcolor: 'divider',
    my: 0.5
  };
  
  return (
    <Box sx={containerStyle}>
      <Typography sx={labelStyle}>
        Победные очки
      </Typography>
      <Typography sx={valueStyle}>
        {victoryPoints}
      </Typography>
      
      <Box sx={dividerStyle} />
      
      <Typography sx={labelStyle}>
        Последнее число
      </Typography>
      <Typography sx={valueStyle}>
        {lastNumber}
      </Typography>
    </Box>
  );
};

export default VictoryPointsAndLastNumber;