import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {ConnectionStatus, LoginStatus, User} from './typesDefinitions/User';
import {Room} from './typesDefinitions/Room';
import {EventEmitter} from 'node:events';
import {Coords, Player} from './typesDefinitions/Player';
import {Owner} from './typesDefinitions/Gameboard';
import {PriceCalculator} from './typesDefinitions/PriceCalculator';
import {resourceTypes} from './typesDefinitions/Purchase';
import {saveRoom, setupAndSaveUser, test} from './InteractionWithDB';


const PORT = 4000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

const eventEmitter = new EventEmitter();

const users: Array<User> = [];
const rooms: Array<Room> = [];

//////////

users.push(new User('a', 'a', eventEmitter));
users.push(new User('q', 'q', eventEmitter));

rooms.push(new Room(1, eventEmitter));
rooms[0].addPlayer(users[0].username);
rooms[0].addPlayer(users[1].username);
users[0].activeRoom = rooms[0];
users[1].activeRoom = rooms[0];

rooms[0].PREPARE2();

//////////
/*
test(rooms[0], users)
  .then(() => {
    console.log('Test completed successfully');
    console.log('Proceeding with the rest of the program...');
  })
  .catch(error => {
    console.error('Error during test execution:', error);
  });
*/



// срабатывает когда изменяет список пользователей, либо haveStarted в комнате, аргумент - id данной комнаты
eventEmitter.on('update', (id: number): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  if (room) io.to(id.toString()).emit('room-update', room.toJSON_forClient());
});
eventEmitter.on('purchase-update', (id: number): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  if (room) io.to(id.toString()).emit('purchase-update', room.purchases?.toJSON());
})
eventEmitter.on('win', (id: number, username: string): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  if (room) {
    io.to(id.toString()).emit('win', username);
  }
})



