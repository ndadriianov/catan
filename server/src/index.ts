import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {ConnectionStatus, LoginStatus, User} from './typesDefinitions/User';
import {Room} from './typesDefinitions/Room';
import {EventEmitter} from 'node:events';
import {updateProps, Player, Coords} from './typesDefinitions/Player';
import {Gameboard, Owner} from './typesDefinitions/Gameboard';
import {PriceCalculator} from './typesDefinitions/PriceCalculator';
import {resourceTypes} from './typesDefinitions/Purchase';


const PORT = 4000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Адрес вашего клиента
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

// срабатывает когда изменяет список пользователей, либо haveStarted в комнате, аргумент - id данной комнаты
eventEmitter.on('update', (id: number): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  //console.log(room);
  //console.log(room?.toJSON());
  if (room) io.to(id.toString()).emit('room-update', room.toJSON());
});
eventEmitter.on('purchase-update', (id: number): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  if (room) io.to(id.toString()).emit('purchase-update', room.purchases?.toJSON());
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
      if (room.hasStarted && room.isInRoom(socket.data.user.username)) {
        eventEmitter.emit('update-user-status', socket.data.user.username, socket.data.user._status);
        socket.data.user.activeRoom = room;
      }
      callback(room.toJSON());
      
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
  
  
  socket.on('end-turn', (update: updateProps, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) return;
    
    if (!socket.data.user.activeRoom) {
      callback(false);
      return;
    }
    
    const room: Room = socket.data.user.activeRoom;
    const player: Player|undefined = room.players.find(p => p.username === socket.data.user.username);
    const color: Owner|undefined = player?.color;
    
    if (!player || !color || !room.hasStarted || !room.gameboard || room.activePlayer?.username !== socket.data.user.username) {
      callback(false);
      return;
    }
    const gameboard: Gameboard = room.gameboard;
    
    let isSuccessful: boolean = true;
    
    
    /*********
     * ДЕБЮТ *
     *********/
    if (room.debutMode) {
      if (!(update.roads.length === 1 && update.villages.length === 1 && update.cities.length === 0)) {
        console.log('несоответствие параметров');
        callback(false);
        return;
      }
      
      if (room.gameboard.DebutCheckVillage(update.villages[0], color)) {
        room.gameboard.PlaceVillage(update.villages[0], player.color);
      } else {
        isSuccessful = false;
        console.log('ошибка при добавлении здания');
      }
      
      if (isSuccessful && room.gameboard.CheckRoad(update.roads[0], color)) {
        room.gameboard.PlaceRoad(update.roads[0], color);
      } else {
        console.log('ошибка при добавлении дороги');
        room.gameboard.Undo();
        isSuccessful = false;
      }
      
      room.gameboard.ClearUndo();
      
      
      /*****************
       * ОСНОВНАЯ ИГРА *
       *****************/
    }
    else {
      if (room.robberShouldBeMoved || !room.activePlayer?.threwTheDice || room.debtors.length > 0) {
        callback(false);
        return;
      }
      
      const priceCalculator: PriceCalculator = new PriceCalculator();
      priceCalculator.AddRoad(update.roads.length);
      priceCalculator.AddVillage(update.villages.length);
      priceCalculator.AddCity(update.cities.length);
      
      if (!priceCalculator.DoesPlayerHaveEnoughResources(player)
        || !room.borrowResourcesFromPlayer(player.username, priceCalculator)) {
        console.log('пользователю нехватает ресурсов');
        callback(false);
        return;
      }
      
      
      // добавление дорог
      try {
        let processedRoadsCounter: number = 0;
        let prevProcessedRoadsCounter: number = 0;
        const processedRoads: boolean[] = new Array(update.roads.length).fill(false);
        do {
          update.roads.forEach((road: Coords, index: number): void => {
            prevProcessedRoadsCounter = processedRoadsCounter;
            if (!processedRoads[index] && gameboard.CheckRoad(road, color)) {
              gameboard.PlaceRoad(road, color);
              processedRoads[index] = true;
              processedRoadsCounter++;
            }
          })
        } while (processedRoadsCounter > prevProcessedRoadsCounter);
        
        if (processedRoadsCounter !== update.roads.length) {
          throw new Error('road unavailable');
        }
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
        else console.log('возникла неизвестная ошибка при добавлении дорог!');
        isSuccessful = false;
        gameboard.Undo();
      }
      
      
      // добавление поселений
      try {
        update.villages.forEach((village: Coords): void => {
          if (isSuccessful && gameboard.CheckVillage(village, color)) { // проверка room.gameboard есть раньше, здесь написал чтобы компилятор не ругался
            gameboard.PlaceVillage(village, player.color);
          } else {
            throw new Error('village unavailable!');
          }
        })
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
        else console.log('возникла неизвестная ошибка при добавлении поселений!');
        isSuccessful = false;
        gameboard.Undo();
      }
      
      // добавление городов
      try {
        update.cities.forEach((city: Coords): void => {
          if (isSuccessful && gameboard.CheckCity(city, color)) {
            gameboard.PlaceCity(city, color);
          } else {
            throw new Error('city unavailable!');
          }
        })
      }catch (error) {
        if (error instanceof Error) console.log(error.message);
        else console.log('возникла неизвестная ошибка при добавлении городов!');
        isSuccessful = false;
        gameboard.Undo();
      }
      
      gameboard.ClearUndo();
    }
    
    
    if (isSuccessful) {
      room.nextTurn();
      room.activePlayer?.ApplyAdditionDevCards();
      room.activePlayer = room.nextPlayer();
      room.activePlayer.threwTheDice = false;
      gameboard.ApprovePorts(room.playersByLink);
      room.purchases?.endTurn();
      eventEmitter.emit('update', room.id);
    }
    
    
    /*
    console.log(update);
    console.log(room.gameboard);
    room.players.forEach((p: Player): void => {console.log(p.inventory); console.log(p.ports)})
    console.log(isSuccessful);
     */
    
    callback(isSuccessful);
  });
  
  
  
  socket.on('refresh-room', (id: number): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (room) socket.emit('room-update', room.toJSON());
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
    if (!checkIsAuth({socket, callback})) return;
    const user: User = socket.data.user;
    
    if (!user.activeRoom || !user.activeRoom.hasStarted) {
      callback(false);
      return;
    }
    const room: Room = socket.data.user.activeRoom;
    callback(room.GiveDevelopmentCardToPlayer(user.username));
  })
  
  
  socket.on('move-robber', (coords: Coords): void => {
    if (!checkIsAuth({socket})) return;
    const user: User = socket.data.user;
    
    if (!user.activeRoom || !user.activeRoom.hasStarted) return;
    const room: Room = user.activeRoom;
    room.MoveRobber(coords, user.username);
  })
  
  
  socket.on('throw-the-dice', (): void => {
    if (!checkIsAuth({socket}) || !socket.data.user.activeRoom) return;
    const user: User = socket.data.user;
    const room: Room = socket.data.user.activeRoom;
    const player = room.playersByLink.find(p => p.username === user.username);
    
    if (!user.activeRoom || !room.hasStarted || room.activePlayer?.username !== user.username || !room.gameboard || !player || player.threwTheDice || room.debutMode) return;
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
    
    if (!user.activeRoom || !room.hasStarted || room.activePlayer?.username !== user.username || !room.gameboard) {
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
    if (!room.hasStarted) {
      room.playWithRobber = playWithRobber;
      eventEmitter.emit('update', room.id);
    }
  })
  
  
  /*socket.on('debut-end-turn', (debutData: any, callback: (succeed: boolean) => void): void => {
    if (!checkIsAuth({socket, callback})) {
      callback(false);
      return;
    }
    const room: Room = socket.data.user.activeRoom;
    const color: Owner|undefined = room.players.find(p => p.username === socket.data.user.username)?.color;
    if (!color) {
      callback(false);
      return;
    }
    
    console.log('debut-turn', debutData);
    if (room.gameboard) {
      console.log(room.gameboard.DebutCheckVillage(debutData.village, color));
      
      if (room.gameboard.DebutCheckVillage(debutData.village, color)) {
        room.gameboard.PlaceVillage(debutData.village, color);
        
        console.log(room.gameboard.CheckRoad(debutData.road, color));
        room.gameboard.PlaceRoad(debutData.road, color);
      }
    }
    // check !!
    // place !!
  })
  */
  
  
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
