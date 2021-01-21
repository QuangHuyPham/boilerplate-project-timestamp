// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const dayjs = require('dayjs');
const bodyParser = require("body-parser");
const { v1 } = require('uuid');
var multer = require ('multer');
var upload = multer ({dest: 'uploads/'});

const users = [];
const userinfo = [];

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/fileanalyse', multer().single('upfile'), function (req, res) {
  return res.json({"name": file.originalname, "type": file.mimetype, "size": file.size});
}) ;

// your first API endpoint... 
app.get("/api/hello", function(req, res) {
  res.json({ greeting: 'hello API' });
});

// const unix = dayjs().valueOf();
// const utc = dayjs().toString();
app.get("/api/timestamp/:date?", function(req, res) {
  if (!req.params.date)
    // return res.json({unix: 1611049278252, utc: "Tue, 19 Jan 2021 09:41:18 GMT"});
    return res.json({ unix: dayjs().valueOf(), utc: dayjs().toString() });
  // return res.json({unix, utc: `"${utc}"`});


  if (dayjs(req.params.date).isValid()) {
    let time = dayjs(req.params.date).format();
    if (+req.params.date > 0) time = dayjs(+req.params.date).format();
    return res.json({ unix: dayjs(time).valueOf(), utc: dayjs(time).toString() })
  }

  return res.json({ error: "Invalid Date" });
});

app.get("/api/whoami", function(req, res) {
  res.json({ ipaddress: "27.72.97.41", language: "en", software: "postman" });
});

app.get("/api/shorturl/:url?", function(req, res) {
  links.map(l => {
    if (l.short_url == req.params.url)
      return res.redirect(l.original_url)
  })
});

const links = [];
let id = 0;

app.post('/api/shorturl/new', function(req, res) {
  const { url } = req.body;
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  const regex = new RegExp(expression);

  if (!url.match(regex))
    return res.json({ error: "invalid URL" });

  id++
  links.push({ original_url: url, short_url: `${id}` });
  return res.json({ original_url: url, short_url: `${id}` });
});

app.get('/api/exercise/users', function(req, res) {
  return res.json(users);
});

app.post('/api/exercise/new-user', function(req, res) {
  const { username } = req.body;
  const newuser = { _id: v1(), username };

  users.push(newuser);

  return res.json(newuser)
});

app.post('/api/exercise/add', async function(req, res) {
  const { userId, description, duration, date } = req.body;
  const newuserinfo = { userId, description, duration: parseInt(duration), date: date || new Date().toISOString().slice(0, 10) };
  let user;
  await users.map(u => {
    if (u._id == userId) user = u;
  })
  userinfo.push(newuserinfo);
  // const result = {_id: user._id, username: user.username, date: newuserinfo.date, description: newuserinfo.description, duration: newuserinfo.duration};

  let responseObject = {}
  responseObject['_id'] = user._id;
  responseObject['username'] = user.username;
  responseObject['description'] = newuserinfo.description;
  responseObject['duration'] = newuserinfo.duration;
  responseObject['date'] = new Date(newuserinfo.date).toDateString();

  console.log('responseObject', responseObject)
  res.json(responseObject)
  
  // console.log(newuserinfo.date);
  // console.log(new Date().toDateString());

  // res.json({
  //   username: user.username,
  //   _id: user._id,
  //   description: description,
  //   duration: duration,
  //   date: "2021-01-21"
  // });

  // res.json(result);
});

app.get('/api/exercise/log', async function(req, res) {
  const { userId, from, to, limit } = req.query;
  let user;
  let info = [];
  let search = [];

  Promise.all([
    await users.map(u => {
      if (u._id == userId) user = u;
    }),
    await userinfo.map(i => {
      if (i.userId == userId) info.push({ description: i.description, duration: i.duration, date: i.date });
    }),
    await userinfo.map((i, index) => {
      if (from && to && limit && i.userId == userId && dayjs(from).isSameOrBefore(dayjs(i.date)) && dayjs(to).isSameOrAfter(dayjs(i.date)) && index < limit) search.push({ description: i.description, duration: i.duration, date: i.date });
    })
  ]).then();

  if (limit) {
    info = info.slice(0, +limit)
  }

  return res.json({ ...user, log: info, count: info.length })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});