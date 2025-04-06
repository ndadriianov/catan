import React from "react";
import {Box, Card, Typography} from "@mui/material";
import clayImg from "../../../assets/cards/ClayCard.png";
import forestImg from "../../../assets/cards/ForrestCard.png";
import sheepImg from "../../../assets/cards/SheepCard.png";
import stoneImg from "../../../assets/cards/StoneCard.png";
import wheatImg from "../../../assets/cards/WheatCard.png";

interface ResourceDisplayProps {
  resources: {
    clay: number;
    forrest: number;
    sheep: number;
    stone: number;
    wheat: number;
  };
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({resources}) => {
  const resourceData = [
    {name: "clay", quantity: resources.clay, img: clayImg},
    {name: "forrest", quantity: resources.forrest, img: forestImg},
    {name: "sheep", quantity: resources.sheep, img: sheepImg},
    {name: "stone", quantity: resources.stone, img: stoneImg},
    {name: "wheat", quantity: resources.wheat, img: wheatImg},
  ];

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      <Card sx={{display: 'flex', flexDirection: 'row', padding: 1, gap: 1}}>
      {resourceData.map((resource) => (
        <Box
          key={resource.name}
          position="relative"
          textAlign="center"
        >
          <Card sx={{padding: 0.5}}>
          <img
            src={resource.img}
            alt={resource.name}
            style={{width: "40px", height: "50px", objectFit: "cover", borderRadius: "8px"}}
          />
          <Typography variant='body1' component="div">
            {resource.quantity}
          </Typography>
          </Card>
        </Box>
      ))}
      </Card>
    </Box>
  );
};

export default ResourceDisplay;