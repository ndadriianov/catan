export enum DevelopmentCard {
  Knight,
  VictoryPoint,
  RoadBuilding,
  Invention,
  Monopoly
}

export const InitialDevelopmentCards = [
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.Knight,
  DevelopmentCard.VictoryPoint,
  DevelopmentCard.VictoryPoint,
  DevelopmentCard.VictoryPoint,
  DevelopmentCard.VictoryPoint,
  DevelopmentCard.VictoryPoint,
  DevelopmentCard.RoadBuilding,
  DevelopmentCard.RoadBuilding,
  DevelopmentCard.Invention,
  DevelopmentCard.Invention,
  DevelopmentCard.Monopoly,
  DevelopmentCard.Monopoly
]


export class DevelopmentCards {
  Knights: number;
  VictoryPoints: number;
  RoadBuildings: number;
  Inventions: number;
  Monopolies: number;
  
  constructor() {
    this.Knights = 0;
    this.VictoryPoints = 0;
    this.RoadBuildings = 0;
    this.Inventions = 0;
    this.Monopolies = 0;
  }
}