import {Pool} from 'pg';
import {User} from './typesDefinitions/User';
import {EventEmitter} from 'node:events';
import {Room, RoomOptions} from './typesDefinitions/Room';
import {Player, PlayerOptions} from './typesDefinitions/Player';
import {Gameboard, GameboardOptions} from './typesDefinitions/Gameboard';


const pool = new Pool({
  user: 'postgres',
  password: '34',
  host: 'localhost',
  port: 5432,
  database: 'catan'
});


async function createTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(255) PRIMARY KEY,
            password VARCHAR(255) NOT NULL,
            participating_rooms INTEGER[] DEFAULT ARRAY[]::INTEGER[]
        );
    `);
    
    await client.query(`
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY,
            data JSONB DEFAULT '{}'::jsonb
        );
    `);
    
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_participating_rooms
        ON users USING GIN (participating_rooms);
    `);
    
    await client.query(`
        CREATE INDEX IF NOT EXISTS idx_rooms_data
        ON rooms USING GIN (data);
    `);
    
    await client.query('COMMIT');
    console.log('Tables created successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
    
  } finally {
    client.release();
  }
}


async function saveUser(user: User): Promise<void> {
  const client = await pool.connect();
  
  try {
    const participatingRoomsIds = user.participatingRooms.map(room => room.id);
    
    const query = `
        INSERT INTO users (username, password, participating_rooms)
        VALUES ($1, $2, $3)
            ON CONFLICT (username)
            DO UPDATE SET
            password = EXCLUDED.password,
            participating_rooms = EXCLUDED.participating_rooms;
    `;
    
    const values = [
      user.username,
      user.password,
      participatingRoomsIds
    ];
    
    await client.query(query, values);
    console.log(`User ${user.username} saved successfully`);
    
  } catch (error) {
    console.error(`Error saving user ${user.username}:`, error);
    throw error;
    
  } finally {
    client.release();
  }
}


export async function saveRoom(room: Room): Promise<void> {
  const client = await pool.connect();
  
  try {
    const roomData = room.toJSON();
    
    const query = `
        INSERT INTO rooms (id, data)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET
            data = EXCLUDED.data;
    `;
    
    const values = [
      room.id,
      JSON.stringify(roomData)
    ];
    
    await client.query(query, values);
    console.log(`Room ${room.id} saved successfully`);
    
  } catch (error) {
    console.error(`Error saving room ${room.id}:`, error);
    throw error;
    
  } finally {
    client.release();
  }
}


