import {EventEmitter} from 'node:events';
import {ConnectionStatus} from './User';
import {Gameboard, Owner} from './Gameboard';
import {Coords, Inventory, Player} from './Player';
import {PriceCalculator} from './PriceCalculator';
import {PurchaseService} from './Purchase';
import {DevelopmentCard, InitialDevelopmentCards} from './DevelopmentCard';


export interface RoomOptions {
  lastNumber: number;
  robberShouldBeMoved: boolean;
  playWithRobber: boolean;
  debtors: string[];
  longestRoad: number;
  largestArmy: number;
  playerWithTheLongestRoad?: string;
  playerWithTheLargestArmy?: string;
  gameboard?: Gameboard;
  players: Player[];
  developmentCardDeck: DevelopmentCard[];
  counter: number;
  haveStarted: boolean;
  pointsToWin: number;
  password?: string;
}


export class Room {
  id: number; // ok
  debutMode: boolean; // dont need in db
  lastNumber: number; // ok
  robberShouldBeMoved: boolean; // ok
  playWithRobber: boolean; // ok
  debtors: string[]; // ok
  longestRoad: number; // need to add
  largestArmy: number; // need to add
  playerWithTheLongestRoad: Player|undefined; // need to add
  playerWithTheLargestArmy: Player|undefined; // need to add
  purchases?: PurchaseService; // dont need in db
  gameboard?: Gameboard;            // complicated
  password?: string;
  private _players: Player[];  // complicated
  private _activePlayer?: Player; // ok
  private _eventEmitter: EventEmitter; // dont need in db
  private _developmentCardDeck: DevelopmentCard[]; // need to add
  private _counter: number; // ok
  private _haveStarted: boolean; // ok
  private _pointsToWin: number; // ok
  
  
  get pointsToWin(): number {return this._pointsToWin;}
  
  set pointsToWin(value: number) {
    this._pointsToWin = value;
    this._players.forEach((player: Player) => {
      player.pointsToWin = value;
    })
  }
  
  
  get players(): Player[] {return JSON.parse(JSON.stringify(this._players));}
  
