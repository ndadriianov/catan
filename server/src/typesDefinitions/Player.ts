import {ConnectionStatus} from './User';
import {Owner} from './Gameboard';
import {PortTypes} from './Ports';
import {DevelopmentCard, DevelopmentCards} from './DevelopmentCard';

export class Player {
  username: string;
  inventory: Inventory;
  status: ConnectionStatus;
  leftTheRoom: boolean;
  color: Owner;
  ports: PortTypes[];
  developmentCards: DevelopmentCards;
  addedDevelopmentCards: DevelopmentCards;
  threwTheDice: boolean;
  usedKnightThisTurn: boolean;
  freeRoads: number;
  
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
    this.status = ConnectionStatus.Green;
    this.leftTheRoom = false;
    this.color = Owner.nobody;
    this.ports = [];
    this.developmentCards = new DevelopmentCards();
    this.addedDevelopmentCards = new DevelopmentCards();
    this.threwTheDice = false;
    this.usedKnightThisTurn = false;
    this.freeRoads = 0;
  }
  
  
  toJSON() {
    return {
      username: this.username,
      inventory: this.inventory,
      status: this.status,
      leftTheRoom: this.leftTheRoom,
      color: this.color,
      ports: [... new Set(this.ports)],
      threwTheDice: this.threwTheDice,
      usedKnightThisTurn: this.usedKnightThisTurn,
      freeRoads: this.freeRoads,
      
      knights: this.developmentCards.Knights,
      victoryPoints: this.developmentCards.VictoryPoints + this.addedDevelopmentCards.VictoryPoints,
      roadBuildings: this.developmentCards.RoadBuildings,
      inventions: this.developmentCards.Inventions,
      monopolies: this.developmentCards.Monopolies,
      
      addedKnights: this.addedDevelopmentCards.Knights,
      addedRoadBuildings: this.addedDevelopmentCards.RoadBuildings,
      addedInventions: this.addedDevelopmentCards.Inventions,
      addedMonopolies: this.addedDevelopmentCards.Monopolies
    };
  }
  
  ApplyAdditionDevCards(): void {
    this.developmentCards.Knights += this.addedDevelopmentCards.Knights;
    this.developmentCards.VictoryPoints += this.addedDevelopmentCards.VictoryPoints;
    this.developmentCards.RoadBuildings += this.addedDevelopmentCards.RoadBuildings;
    this.developmentCards.Inventions += this.addedDevelopmentCards.Inventions;
    this.developmentCards.Monopolies += this.addedDevelopmentCards.Monopolies;
    this.addedDevelopmentCards = new DevelopmentCards();
  }
  
  GettingRobed(): void {
    const totalResources = this.inventory.clay + this.inventory.forrest +
      this.inventory.sheep + this.inventory.stone +
      this.inventory.wheat;
    
    if (totalResources <= 7) return;
    
    const resourcesToDiscard = Math.floor(totalResources / 2);
    let discarded = 0;
    
    while (discarded < resourcesToDiscard) {
      const availableResources: (keyof Inventory)[] = [];
      
      if (this.inventory.clay > 0) availableResources.push('clay');
      if (this.inventory.forrest > 0) availableResources.push('forrest');
      if (this.inventory.sheep > 0) availableResources.push('sheep');
      if (this.inventory.stone > 0) availableResources.push('stone');
      if (this.inventory.wheat > 0) availableResources.push('wheat');
      
      if (availableResources.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableResources.length);
      const resourceType = availableResources[randomIndex];
      
      this.inventory[resourceType]--;
      discarded++;
    }
  }
}



export type Coords = {
  x: number;
  y: number;
}


export class Inventory {
  clay: number;
  forrest: number;
  sheep: number;
  stone: number;
  wheat: number;
  
  
  constructor() {
    this.clay = 0;
    this.forrest = 0;
    this.sheep = 0;
    this.stone = 0;
    this.wheat = 0;
  }
}


export type updateProps = {
  villages: Coords[];
  cities: Coords[];
  roads: Coords[];
}