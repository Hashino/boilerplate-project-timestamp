// index.js
// where your node app starts

const fs = require('fs/promises');
const path = require('path');

// init project
var express = require('express');
var app = express();

app.use(express.json());
// app.use(express.text());
app.use(express.urlencoded({ extended: true })); // support encoded bodies

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// app.get('/api/:date?', function(req, res) {
//   // if date is not provided defaults to current date
//   const param = req.params.date === undefined ? Date.now() : req.params.date
//   // if date is a numerical value (ie: unix timestamp) parses to int
//   const date = new Date(isNaN(param) ? param : parseInt(param))
//
//   if (isNaN(date)) {
//     res.json({
//       "error": "Invalid Date"
//     })
//   } else {
//     res.json({
//       "unix": date.getTime(),
//       "utc": date.toUTCString()
//     })
//   }
// });

// app.get('/api/whoami', function(req, res) {
//   // returns the user's IP address, language, and software
//   res.json({
//     "ipaddress": req.ip,
//     "language": req.headers['accept-language'],
//     "software": req.headers['user-agent']
//   });
// });

// Validate URL format
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (err) {
    return false;
  }
}

// File path for URL storage
const STORAGE_PATH = path.join(__dirname, 'urls.json');

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;

  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Read existing URLs or initialize empty object
    const urls = await fs.readFile(STORAGE_PATH, 'utf8')
      .then(data => JSON.parse(data))
      .catch(() => ({}));

    // Generate unique short ID
    let shortUrl;
    do {
      shortUrl = Math.floor(Math.random() * (999 - 1 + 1)) + 1;
    } while (urls[shortUrl]);

    // Save new mapping
    urls[shortUrl] = url;
    await fs.writeFile(STORAGE_PATH, JSON.stringify(urls, null, 2));

    res.json({
      original_url: url,
      short_url: shortUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Endpoint to redirect short URLs
app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url;

  try {
    const urls = await fs.readFile(STORAGE_PATH, 'utf8')
      .then(data => JSON.parse(data))
      .catch(() => ({}));

    const originalUrl = urls[shortUrl];

    if (originalUrl) {
      return res.redirect(originalUrl);
    }
    res.status(404).json({ error: 'short url not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
