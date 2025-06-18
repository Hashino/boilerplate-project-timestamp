// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

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

app.get('/api/:date?', function(req, res) {
  // if date is not provided defaults to current date
  const param = req.params.date === undefined ? Date.now() : req.params.date
  // if date is a numerical value (ie: unix timestamp) parses to int
  const date = new Date(isNaN(param) ? param : parseInt(param))

  if (isNaN(date)) {
    res.json({
      "error": "Invalid Date"
    })
  } else {
    res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    })
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
