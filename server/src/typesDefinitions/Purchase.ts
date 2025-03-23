import {Inventory, Player} from './Player';
import {EventEmitter} from 'node:events';

enum resourceTypes {
  clay,
  forrest,
  sheep,
  stone,
  wheat
}

const resourceMap: Record<resourceTypes, keyof Inventory> = {
  [resourceTypes.clay]: "clay",
  [resourceTypes.forrest]: "forrest",
  [resourceTypes.sheep]: "sheep",
  [resourceTypes.stone]: "stone",
  [resourceTypes.wheat]: "wheat",
};

export type Purchase = {
  seller: Player;
  customer: Player;
  resources: number[];
}

export class PurchaseService {
  private _purchases: Purchase[] = [];
  private _players: Player[];
  private _eventEmitter: EventEmitter;
  private readonly _roomId: number;
  
  constructor(players: Player[], eventEmitter: EventEmitter, roomId: number) {
    this._players = players;
    this._eventEmitter = eventEmitter;
    this._roomId = roomId;
  }
  
  public addPurchase(sellerName: string, customerName: string, resources: number[]): boolean {
    if (!resources.find(n => n < 0) || !resources.find(n => n > 0)) return false;
    if (this._purchases.find(p => p.seller.username === sellerName && p.customer.username === customerName)) return false;
    
    const seller = this._players.find(p => p.username === sellerName);
    const customer = this._players.find(p => p.username === customerName);
    if (!seller || !customer) return false;
    
    this._purchases.push({seller: seller, customer: customer, resources: resources});
    this._eventEmitter.emit('purchase-update', this._roomId);
    return true;
  }
  
  private _getPurchase(seller: string, customer: string): Purchase|undefined {
    return this._purchases.find(p => (p.seller.username === seller && p.customer.username === customer));
  }
  
  private _getPlayerAmount(seller: Player, customer: Player, resType: resourceTypes, resourceAmount: number): number {
    switch (resType) {
      case resourceTypes.clay: return resourceAmount > 0 ? customer.inventory.clay : seller.inventory.clay;
      case resourceTypes.forrest: return resourceAmount > 0 ? customer.inventory.forrest : seller.inventory.forrest;
      case resourceTypes.sheep: return resourceAmount > 0 ? customer.inventory.sheep : seller.inventory.sheep;
      case resourceTypes.stone: return resourceAmount > 0 ? customer.inventory.stone : seller.inventory.stone;
      case resourceTypes.wheat: return resourceAmount > 0 ? customer.inventory.wheat : seller.inventory.wheat;
    }
  }
  
  public makePurchase(sellerName: string, customerName: string): boolean {
    const purchase = this._getPurchase(sellerName, customerName)
    
    if (!purchase) return false;
    
    for (let index: number = 0; index < purchase.resources.length; index++) {
      const resourceAmount: number = purchase.resources[index];
      if (!(index in resourceTypes)) return false;
      const resType = index as resourceTypes;
      const playerAmount: number = this._getPlayerAmount(purchase.seller, purchase.customer, resType, resourceAmount);
      if (resourceAmount < 0 && playerAmount < -resourceAmount) return false;
    }
    
    for (let index: number = 0; index < purchase.resources.length; index++) {
      const resourceAmount:number = purchase.resources[index];
      
      if (!(index in resourceTypes)) return false;
      const resType = index as resourceTypes;
      const key = resourceMap[resType];
      
      if (resourceAmount > 0) {
        purchase.customer.inventory[key] -= resourceAmount;
        purchase.seller.inventory[key] += resourceAmount;
      } else {
        purchase.customer.inventory[key] -= resourceAmount;
        purchase.seller.inventory[key] += resourceAmount;
      }
    }
    this.deletePurchase(sellerName, customerName);
    this._eventEmitter.emit('update', this._roomId);
    this._eventEmitter.emit('purchase-update', this._roomId);
    return true;
  }
  
  public deletePurchase(seller: string, customer: string): boolean {
    const lastLength = this._purchases.length;
    this._purchases = this._purchases.filter(p => (p.seller.username !== seller && p.customer.username !== customer));
    this._eventEmitter.emit('purchase-update', this._roomId);
    return this._purchases.length < lastLength;
  }
  
  toJSON(): any {
    return this._purchases.map(p => {
      return {
        sellerName: p.seller.username,
        customerName: p.customer.username,
        resources: p.resources
      }
    });
  }
}