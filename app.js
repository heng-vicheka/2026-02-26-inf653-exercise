const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const data = require('./data');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.engine('handlebars', engine({
  defaultLayout: 'main',
  extname: '.handlebars',
  partialsDir: ['views/partials/'],
  helpers: {
    section: function(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


function readItems() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 4));
}

// Dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { data: data });
});

// Item detail
app.get('/items/:id', (req, res) => {
  const items = readItems();
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).send('Item not found');
  res.render('detail', { item });
});

// Update status
app.post('/items/:id/status', (req, res) => {
  const items = readItems();
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).send('Item not found');
  item.status = req.body.status;
  writeItems(items);
  res.redirect(`/items/${req.params.id}`);
});

// Delete item
app.post('/items/:id/delete', (req, res) => {
  const items = readItems();
  const filtered = items.filter(i => i.id !== req.params.id);
  writeItems(filtered);
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Handlebars Tutorial Server Running       ║
╠════════════════════════════════════════════╣
║   http://localhost:${PORT}                    ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});
