const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const router = express.Router();

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

const pool = new Pool({
  user: 'database',
  host: '34.123.111.220',
  database: 'todo_data',
  password: 'root',
  port: '5432',
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to PostgreSQL database.');
  }
});

module.exports = pool;

app.use(cors());
app.use(bodyParser.json());
app.use('/', router);

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new task
router.post('/api/tasks', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  try {
    const query = 'INSERT INTO tasks (text) VALUES ($1) RETURNING *';
    const values = [text];
    const result = await pool.query(query, values);
    console.log(result);
    const task = result.rows[0];
    res.status(201).json({ id: task.id, text: task.text, completed: task.completed });
  } catch (err) {
    console.error('Error adding task to the database:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a task
router.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  try {
    const query = 'UPDATE tasks SET text = $1, completed = $2 WHERE id = $3 RETURNING *';
    const values = [text, completed, id];
    const result = await pool.query(query, values);
    const task = result.rows[0];
    res.json({ id: task.id, text: task.text, completed: task.completed });
  } catch (err) {
    console.error('Error updating task in the database:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a task
router.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM tasks WHERE id = $1';
    const values = [id];
    await pool.query(query, values);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task from the database:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});