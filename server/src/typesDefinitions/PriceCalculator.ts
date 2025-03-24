import {Player} from './Player';
import {resourceTypes} from './Purchase';

export class PriceCalculator {
  private _clay: number;
  private _forrest: number;
  private _sheep: number;
  private _stone: number;
  private _wheat: number;
  
  public get clay(): number { return this._clay; }
  public get forrest(): number { return this._forrest; }
  public get sheep(): number { return this._sheep; }
  public get stone(): number { return this._stone; }
  public get wheat(): number { return this._wheat; }
  
  constructor() {
    this._clay = 0;
    this._forrest = 0;
    this._sheep = 0;
    this._stone = 0;
    this._wheat = 0;
  }
  
  public AddRoad(amount: number): void {
    this._clay += amount;
    this._forrest += amount;
  }
  
  public AddVillage(amount: number): void {
    this._clay += amount;
    this._forrest += amount;
    this._sheep += amount;
    this._wheat += amount;
  }
  
  public AddCity(amount: number): void {
    this._stone += 3 * amount;
    this._wheat += 2 * amount;
  }
  
  public AddDevelopmentCard(amount: number): void {
    this._wheat += amount;
    this._sheep += amount;
    this._stone += amount;
  }
  
  public DoesPlayerHaveEnoughResources(player: Player): boolean {
    if (player.inventory.clay < this._clay) return false;
    if (player.inventory.forrest < this._forrest) return false;
    if (player.inventory.sheep < this._sheep) return false;
    if (player.inventory.stone < this._stone) return false;
    if (player.inventory.wheat < this._wheat) return false;
    return true;
  }
  
  public IsDealPossible(player: Player): boolean {
    const resources = [this._clay, this._forrest, this._sheep, this._stone, this._wheat];
    if (!(resources.filter(value => value > 0).length === 1
      && resources.filter(value => value < 0).length === 1)) return false;
    return this.DoesPlayerHaveEnoughResources(player);
  }
  
  public DealWithPort(buy: resourceTypes, sell: resourceTypes, amount: number): void {
    switch (buy) {
      case resourceTypes.clay: this._clay += amount; break;
      case resourceTypes.forrest: this._forrest += amount; break;
      case resourceTypes.sheep: this._sheep += amount; break;
      case resourceTypes.stone: this._stone += amount; break;
      case resourceTypes.wheat: this._wheat += amount; break;
    }
    switch (sell) {
      case resourceTypes.clay: this._clay -= 1; break;
      case resourceTypes.forrest: this._forrest -= 1; break;
      case resourceTypes.sheep: this._sheep -= 1; break;
      case resourceTypes.stone: this._stone -= 1; break;
      case resourceTypes.wheat: this._wheat -= 1; break;
    }
  }
}