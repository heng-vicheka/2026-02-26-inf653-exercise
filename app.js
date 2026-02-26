const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

// add in multiparty
const multiparty = require('multiparty');

const app = express();
const PORT = 3000;

// turn off x-powered-by
app.disable('x-powered-by');

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

app.get('/report', (req, res) => {
  res.render('report', {
    title: 'Report Lost/Found Item',
    description: 'Report a lost or found item to help reunite it with its owner.'
  });
});

app.post('/report-text', (req, res) => {
  try {
    const { description, location, date, contact } = req.body;

    if (!description || !location || !date || !contact) {
      return res.status(400).json({
        ok: false,
        message: 'All fields are required.',
      });
    }

    // add the data to the data.json file
    
    const dataFile = path.join(__dirname, 'data.json');
    const existingData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
    existingData.push({
      description,
      location,
      date,
      contact,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(dataFile, JSON.stringify(existingData, null, 2));

    return res.json({
      ok: true,
      message: `Received text form submission for item: ${description} at ${location} on ${date}. Contact info: ${contact}`,
    });
  } catch (error) {
    console.error('Error processing JSON form submission:', error);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while processing your JSON submission.',
    });
  }
});

app.post('/report-image', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({
        ok: false,
        message: 'An error occurred while processing your image submission.',
      });
    }
    const imageFile = files.image ? files.image[0] : null;

    if (!imageFile) {
      return res.status(400).json({
        ok: false,
        message: 'No image file uploaded.',
      });
    }

    // add image to uploads folder and save the path to data.json
    const uploadsDir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const destinationPath = path.join(uploadsDir, imageFile.originalFilename);
    fs.copyFileSync(imageFile.path, destinationPath);

    // add the image path to data.json
    const dataFile = path.join(__dirname, 'data.json');
    const existingData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
    existingData.push({
      description: fields.description ? fields.description[0] : '',
      location: fields.location ? fields.location[0] : '',
      date: fields.date ? fields.date[0] : '',
      contact: fields.contact ? fields.contact[0] : '',
      image: imageFile.originalFilename,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(dataFile, JSON.stringify(existingData, null, 2));

    return res.json({
      ok: true,
      message: `Received image form submission for file: ${imageFile.originalFilename}`,
    });
  });
});

  


app.use((req, res) => {
  res.status(404);
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
