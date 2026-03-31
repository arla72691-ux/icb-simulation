require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ── PostgreSQL ──────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      name VARCHAR(120) NOT NULL,
      score REAL DEFAULT 0,
      ebitda REAL DEFAULT 0,
      inv REAL DEFAULT 0,
      risk REAL DEFAULT 0,
      payback REAL DEFAULT 0,
      pct VARCHAR(20) DEFAULT '0',
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database tables ready');
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || true
    : 'http://localhost:3000',
}));
app.set('trust proxy', 1);
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

// ── GET /api/stats ──────────────────────────────────────────────────────────
let statsCache = { data: null, ts: 0 };
const STATS_TTL = 20_000;

app.get('/api/stats', async (req, res) => {
  try {
    if (statsCache.data && Date.now() - statsCache.ts < STATS_TTL) {
      return res.json(statsCache.data);
    }
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS joined, COUNT(*) FILTER (WHERE completed = true) AS completed FROM users'
    );
    const result = {
      joined: parseInt(rows[0].joined),
      completed: parseInt(rows[0].completed),
    };
    statsCache = { data: result, ts: Date.now() };
    res.json(result);
  } catch (err) {
    console.error('[GET /api/stats]', err.message);
    if (statsCache.data) return res.json(statsCache.data);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── POST /api/register ──────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  try {
    const raw = (req.body.name || '').trim().substring(0, 60);
    if (raw.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    // Count exact name + numbered variants in one query
    const { rows: variants } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM users
       WHERE LOWER(name) = LOWER($1) OR LOWER(name) LIKE LOWER($2)`,
      [raw, `${raw} %`]
    );

    const count = parseInt(variants[0].cnt);
    const finalName = count > 0 ? `${raw} ${count + 1}` : raw;

    const { rows: created } = await pool.query(
      'INSERT INTO users (name, completed, created_at) VALUES ($1, false, NOW()) RETURNING id, name',
      [finalName]
    );

    res.json({ userId: created[0].id, name: created[0].name, alreadyExists: false });
  } catch (err) {
    console.error('[POST /api/register]', err.message);
    res.status(500).json({ error: 'Failed to register. Please try again.' });
  }
});

// ── POST /api/submit ────────────────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  try {
    const { userId, name, score, ebitda, inv, risk, payback, pct } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required.' });
    }

    // Upsert leaderboard entry: insert or update if new score is higher
    await pool.query(`
      INSERT INTO leaderboard (user_id, name, score, ebitda, inv, risk, payback, pct, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        score = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.score ELSE leaderboard.score END,
        ebitda = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.ebitda ELSE leaderboard.ebitda END,
        inv = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.inv ELSE leaderboard.inv END,
        risk = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.risk ELSE leaderboard.risk END,
        payback = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.payback ELSE leaderboard.payback END,
        pct = CASE WHEN EXCLUDED.score > leaderboard.score THEN EXCLUDED.pct ELSE leaderboard.pct END,
        submitted_at = CASE WHEN EXCLUDED.score > leaderboard.score THEN NOW() ELSE leaderboard.submitted_at END
    `, [userId, name, score, ebitda, inv, risk, payback, String(pct)]);

    // Mark user completed
    await pool.query('UPDATE users SET completed = true WHERE id = $1', [userId]);

    // Fetch sorted leaderboard + compute rank
    const { rows: lb } = await pool.query(
      'SELECT name, score, ebitda, inv, risk, user_id FROM leaderboard ORDER BY score DESC'
    );

    const leaderboard = lb.map(r => ({
      name: r.name,
      score: r.score,
      ebitda: r.ebitda,
      inv: r.inv,
      risk: r.risk,
      userId: r.user_id,
    }));

    const rank = leaderboard.findIndex(p => p.userId === userId) + 1;

    res.json({ leaderboard, rank });
  } catch (err) {
    console.error('[POST /api/submit]', err.message);
    res.status(500).json({ error: 'Failed to submit score. Please try again.' });
  }
});

// ── GET /api/leaderboard ────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { rows: lb } = await pool.query(
      'SELECT name, score, ebitda, inv, risk, user_id FROM leaderboard ORDER BY score DESC LIMIT 50'
    );
    const leaderboard = lb.map(r => ({
      name: r.name,
      score: r.score,
      ebitda: r.ebitda,
      inv: r.inv,
      risk: r.risk,
      userId: r.user_id,
    }));
    res.json({ leaderboard });
  } catch (err) {
    console.error('[GET /api/leaderboard]', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// ── Serve React in production ───────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '../client/build/index.html'))
  );
}

// ── Start ───────────────────────────────────────────────────────────────────
initDB()
  .then(() => app.listen(PORT, () => console.log(`ICB Simulation server on port ${PORT}`)))
  .catch(err => { console.error('Failed to initialize DB:', err); process.exit(1); });