io.on('connection', (socket: Socket): void => {
  console.log(`Client connected: ${socket.id}`);
  
  eventEmitter.on('prepare-update-room-list', (): void => {
    if (socket.data.user) socket.emit('update-room-list', prepareRoomIdLists(socket.data.user));
  });
  
  /*********************************************************************************************************************
  * Взаимодействие в меню
  *********************************************************************************************************************/
  
  // Срабатывает когда пользователь создает аккаунт, одновременно с этим пользователь входит в аккаунт. Логика, связанная с login здесь не используется
  socket.on('register', (username: string, password: string, callback: (isAvailable: boolean) => void): void => {
    if (!users.find((user: User): boolean => user.username === username)) {
      const user: User = new User(username, password, eventEmitter);
      users.push(user);
      socket.data.user = user;
      eventEmitter.on(`inform-about-deal-${user.username}`, (partner: string, succeed: boolean): void => {
        socket.emit('inform-about-deal', partner, succeed);
      });
      callback(true);
    } else {
      callback(false);
    }
  });
  
  // срабатывает когда пользователь входит в аккаунт
  socket.on('login', (username: string, password: string, callback: (succeed: LoginStatus) => void): void => {
    const user: User|undefined = users.find((user: User): boolean => user.username === username);
    if (user && user.password === password) {
      if (user.status !== ConnectionStatus.Green) { // пользователь не должен иметь текущей активности
        user.status = ConnectionStatus.Green; // восстановление соединения и подключение после долгой паузы
        socket.data.user = user;
        eventEmitter.on(`inform-about-deal-${user.username}`, (partner: string, succeed: boolean): void => {
          socket.emit('inform-about-deal', partner, succeed);
        });
        callback(LoginStatus.Success);
      } else {
        callback(LoginStatus.Duplicate)
      }
    } else {
      callback(LoginStatus.Incorrect);
    }
  });
  
  // срабатывает когда пользователь выходит из аккаунта
  socket.on('logout', () => {
    if (socket.data.user) {
      eventEmitter.removeAllListeners(`inform-about-deal-${socket.data.user.username}`)
      socket.data.user.status = ConnectionStatus.Red;
      socket.data.user = null;
    }
  })
  
  // срабатывает когда пользователь заходит на страницу выбора комнат
  socket.on('show-rooms', (callback: (res: {currentRoomIds: number[], otherRoomIds: number[]}) => void): void => {
    if (checkIsAuth({socket})) callback(prepareRoomIdLists(socket.data.user));
    else callback({currentRoomIds: [], otherRoomIds: []});
  });
  
  // срабатывает когда пользователь создает комнату
  socket.on('create-room', (id: number, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    if (rooms.find((room: Room): boolean => room.id === id)) {
      callback(false);
      return;
    }
    const room: Room = new Room(id, eventEmitter);
    rooms.push(room);
    room.addPlayer(socket.data.user.username);
    eventEmitter.emit('prepare-update-room-list'); // обновление списка комнат для пользователей
    socket.data.user.activeRoom = room;
    socket.join(id.toString());
    callback(true);
  });
  
  // срабатывает когда пользователь заходит в комнату, но не присоединяется
  socket.on('load-room', (id: number, callback: (currentRoom: any) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (room) {
      socket.join(id.toString());
      if (room.haveStarted && room.isInRoom(socket.data.user.username)) {
        eventEmitter.emit('update-user-status', socket.data.user.username, socket.data.user._status);
        socket.data.user.activeRoom = room;
      }
      callback(room.toJSON_forClient());
      
    } else {
      callback(undefined);
    }
  });
  
  // срабатывает когда пользователь выходит из комнаты, если он к ней присоединился, он из нее удаляется
  // если игра началась, то пользователь получает серый статус в комнате (leftTheRoom === true)
  socket.on('go-back-to-choose', (id: number): void => {
    if (!checkIsAuth({socket})) return;
    socket.leave(id.toString());
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (room) {
      if (!room.removePlayer(socket.data.user.username)) socket.data.user.activeRoom = null;
    }
  })
  
  // срабатывает когда пользователь присоединяется к комнате (не путать с 'load room')
  socket.on('join-room', (id: number, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (!room) {
      callback(false);
      return;
    }
    if (room.addPlayer(socket.data.user.username)) {
      socket.data.user.activeRoom = room;
      callback(true);
    }
    callback(false);
  });
  
  
  /*********************************************************************************************************************
   * Игровой процесс
   *********************************************************************************************************************/
  
  
  // пользователь выбирает цвет
  socket.on('apply-color', (color: Owner): void => {
    if (!checkIsAuth({socket})) return;
    
    if (socket.data.user.activeRoom) socket.data.user.activeRoom.setColor(color, socket.data.user.username);
  });
  
  
  socket.on('change-win', (points: number): void => {
    if (!checkIsAuth({socket})) return;
    
    if (socket.data.user.activeRoom && points >= 3 && points <= 20) {
      socket.data.user.activeRoom.pointsToWin = points;
      eventEmitter.emit('update', socket.data.user.activeRoom.id);
    }
  })
  
  // срабатывает когда пользователь(в будущем - только создатель комнаты) нажимает на кнопку начать игру
  socket.on('start-room', (id: number, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket})) return;
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    
    if (room) {
      const colorCounts = new Map<Owner, number>();
      room.players.forEach((player: Player) => {
        colorCounts.set(player.color, (colorCounts.get(player.color) || 0) + 1);
      });
      if (Array.from(colorCounts.values()).some(count => count > 1)) callback(false)
      else if (room.players.some((p: Player): boolean => p.color === Owner.nobody)) callback(false)
      else {
        callback(true);
        room.start();
      }
    }
  });
  
  
  socket.on('end-turn', (callback: (succeed: boolean) => void): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket, callback});
    if (!data || !data.room.gameboard) {
      callback(false);
      return;
    }
    
    if (data.room.debutMode) {
      if (data.player.freeRoads > 0 || data.player.freeVillages > 0) {
        callback(false);
        return;
      }
    } else {
      if (data.room.robberShouldBeMoved || !data.room.activePlayer?.threwTheDice || data.room.debtors.length > 0) {
        callback(false);
        return;
      }
    }
    
    data.player.freeRoads = 0;
    data.room.nextTurn();
    data.room.activePlayer?.ApplyAdditionDevCards();
    data.room.activePlayer = data.room.nextPlayer();
    if (data.room.debutMode) {
      data.room.activePlayer.freeRoads = 1;
      data.room.activePlayer.freeVillages = 1;
    }
    data.room.activePlayer.threwTheDice = false;
    data.room.purchases?.endTurn();
    eventEmitter.emit('update', data.room.id);
    
    callback(true);
  });
  
  
  
  socket.on('refresh-room', (id: number): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (room) socket.emit('room-update', room.toJSON_forClient());
  });
  
  
  socket.on('propose-deal', (purchase: number[], sellerName: string, customerName: string, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    if (!socket.data.user.activeRoom) {
      callback(false);
      return;
    }
    
    const room: Room = socket.data.user.activeRoom;
    if (!room.purchases || room.activePlayer?.username !== sellerName) {
      callback(false);
      return;
    }
    
    callback(room.purchases.addPurchase(sellerName, customerName, purchase));
  });
  
  
  socket.on('accept-deal', (sellerName: string, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    if (!socket.data.user.activeRoom) {
      callback(false);
      return;
    }
    const room: Room = socket.data.user.activeRoom;
    if (!room.purchases) {
      callback(false);
      return;
    }
    const customerName: string = socket.data.user.username;
    const status: boolean = room.purchases.makePurchase(sellerName, customerName)
    callback(status);
    eventEmitter.emit(`inform-about-deal-${sellerName}`, socket.data.user.username, status);
  });
  
  
  socket.on('decline-deal', (sellerName: string, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    if (!socket.data.user.activeRoom) {
      callback(false);
      return;
    }
    const room: Room = socket.data.user.activeRoom;
    if (!room.purchases) {
      callback(false);
      return;
    }
    const customerName: string = socket.data.user.username;
    callback(room.purchases.deletePurchase(sellerName, customerName));
    eventEmitter.emit(`inform-about-deal-${sellerName}`, socket.data.user.username, false);
  })
  
  
  socket.on('deal-with-port', (resourceForSale: resourceTypes, resourceForPurchase: resourceTypes, amount: number, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    if (!socket.data.user.activeRoom || !socket.data.user.username
      || socket.data.user.username !== socket.data.user.activeRoom.activePlayer.username) {
      callback(false);
      return;
    }
    
    const username: string = socket.data.user.username;
    const room: Room = socket.data.user.activeRoom;
    const pc: PriceCalculator = new PriceCalculator();
    pc.DealWithPort(resourceForSale, resourceForPurchase, amount);
    
    callback(room.checkPlayersResources(username, pc) && room.borrowResourcesFromPlayer(username, pc));
  })
  
  
  socket.on('load-purchase', (callback: (jsonPurchases: any) => void): void => {
    if (!checkIsAuth({socket}) || !socket.data.user.activeRoom.purchases) {
      callback(undefined);
      return;
    }
    callback(socket.data.user.activeRoom.purchases.toJSON());
  })
  
  
  socket.on('buy-dev-card', (callback: (succeed: boolean) => void): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket, callback});
    if (!data || !data.room.haveStarted || !data.player.threwTheDice) {
      callback(false);
      return;
    }
    
    callback(data.room.GiveDevelopmentCardToPlayer(data.user.username))
  })
  
  
  socket.on('move-robber', (coords: Coords): void => {
    if (!checkIsAuth({socket})) return;
    const user: User = socket.data.user;
    
    if (!user.activeRoom || !user.activeRoom.haveStarted) return;
    const room: Room = user.activeRoom;
    room.MoveRobber(coords, user.username);
  })
  
  
  socket.on('throw-the-dice', (): void => {
    if (!checkIsAuth({socket}) || !socket.data.user.activeRoom) return;
    const user: User = socket.data.user;
    const room: Room = socket.data.user.activeRoom;
    const player = room.playersByLink.find(p => p.username === user.username);
    
    if (!user.activeRoom || !room.haveStarted || room.activePlayer?.username !== user.username || !room.gameboard || !player || player.threwTheDice || room.debutMode) return;
    room.lastNumber = room.gameboard.GiveResources(room.playersByLink);
    player.threwTheDice = true;
    
    if (room.lastNumber === 7 && room.playWithRobber) {
      room.robberShouldBeMoved = true;
      room.GettingRobed();
    }
    
    eventEmitter.emit('update', room.id);
  })
  
  
  socket.on('steal-resource', (victimName: string, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket}) || !socket.data.user.activeRoom) {
      callback(false);
      return;
    }
    const user: User = socket.data.user;
    const room: Room = socket.data.user.activeRoom;
    
    if (!user.activeRoom || !room.haveStarted || room.activePlayer?.username !== user.username || !room.gameboard) {
      callback(false);
      return;
    }
    if (room.TransferOneRandomResource(user.username, victimName)) {
      room.debtors = [];
      eventEmitter.emit('update', room.id);
      callback(true);
    } else callback(false);
  })
  
  
  socket.on('change-robber-mode', (playWithRobber: boolean): void => {
    if (!checkIsAuth({socket}) || !socket.data.user.activeRoom) return;
    const room: Room = socket.data.user.activeRoom;
    if (!room.haveStarted) {
      room.playWithRobber = playWithRobber;
      eventEmitter.emit('update', room.id);
    }
  })
  
  
  socket.on('activate-knight', (): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket});
    if (!data) return;
    
    if (!data.player.usedKnightThisTurn && !data.player.threwTheDice && data.room.playWithRobber && data.player.developmentCards.Knights > 0) {
      data.room.robberShouldBeMoved = true;
      data.player.developmentCards.Knights--;
      data.player.usedKnightsAmount++;
      
      if (data.player.usedKnightsAmount > data.room.largestArmy) {
        data.room.largestArmy = data.player.usedKnightsAmount;
        if (data.player.usedKnightsAmount >= 3) {
          if (data.room.playerWithTheLargestArmy) {
            data.room.playerWithTheLargestArmy.hasLargestArmy = false;
            data.room.playerWithTheLargestArmy.victoryPoints -= 2;
          }
          data.room.playerWithTheLargestArmy = data.player;
          data.player.victoryPoints += 2;
          data.player.hasLargestArmy = true;
        }
      }
      
      eventEmitter.emit('update', data.room.id);
    }
  })
  
  
  socket.on('activate-road-building', (): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket});
    if (!data) return;
    
    if (data.player.threwTheDice && data.player.developmentCards.RoadBuildings > 0) {
      data.player.freeRoads = 2;
      data.player.developmentCards.RoadBuildings--;
      eventEmitter.emit('update', data.room.id);
    }
  })
  
  
  socket.on('activate-invention', (resource1: resourceTypes, resource2: resourceTypes): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket});
    if (!data) return;
    
    if (data.player.threwTheDice && data.player.developmentCards.Inventions > 0) {
      data.player.developmentCards.Inventions--;
      switch (resource1) {
        case resourceTypes.clay: data.player.inventory.clay++; break;
        case resourceTypes.forrest: data.player.inventory.forrest++; break;
        case resourceTypes.sheep: data.player.inventory.sheep++; break;
        case resourceTypes.stone: data.player.inventory.stone++; break;
        case resourceTypes.wheat: data.player.inventory.wheat++; break;
      }
      switch (resource2) {
        case resourceTypes.clay: data.player.inventory.clay++; break;
        case resourceTypes.forrest: data.player.inventory.forrest++; break;
        case resourceTypes.sheep: data.player.inventory.sheep++; break;
        case resourceTypes.stone: data.player.inventory.stone++; break;
        case resourceTypes.wheat: data.player.inventory.wheat++; break;
      }
      
      eventEmitter.emit('update', data.room.id);
    }
  })
  
  
  socket.on('activate-monopoly', (resource: resourceTypes): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket});
    if (!data) return;
    
    if (data.player.threwTheDice && data.player.developmentCards.Monopolies > 0) {
      data.player.developmentCards.Monopolies--;
      data.room.playersByLink.forEach((player: Player): void => {
        if (player.username !== data.player.username) {
          switch (resource) {
            case resourceTypes.clay: data.player.inventory.clay += player.inventory.clay; player.inventory.clay = 0; break;
            case resourceTypes.forrest: data.player.inventory.forrest += player.inventory.forrest; player.inventory.forrest = 0; break;
            case resourceTypes.sheep: data.player.inventory.sheep += player.inventory.sheep; player.inventory.sheep = 0; break;
            case resourceTypes.stone: data.player.inventory.stone += player.inventory.stone; player.inventory.stone = 0; break;
            case resourceTypes.wheat: data.player.inventory.wheat += player.inventory.wheat; player.inventory.wheat = 0; break;
          }
        }
      });
      eventEmitter.emit('update', data.room.id);
    }
  })
  
  
  socket.on('buy-road', (coords: Coords, callback: (succeed: boolean) => void): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket, callback});
    if (!data) return;
    
    if (!data.room.gameboard || !data.room.gameboard.CheckRoad(coords, data.player.color)
      || !((data.player.threwTheDice) || data.room.debutMode)) {
      callback(false);
      return;
    }
    
    if (data.player.freeRoads > 0) data.player.freeRoads--;
    else {
      const priceCalculator: PriceCalculator = new PriceCalculator();
      priceCalculator.AddRoad(1);
      if (!priceCalculator.DoesPlayerHaveEnoughResources(data.player)
        || !data.room.borrowResourcesFromPlayer(data.player.username, priceCalculator)) {
        callback(false);
        return;
      }
    }
    
    data.room.gameboard.PlaceRoad(coords, data.player.color);
    callback(true);
    UpdateLongestRoad(data);
    eventEmitter.emit('update', data.room.id);
  });
  
  
  socket.on('buy-village', (coords: Coords, callback: (succeed: boolean) => void): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket, callback});
    if (!data) return;
    
    if (!data.room.gameboard) {
      callback(false);
      return;
    }
    if (!(data.room.debutMode && data.room.gameboard.DebutCheckVillage(coords, data.player.color))
        &&
       (!(data.room.gameboard.CheckVillage(coords, data.player.color) && data.player.threwTheDice))) {
      callback(false);
      return;
    }
    
    if (data.player.freeVillages > 0) data.player.freeVillages--;
    else {
      const priceCalculator: PriceCalculator = new PriceCalculator();
      priceCalculator.AddVillage(1);
      if (!priceCalculator.DoesPlayerHaveEnoughResources(data.player)
        || !data.room.borrowResourcesFromPlayer(data.player.username, priceCalculator)) {
        callback(false);
        return;
      }
    }
    
    data.room.gameboard.PlaceVillage(coords, data.player.color);
    data.room.gameboard.ApprovePorts(data.room.playersByLink);
    data.player.victoryPoints++;
    callback(true);
    eventEmitter.emit('update', data.room.id);
  });
  
  
  socket.on('buy-city', (coords: Coords, callback: (succeed: boolean) => void): void => {
    const data = GetAndCheckUserActivePlayerRoom({socket, callback});
    if (!data) return;
    
    if (!data.room.gameboard || !data.room.gameboard.CheckCity(coords, data.player.color) || !data.player.threwTheDice) {
      callback(false);
      return;
    }
    
    const priceCalculator: PriceCalculator = new PriceCalculator();
    priceCalculator.AddCity(1);
    if (!priceCalculator.DoesPlayerHaveEnoughResources(data.player)
      || !data.room.borrowResourcesFromPlayer(data.player.username, priceCalculator)) {
      callback(false);
      return;
    }
    
    data.room.gameboard.PlaceCity(coords, data.player.color);
    data.player.victoryPoints++;
    callback(true);
    eventEmitter.emit('update', data.room.id);
  })
  
  
  /*********************************************************************************************************************
   * Отключение
   *********************************************************************************************************************/
  
  // пользователь отключился (закрыл страницу/перезагрузил/у него пропал интернет)
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    if (socket.data.user) {
      socket.data.user.status = ConnectionStatus.Yellow;
      eventEmitter.removeAllListeners(`inform-about-deal-${socket.data.user.username}`);
    }
  });
  
  // ниже disconnect только временные тестовые события, не влияющие на работу приложения
  socket.on('log-room', (id: number): void => {
    console.log(rooms.find((room: Room): boolean => room.id === id));
    console.log('-------------------------------------------------');
    console.log(users);
  });
  
  socket.on('test-room-lists', (): void => {
    console.log(prepareRoomIdLists(socket.data.user));
  });
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


