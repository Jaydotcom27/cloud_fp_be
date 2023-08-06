const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./my-database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      console.error('Error fetching tasks from the database:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

// Add a new task
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  db.run('INSERT INTO tasks (text) VALUES (?)', [text], function (err) {
    if (err) {
      console.error('Error adding task to the database:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ id: this.lastID, text, completed: 0 });
    }
  });
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  db.run('UPDATE tasks SET text = ?, completed = ? WHERE id = ?', [text, completed, id], function (err) {
    if (err) {
      console.error('Error updating task in the database:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ id: Number(id), text, completed });
    }
  });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting task from the database:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Task deleted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});