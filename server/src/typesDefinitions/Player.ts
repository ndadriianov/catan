import {ConnectionStatus} from './User';
import {Owner} from './Gameboard';
import {PortTypes} from './Ports';
import {DevelopmentCard} from './DevelopmentCard';

export class Player {
  username: string;
  inventory: Inventory;
  status: ConnectionStatus;
  leftTheRoom: boolean;
  color: Owner;
  ports: PortTypes[];
  developmentCards: DevelopmentCard[];
  addedDevelopmentCards: DevelopmentCard[];
  threwTheDice: boolean;
  
  
  constructor(username: string) {
    this.username = username;
    this.inventory = new Inventory();
    this.status = ConnectionStatus.Green;
    this.leftTheRoom = false;
    this.color = Owner.nobody;
    this.ports = [];
    this.developmentCards = [];
    this.addedDevelopmentCards = [];
    this.threwTheDice = false;
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
      
      knights: this.developmentCards.filter(card => card === DevelopmentCard.Knight).length,
      victoryPoints: this.developmentCards.filter(card => card === DevelopmentCard.VictoryPoint).length
        + this.addedDevelopmentCards.filter(card => card === DevelopmentCard.VictoryPoint).length,
      roadBuildings: this.developmentCards.filter(card => card === DevelopmentCard.RoadBuilding).length,
      inventions: this.developmentCards.filter(card => card === DevelopmentCard.Invention).length,
      monopolies: this.developmentCards.filter(card => card === DevelopmentCard.Monopoly).length,
      
      addedKnights: this.addedDevelopmentCards.filter(card => card === DevelopmentCard.Knight).length,
      addedRoadBuildings: this.addedDevelopmentCards.filter(card => card === DevelopmentCard.RoadBuilding).length,
      addedInventions: this.addedDevelopmentCards.filter(card => card === DevelopmentCard.Invention).length,
      addedMonopolies: this.addedDevelopmentCards.filter(card => card === DevelopmentCard.Monopoly).length
    };
  }
  
  ApplyAdditionDevCards(): void {
    this.developmentCards = this.addedDevelopmentCards;
    this.addedDevelopmentCards = [];
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