export async function getRooms(eventEmitter: EventEmitter): Promise<Room[]> {
  const client = await pool.connect();
  
  try {
    const query = `
        SELECT id, data FROM rooms;
    `;
    
    const result = await client.query(query);
    const rooms: Room[] = result.rows.map(row => {
      const roomData = row.data; // JSONB уже возвращается как объект
      
      // Проверка обязательных полей верхнего уровня
      const requiredRoomFields = [
        'lastNumber',
        'robberShouldBeMoved',
        'playWithRobber',
        'debtors',
        'longestRoad',
        'largestArmy',
        'players',
        'developmentCardDeck',
        'counter',
        'haveStarted',
        'pointsToWin'
      ];
      for (const field of requiredRoomFields) {
        if (roomData[field] === undefined || roomData[field] === null) {
          console.warn(`Room ${row.id} skipped: missing required field '${field}'`);
          return null;
        }
      }
      
      // Проверка массива players
      if (!Array.isArray(roomData.players)) {
        console.warn(`Room ${row.id} skipped: 'players' is not an array`);
        return null;
      }
      
      // Проверка каждого игрока
      const players = roomData.players.map((playerData: any) => {
        const requiredPlayerFields = [
          'username',
          'inventory',
          'status',
          'leftTheRoom',
          'color',
          'ports',
          'developmentCards',
          'addedDevelopmentCards',
          'threwTheDice',
          'usedKnightThisTurn',
          'usedKnightsAmount',
          'freeRoads',
          'freeVillages',
          'victoryPoints',
          'hasLongestRoad',
          'hasLargestArmy'
        ];
        for (const field of requiredPlayerFields) {
          if (playerData[field] === undefined || playerData[field] === null) {
            console.warn(`Room ${row.id} skipped: player missing required field '${field}'`);
            return null;
          }
        }
        
        const playerOptions: PlayerOptions = {
          inventory: playerData.inventory,
          status: playerData.status,
          leftTheRoom: playerData.leftTheRoom,
          color: playerData.color,
          ports: playerData.ports,
          developmentCards: playerData.developmentCards,
          addedDevelopmentCards: playerData.addedDevelopmentCards,
          threwTheDice: playerData.threwTheDice,
          usedKnightThisTurn: playerData.usedKnightThisTurn,
          usedKnightsAmount: playerData.usedKnightsAmount,
          freeRoads: playerData.freeRoads,
          freeVillages: playerData.freeVillages,
          victoryPoints: playerData.victoryPoints,
          hasLongestRoad: playerData.hasLongestRoad,
          hasLargestArmy: playerData.hasLargestArmy,
          pointsToWin: roomData.pointsToWin,
        };
        return new Player(playerData.username, eventEmitter, row.id, playerOptions);
      });
      
      // Если хотя бы один игрок не прошел проверку, пропускаем комнату
      if (players.some((p: Player|null) => p === null)) {
        return null;
      }
      
      // Проверка gameboard, если он есть
      if (roomData.gameboard) {
        const requiredGameboardFields = ['tiles', 'houses', 'roads', 'numbers', 'robberPosition'];
        for (const field of requiredGameboardFields) {
          if (roomData.gameboard[field] === undefined || roomData.gameboard[field] === null) {
            console.warn(`Room ${row.id} skipped: gameboard missing required field '${field}'`);
            return null;
          }
        }
      }
      
      // Формируем объект RoomOptions
      const options: RoomOptions = {
        lastNumber: roomData.lastNumber,
        robberShouldBeMoved: roomData.robberShouldBeMoved,
        playWithRobber: roomData.playWithRobber,
        debtors: roomData.debtors,
        longestRoad: roomData.longestRoad,
        largestArmy: roomData.largestArmy,
        playerWithTheLongestRoad: roomData.playerWithTheLongestRoad,
        playerWithTheLargestArmy: roomData.playerWithTheLargestArmy,
        counter: roomData.counter,
        haveStarted: roomData.haveStarted,
        pointsToWin: roomData.pointsToWin,
        developmentCardDeck: roomData.developmentCardDeck,
        players: players,
      };
      
      // Воссоздаем gameboard, если он присутствует
      if (roomData.gameboard) {
        const gameboardOptions: GameboardOptions = {
          tiles: roomData.gameboard.tiles,
          houses: roomData.gameboard.houses,
          roads: roomData.gameboard.roads,
          numbers: roomData.gameboard.numbers,
          robberPosition: roomData.gameboard.robberPosition,
        };
        options.gameboard = new Gameboard(gameboardOptions);
      }
      
      // Создаем экземпляр Room
      return new Room(row.id, eventEmitter, options);
    }).filter((room): room is Room => room !== null); // Фильтруем null значения
    
    console.log(`Retrieved ${rooms.length} rooms from database`);
    return rooms;
    
  } catch (error) {
    console.error('Error retrieving rooms:', error);
    throw error;
    
  } finally {
    client.release();
  }
}


export async function setupAndSaveUser() {
  try {
    await createTables();
    console.log('Database tables setup completed');
    
    const user = new User('testuser', 'testpass', new EventEmitter());
    user.participatingRooms = [
      { id: 1 } as any,
      { id: 2 } as any,
    ];
    
    await saveUser(user);
    console.log('User save operation completed');
    
  } catch (error) {
    console.error('Failed to complete setup and save:', error);
    throw error;
    
  } finally {
    await pool.end();
  }
}


export async function test(room: Room): Promise<void> {
  const eventEmitter = new EventEmitter();
  
  try {
    // Сохраняем комнату в базу данных
    await saveRoom(room);
    console.log(`Room ${room.id} saved for testing`);
    
    // Получаем все комнаты из базы данных
    const rooms = await getRooms(eventEmitter);
    
    // Выводим результат в консоль
    console.log('Rooms retrieved from database:');
    rooms.forEach((r, index) => {
      console.log(`Room ${index + 1}:`, r.toJSON());
    });
    
  } catch (error) {
    console.error('Error in test function:', error);
    throw error;
  }
}