import { Pool } from 'pg';
import {User} from './typesDefinitions/User';
import {EventEmitter} from 'node:events';
import {Room} from './typesDefinitions/Room';


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