  get playersByLink(): Player[] {return this._players;}
  
  
  isInRoom(username: string): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    return !!player;
  }
  
  
  // если игра не началась, то пользователь будет добавлен при наличии места
  // если игра началась, то ничего не произойдет
  addPlayer(username: string): boolean {
    if (this._haveStarted || this._players.length === 4) return false;
    if (this._players.find((player: Player): boolean => player.username === username)) return false;
    
    this._players.push(new Player(username, this._eventEmitter, this.id));
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  // если игра не началась, то пользователь просто будет удален
  // если игра началась, то ничего не произойдет
  removePlayer(username: string): boolean {
    if (this._haveStarted) return false;
    if (!this._players.find((player: Player): boolean => player.username === username)) return false;
    
    this._players = this._players.filter((player: Player): boolean => player.username !== username);
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  setColor(color: Owner, username: string): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    if (!player) return false;
    player.color = color;
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  checkPlayersResources(username: string, priceCalculator: PriceCalculator): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    return (!!player && priceCalculator.IsDealPossible(player));
  }
  
  borrowResourcesFromPlayer(username: string, priceCalculator: PriceCalculator): boolean {
    const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
    if (!player) return false;
    
    player.inventory.clay -= priceCalculator.clay;
    player.inventory.forrest -= priceCalculator.forrest;
    player.inventory.sheep -= priceCalculator.sheep;
    player.inventory.stone -= priceCalculator.stone;
    player.inventory.wheat -= priceCalculator.wheat;
    
    this._eventEmitter.emit('update', this.id);
    return true;
  }
  
  
  toJSON_forClient() {
    return {
      id: this.id,
      debutMode: this.debutMode,
      lastNumber: this.lastNumber,
      robberShouldBeMoved: this.robberShouldBeMoved,
      playWithRobber: this.playWithRobber,
      debtors: this.debtors,
      gameboard: this.gameboard ? this.gameboard.toJSON() : undefined,
      players: this._players.map(player => (player.toJSON_forClient())),
      activePlayer: this._activePlayer?.username,
      counter: this._counter,
      haveStarted: this._haveStarted,
      pointsToWin: this.pointsToWin,
      passwordRequired: this.password !== undefined,
    };
  }
  
  
  toJSON() {
    return {
      id: this.id,
      lastNumber: this.lastNumber,
      robberShouldBeMoved: this.robberShouldBeMoved,
      playWithRobber: this.playWithRobber,
      debtors: this.debtors,
      longestRoad: this.longestRoad,
      largestArmy: this.largestArmy,
      playerWithTheLongestRoad: this.playerWithTheLongestRoad?.username,
      playerWithTheLargestArmy: this.playerWithTheLargestArmy?.username,
      gameboard: this.gameboard?.toJSON(),
      players: this._players.map(player => (player.toJSON())),
      developmentCardDeck: this._developmentCardDeck,
      counter: this._counter,
      haveStarted: this._haveStarted,
      pointsToWin: this.pointsToWin,
      password: this.password,
    }
  }
  
  
  constructor(id: number, eventEmitter: EventEmitter, options?: RoomOptions) {
    if (options) {
      this.id = id;
      // debut ok
      this.lastNumber = options.lastNumber;
      this.robberShouldBeMoved = options.robberShouldBeMoved;
      this.playWithRobber = options.playWithRobber;
      this.debtors = options.debtors;
      this.longestRoad = options.longestRoad;
      this.largestArmy = options.largestArmy;
      // purchases ok
      // gameboard ok через options передается уже созданный Gameboard
      this._players = options.players; // через options передается уже созданный Player[]t
      this.playerWithTheLongestRoad = this._players.find(p => p.username === options.playerWithTheLongestRoad);
      this.playerWithTheLargestArmy = this._players.find(p => p.username === options.playerWithTheLargestArmy);
      // activePlayer ok
      this._eventEmitter = eventEmitter;
      this._developmentCardDeck = options.developmentCardDeck;
      this._counter = options.counter;
      this._haveStarted = options.haveStarted;
      this._pointsToWin = options.pointsToWin;
      if (options.password) this.password = options.password;
      
      this.debutMode = this._counter <= this._players.length * 2;
      if (this._haveStarted) {
        this._activePlayer = this.nextPlayer(); // здесь counter не инкрементирован, поэтому nextPlayer вернет текущего
        this.purchases = new PurchaseService(this._players, eventEmitter, id);
        this.gameboard = options.gameboard ? options.gameboard : new Gameboard();
      }
    }
    
    else {
      this.id = id;
      this._activePlayer = undefined;
      this.debutMode = false;
      this._counter = 1;
      this._players = [];
      this._haveStarted = false;
      this._eventEmitter = eventEmitter;
      this.lastNumber = 0;
      this._developmentCardDeck = [...InitialDevelopmentCards].sort(() => Math.random() - 0.5);
      this.robberShouldBeMoved = false;
      this.debtors = [];
      this.playWithRobber = false;
      this.longestRoad = 0;
      this.largestArmy = 0;
      this._pointsToWin = 10;
    }
    
    eventEmitter.on('update-user-status', (username: string, status: ConnectionStatus): void => { // надо сделать чтобы получала только та комната где есть данный игрок
      const player: Player | undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.status = status;
        eventEmitter.emit('update', this.id);
      }
    });
    eventEmitter.on(`player-connected-to-room-${this.id}`, (username: string): void => {
      const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.leftTheRoom = false;
        eventEmitter.emit('update', this.id);
      }
    });
    eventEmitter.on(`player-disconnected-from-room-${this.id}`, (username: string): void => {
      const player: Player|undefined = this._players.find((player: Player): boolean => player.username === username);
      if (player) {
        player.leftTheRoom = true;
        eventEmitter.emit('update', this.id);
      }
    });
  }
  
  public PREPARE() {
    this._counter = 5;
    this.lastNumber = 5;
    this._players[0].color = Owner.black;
    this._players[1].color = Owner.blue;
    this._players[0].inventory = {
      clay: 3, forrest: 3, stone: 3, sheep: 3, wheat: 3
    }
    this._players[1].inventory = {
      clay: 3, forrest: 3, stone: 3, sheep: 3, wheat: 3
    }
    this.start();
    this.gameboard?.PREPARE();
    this.debutMode = false;
  }
  
  public PREPARE2() {
    this.playWithRobber = true;
    this._counter = 9;
    this.lastNumber = 10;
    this._players[0].color = Owner.black;
    this._players[1].color = Owner.blue;
    this._players[0].victoryPoints = 3;
    this._players[1].victoryPoints = 4;
    this._players[0].inventory = {
      clay: 5, forrest: 5, stone: 5, sheep: 5, wheat: 5
    }
    this._players[1].inventory = {
      clay: 5, forrest: 5, stone: 5, sheep: 5, wheat: 5
    }
    this.start();
    this.gameboard?.PREPARE2(this._players);
    this.debutMode = false;
  }
  
  
  get haveStarted(): boolean {return this._haveStarted; }
  
  
  get activePlayer(): Player | undefined {return this._activePlayer;}
  
  set activePlayer(player: Player) {
    this._activePlayer = player;
    this._eventEmitter.emit('update', this.id);
  }
  
  
  get counter(): number {return this._counter;}
  
  nextTurn(): void {
    this._counter++;
    if (this.debutMode && this._counter > this._players.length * 2) this.debutMode = false;
  }
  
  // предполагается что при вызове _counter уже инкрементирован
  nextPlayer(): Player {
    if (this._counter <= this._players.length || !this.debutMode) {
      return this._players[(this._counter - 1) % this._players.length];
    } else {
      return this._players[this._players.length * 2 - this._counter];
    }
  }
  
  
  // выдать игроку по имени случайным образом карту развития
  private _giveDevelopmentCardToPlayer(player: Player): boolean {
    const card = this._developmentCardDeck.pop();
    console.log(card);
    if (player !== this.activePlayer || card === undefined) return false;
    switch (card) {
      case DevelopmentCard.Knight: player.addedDevelopmentCards.Knights++; break;
      case DevelopmentCard.VictoryPoint: player.victoryPoints++; break;
      case DevelopmentCard.RoadBuilding: player.addedDevelopmentCards.RoadBuildings++; break;
      case DevelopmentCard.Invention: player.addedDevelopmentCards.Inventions++; break;
      case DevelopmentCard.Monopoly: player.addedDevelopmentCards.Monopolies++; break;
    }
    return true;
  }
  
  GiveDevelopmentCardToPlayer(playerName: string): boolean {
    const player = this._players.find((player: Player): boolean => player.username === playerName);
    if (!player) return false;
    
    const priceCalculator: PriceCalculator = new PriceCalculator();
    priceCalculator.AddDevelopmentCard(1);
    if (priceCalculator.DoesPlayerHaveEnoughResources(player) && this._giveDevelopmentCardToPlayer(player)) {
      this.borrowResourcesFromPlayer(playerName, priceCalculator)
      this._eventEmitter.emit('update', this.id);
      return true;
    }
    return false;
  }
  
  MoveRobber(coords: Coords, playerName: string): void {
    if (!this.robberShouldBeMoved) return;
    const player = this._players.find((player: Player): boolean => player.username === playerName);
    if (!player || player !== this._activePlayer) return;
    
    if (this.gameboard?.MoveRobber(coords)) {
      this.robberShouldBeMoved = false;
      this.debtors = this.gameboard?.PlayersAtRobbersPosition(this.players);
      if (this.debtors.length === 1) {
        this.TransferOneRandomResource(playerName, this.debtors[0]);
        this.debtors = [];
      }
      this._eventEmitter.emit('update', this.id);
    }
  }
  
  TransferOneRandomResource(playerName1: string, playerName2: string): boolean {
    const player1 = this._players.find(p => p.username === playerName1);
    const player2 = this._players.find(p => p.username === playerName2);
    if (!player1 || !player2) return false;
    
    const availableResources: (keyof Inventory)[] = [];
    (['clay', 'forrest', 'sheep', 'stone', 'wheat'] as (keyof Inventory)[]).forEach(resource => {
      if (player2.inventory[resource] > 0) availableResources.push(resource);
    });
    
    if (availableResources.length === 0) return true;
    
    const randomIndex = Math.floor(Math.random() * availableResources.length);
    const stolenResource = availableResources[randomIndex];
    
    player2.inventory[stolenResource]--;
    player1.inventory[stolenResource]++;
    return true;
  }
  
  
  start(): void {
    if (this._haveStarted) return;
    
    this._haveStarted = true;
    this.debutMode = true;
    this.gameboard = new Gameboard();
    this.purchases = new PurchaseService(this._players, this._eventEmitter, this.id);
    
    if (!this.playWithRobber) this.gameboard.TurnRobberOff();
    
    this._players.forEach((player: Player): void => {
      player.freeRoads = 1;
      player.freeVillages = 1;
      this._eventEmitter.emit(`room-started-${player.username}`, this);
    });
    
    this._activePlayer = this._players[0];
    this._eventEmitter.emit('update', this.id);
  }
  
  
  GettingRobed(): void {
    this._players.forEach((player: Player): void => {
      player.GettingRobed();
    })
  }
}
