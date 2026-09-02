// ──────────────────────────────────────────────────────────────────────────
// MONGODB CONNECTION POOL & CLIENT CACHE (FOR VITE / NODE / SERVERLESS)
// ──────────────────────────────────────────────────────────────────────────

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_URI = 'mongodb+srv://defidecoder13_db_user:cpNoZAxRxehq4R22@cluster0.cqkmbwz.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0';
const uri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.MONGODB_DB_NAME || 'portfolio';

let cachedClient = null;
let cachedDb = null;
let isConnecting = false;

export async function connectToDatabase() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const activeUri = process.env.MONGODB_URI || uri;
  if (!activeUri || activeUri.includes('<db_username>')) {
    console.warn('[MongoDB] MONGODB_URI is not configured.');
    return { client: null, db: null };
  }

  if (isConnecting) {
    while (isConnecting) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (cachedDb) return { client: cachedClient, db: cachedDb };
  }

  try {
    isConnecting = true;
    const client = new MongoClient(activeUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    isConnecting = false;

    console.log(`[MongoDB] Connected successfully to database: ${dbName}`);
    return { client, db };
  } catch (err) {
    isConnecting = false;
    console.error('[MongoDB] Connection error:', err.message);
    return { client: null, db: null, error: err };
  }
}

export function getStickyNotesCollection(db) {
  return db ? db.collection('sticky_notes') : null;
}
