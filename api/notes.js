// ──────────────────────────────────────────────────────────────────────────
// STICKY NOTES API HANDLER (VERCEL / NETLIFY / VITE DEV MIDDLEWARE)
// ──────────────────────────────────────────────────────────────────────────

import { connectToDatabase, getStickyNotesCollection } from '../server/db.js';

export async function handleNotesRequest(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const { db } = await connectToDatabase();
  const collection = getStickyNotesCollection(db);

  // 1. GET ALL NOTES
  if (req.method === 'GET') {
    if (!collection) {
      // Fallback empty response with flag
      res.statusCode = 200;
      res.end(JSON.stringify({ notes: [], fallback: true }));
      return;
    }

    try {
      const notes = await collection
        .find({})
        .sort({ createdAt: 1 })
        .toArray();

      // Normalize _id to string id
      const formatted = notes.map((n) => ({
        id: n.noteId || n._id.toString(),
        author: n.author || 'ANONYMOUS',
        date: n.date || 'TODAY',
        color: n.color || 'yellow',
        pinColor: n.pinColor || n.color || 'yellow',
        text: n.text || '',
        x: typeof n.x === 'number' ? n.x : 10,
        y: typeof n.y === 'number' ? n.y : 10,
        createdAt: n.createdAt,
      }));

      res.statusCode = 200;
      res.end(JSON.stringify({ notes: formatted, live: true }));
    } catch (err) {
      console.error('[API] GET /api/notes error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message, fallback: true }));
    }
    return;
  }

  // Parse Body Helper (Compatible with Vercel pre-parsed body & raw Node streams)
  const body = await parseBody(req);

  // 2. CREATE A NEW NOTE
  if (req.method === 'POST') {
    if (!collection) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'MongoDB database not connected. Please verify MONGODB_URI in environment variables.' }));
      return;
    }

    try {
      const text = (body.text || '').trim().slice(0, 240);
      if (!text) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Note text cannot be empty' }));
        return;
      }

      const noteDoc = {
        noteId: body.id || Date.now().toString(),
        author: (body.author || 'VISITOR').toUpperCase().slice(0, 20),
        date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        color: body.color || 'yellow',
        pinColor: body.pinColor || body.color || 'yellow',
        text,
        x: typeof body.x === 'number' ? body.x : 50,
        y: typeof body.y === 'number' ? body.y : 50,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(noteDoc);
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, note: { ...noteDoc, _id: result.insertedId } }));
    } catch (err) {
      console.error('[API] POST /api/notes error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. UPDATE A NOTE (POSITION / CONTENT)
  if (req.method === 'PUT') {
    if (!collection) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'MongoDB database not connected.' }));
      return;
    }

    try {
      const targetId = body.id || body.noteId;
      if (!targetId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing note id' }));
        return;
      }

      const updateFields = {};
      if (typeof body.x === 'number') updateFields.x = body.x;
      if (typeof body.y === 'number') updateFields.y = body.y;
      if (typeof body.text === 'string') updateFields.text = body.text.slice(0, 240);
      if (body.color) updateFields.color = body.color;
      if (body.pinColor) updateFields.pinColor = body.pinColor;
      updateFields.updatedAt = new Date();

      await collection.updateOne(
        { $or: [{ noteId: targetId }, { _id: targetId }] },
        { $set: updateFields }
      );

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, updated: updateFields }));
    } catch (err) {
      console.error('[API] PUT /api/notes error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4. DELETE A NOTE
  if (req.method === 'DELETE') {
    if (!collection) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: 'MongoDB database not connected.' }));
      return;
    }

    try {
      const targetId = body.id || req.url.split('/').pop();
      if (targetId) {
        await collection.deleteOne({ $or: [{ noteId: targetId }, { _id: targetId }] });
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error('[API] DELETE /api/notes error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}

function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return Promise.resolve(req.body);
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch (_) {
        return Promise.resolve({});
      }
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (_) {
        resolve({});
      }
    });
    setTimeout(() => {
      if (!data) resolve({});
    }, 500);
  });
}

// Default export for Vercel Serverless Function
export default handleNotesRequest;
