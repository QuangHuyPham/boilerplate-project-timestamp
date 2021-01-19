// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var dayjs = require('dayjs')

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/timestamp/:date?", async function (req, res) {
  if (!req.params.date) {
      // console.log( dayjs().valueOf(), `${dayjs().toString()}`)
      return res.json({unix: dayjs().valueOf(), utc: dayjs().format()});
  }

  if(dayjs(req.params.date).isValid()) {
    let time = dayjs(req.params.date).format();
    if (+req.params.date > 0) time = dayjs(+req.params.date).format();
    return res.json({unix: dayjs(time).valueOf(), utc: dayjs(time).toString()})
  }

  return res.json({ error : "Invalid Date" });
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});