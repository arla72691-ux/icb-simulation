require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API = 'https://api.airtable.com/v0';

// ── Airtable helpers ─────────────────────────────────────────────────────────
const headers = () => ({
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json',
});

const atGet = async (table, params = {}) => {
  const res = await axios.get(
    `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,
    { headers: headers(), params }
  );
  return res.data;
};

const atCreate = async (table, fields) => {
  const res = await axios.post(
    `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,
    { fields },
    { headers: headers() }
  );
  return res.data;
};

const atUpdate = async (table, recordId, fields) => {
  const res = await axios.patch(
    `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}/${recordId}`,
    { fields },
    { headers: headers() }
  );
  return res.data;
};

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || true
    : 'http://localhost:3000',
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120 });
app.use('/api/', limiter);

// ── GET /api/stats ───────────────────────────────────────────────────────────
// Returns { joined, completed }
app.get('/api/stats', async (req, res) => {
  try {
    const data = await atGet('Users', {
      fields: ['name', 'completed'],
    });
    const joined = data.records.length;
    const completed = data.records.filter(r => r.fields.completed === true).length;
    res.json({ joined, completed });
  } catch (err) {
    console.error('[GET /api/stats]', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── POST /api/register ───────────────────────────────────────────────────────
// Body: { name }
// Returns: { userId, name, alreadyExists }
// Strategy: if name already exists return that record (no duplicate),
//           otherwise create a fresh one. No latency from alias generation.
app.post('/api/register', async (req, res) => {
  try {
    const raw = (req.body.name || '').trim().substring(0, 60);
    if (raw.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    // Escape double-quotes for Airtable formula
    const safe = raw.replace(/"/g, '\\"');

    const existing = await atGet('Users', {
      filterByFormula: `LOWER({name}) = LOWER("${safe}")`,
      maxRecords: 1,
      fields: ['name', 'completed'],
    });

    if (existing.records.length > 0) {
      const rec = existing.records[0];
      return res.json({ userId: rec.id, name: rec.fields.name, alreadyExists: true });
    }

    const created = await atCreate('Users', {
      name: raw,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ userId: created.id, name: created.fields.name, alreadyExists: false });
  } catch (err) {
    console.error('[POST /api/register]', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to register. Please try again.' });
  }
});

// ── POST /api/submit ─────────────────────────────────────────────────────────
// Body: { userId, name, score, ebitda, inv, risk, payback, pct }
// Returns: { leaderboard, rank }
app.post('/api/submit', async (req, res) => {
  try {
    const { userId, name, score, ebitda, inv, risk, payback, pct } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required.' });
    }

    // Check if this user already has a leaderboard entry
    const existing = await atGet('Leaderboard', {
      filterByFormula: `{userId} = "${userId}"`,
      maxRecords: 1,
      fields: ['name', 'score', 'userId'],
    });

    if (existing.records.length > 0) {
      const prev = existing.records[0];
      // Only update if the new score is better
      if (score > (prev.fields.score || 0)) {
        await atUpdate('Leaderboard', prev.id, {
          score,
          ebitda,
          inv,
          risk,
          payback,
          pct: String(pct),
          submittedAt: new Date().toISOString(),
        });
      }
    } else {
      // First submission — create leaderboard row
      await atCreate('Leaderboard', {
        name,
        score,
        ebitda,
        inv,
        risk,
        payback,
        pct: String(pct),
        userId,           // plain text — the Airtable record ID from Users table
        submittedAt: new Date().toISOString(),
      });
    }

    // Mark the user as completed in Users table
    await atUpdate('Users', userId, { completed: true });

    // Fetch full sorted leaderboard to return rank
    const lbData = await atGet('Leaderboard', {
      sort: [{ field: 'score', direction: 'desc' }],
      fields: ['name', 'score', 'ebitda', 'inv', 'risk', 'userId'],
    });

    const leaderboard = lbData.records.map(r => ({
      name: r.fields.name,
      score: r.fields.score,
      ebitda: r.fields.ebitda,
      inv: r.fields.inv,
      risk: r.fields.risk,
      userId: r.fields.userId,
    }));

    const rank = leaderboard.findIndex(p => p.userId === userId) + 1;

    res.json({ leaderboard, rank });
  } catch (err) {
    console.error('[POST /api/submit]', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to submit score. Please try again.' });
  }
});

// ── GET /api/leaderboard ─────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = await atGet('Leaderboard', {
      sort: [{ field: 'score', direction: 'desc' }],
      fields: ['name', 'score', 'ebitda', 'inv', 'risk', 'userId'],
      maxRecords: 50,
    });
    const leaderboard = data.records.map(r => ({
      name: r.fields.name,
      score: r.fields.score,
      ebitda: r.fields.ebitda,
      inv: r.fields.inv,
      risk: r.fields.risk,
      userId: r.fields.userId,
    }));
    res.json({ leaderboard });
  } catch (err) {
    console.error('[GET /api/leaderboard]', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// ── Serve React in production ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '../client/build/index.html'))
  );
}

app.listen(PORT, () => console.log(`ICB Simulation server on port ${PORT}`));
