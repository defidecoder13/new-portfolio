import { connectToDatabase, getStickyNotesCollection } from '../server/db.js';
import { ObjectId } from 'mongodb';

function getNoteQuery(targetId) {
  const conditions = [
    { noteId: String(targetId) },
    { id: String(targetId) },
  ];
  if (typeof targetId === 'string' && targetId.length === 24 && ObjectId.isValid(targetId)) {
    try {
      conditions.push({ _id: new ObjectId(targetId) });
    } catch (_) {}
  }
  return { $or: conditions };
}

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
        id: n.noteId || (n._id ? n._id.toString() : Date.now().toString()),
        noteId: n.noteId || (n._id ? n._id.toString() : ''),
        _id: n._id ? n._id.toString() : (n.noteId || ''),
        author: n.author || 'ANONYMOUS',
        date: n.date || 'TODAY',
        color: n.color || 'yellow',
        pinColor: n.pinColor || n.color || 'yellow',
        text: n.text || '',
        x: typeof n.x === 'number' ? n.x : 10,
        y: typeof n.y === 'number' ? n.y : 10,
        z: typeof n.z === 'number' ? n.z : 10,
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

      const generatedId = body.id || body.noteId || Date.now().toString();
      const noteDoc = {
        noteId: generatedId,
        author: (body.author || 'VISITOR').toUpperCase().slice(0, 20),
        date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        color: body.color || 'yellow',
        pinColor: body.pinColor || body.color || 'yellow',
        text,
        x: typeof body.x === 'number' ? body.x : 50,
        y: typeof body.y === 'number' ? body.y : 50,
        z: typeof body.z === 'number' ? body.z : 10,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(noteDoc);
      const savedNote = {
        ...noteDoc,
        _id: result.insertedId.toString(),
        id: noteDoc.noteId,
      };
      res.statusCode = 201;
      res.end(JSON.stringify({ success: true, note: savedNote }));
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
      const targetId = body.id || body.noteId || body._id;
      if (!targetId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing note id' }));
        return;
      }

      const updateFields = {};
      if (typeof body.x === 'number') updateFields.x = body.x;
      if (typeof body.y === 'number') updateFields.y = body.y;
      if (typeof body.z === 'number') updateFields.z = body.z;
      if (typeof body.text === 'string') updateFields.text = body.text.slice(0, 240);
      if (body.color) updateFields.color = body.color;
      if (body.pinColor) updateFields.pinColor = body.pinColor;
      updateFields.updatedAt = new Date();

      const query = getNoteQuery(targetId);
      const updateResult = await collection.updateOne(query, { $set: updateFields });

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, matchedCount: updateResult.matchedCount, updated: updateFields }));
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
      const targetId = body.id || body.noteId || body._id || req.url.split('/').pop();
      if (targetId) {
        const query = getNoteQuery(targetId);
        await collection.deleteOne(query);
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