type checkIsAuthProps = {
  socket: Socket;
  callback?: (succeed: boolean) => void
}

function checkIsAuth({socket, callback} : checkIsAuthProps): boolean {
  if (!socket.data.user) {
    if (callback) callback(false);
    socket.emit('reauthorization-required');
    return false;
  }
  return true;
}

function prepareRoomIdLists(user: User): {currentRoomIds: number[], otherRoomIds: number[]} {
  const currentRoomIds: number[] = user.participatingRooms.map((room: Room): number => room.id);
  const allRoomIds: number[] = rooms.map((room: Room): number => room.id);
  const otherRoomIds: number[] = allRoomIds.filter((id: number): boolean => {
    return !currentRoomIds.some((otherId: number): boolean => id === otherId);
  })
  return {currentRoomIds, otherRoomIds};
}


type _ = {
  user: User;
  room: Room;
  player: Player;
}

function GetAndCheckUserActivePlayerRoom({socket, callback}: checkIsAuthProps): _|undefined {
  if (!checkIsAuth({socket, callback})) return undefined;
  
  const user: User = socket.data.user;
  const room: Room = socket.data.user.activeRoom;
  const player = room.activePlayer;
  
  if (player === undefined || player.username !== user.username) {
    if (callback) callback(false);
    return undefined;
  }
  return {
    user: user,
    room: room,
    player: player,
  }
}

function GetAndCheckUserPlayerRoom({socket, callback}: checkIsAuthProps): _|undefined {
  if (!checkIsAuth({socket, callback})) return undefined;
  
  const user: User = socket.data.user;
  const room: Room = socket.data.user.activeRoom;
  const player = room.playersByLink.find(p => p.username === user.username);
  
  if (player === undefined) return undefined;
  return {
    user: user,
    room: room,
    player: player,
  }
}

function UpdateLongestRoad(data: _): void {
  if (!data.room.gameboard) return;
  const longestRoad = data.room.gameboard.LongestRoad(data.player.color);
  if (longestRoad > data.room.longestRoad) {
    data.room.longestRoad = longestRoad;
    if (longestRoad >= 5) {
      if (data.room.playerWithTheLongestRoad) {
        data.room.playerWithTheLongestRoad.hasLongestRoad = false;
        data.room.playerWithTheLongestRoad.victoryPoints -= 2;
      }
      data.room.playerWithTheLongestRoad = data.player;
      data.player.victoryPoints += 2;
      data.player.hasLongestRoad = true;
    }
  }
}