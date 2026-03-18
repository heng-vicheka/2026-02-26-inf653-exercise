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

// Dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { data: data });
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
