var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var userRouter = require('../routes/user');
var adminRouter = require('../routes/admin');
var hbs = require('express-handlebars');
var app = express();
var fileUpload = require('express-fileupload');
var db = require('../config/connection');
var session = require('express-session');
const MongoStore = require('connect-mongo');
const nocache = require('nocache');
var http = require('http');
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session store with MongoDB
app.use(session({
  secret: "Key",
  resave: false, // Better session handling
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/shopping' }),
  cookie: { maxAge: 600000 }
}));
app.use(nocache());

// Define normalizePort function
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) { return val; } // named pipe
  if (port >= 0) { return port; } // port number
  return false;
}

// Route for displaying the welcome form
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome!</h1>
    <form action="/route" method="post">
      <label for="role">Are you a User or an Admin?</label>
      <select name="role" id="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Route for handling the form submission
app.post('/route', (req, res) => {
  const role = req.body.role;
  if (role === 'user') {
    res.redirect('/user');
  } else if (role === 'admin') {
    res.redirect('/admin');
  } else {
    res.send('Invalid role selected.');
  }
});

// User route
app.use('/user', userRouter);

// Admin route
app.use('/admin', adminRouter);

// Upload route
const multer = require('multer');
const upload = multer({ dest: '/tmp/uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully!');
});

// View engine setup
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '../views/layout/'), // Updated path
  partialsDir: path.join(__dirname, '../views/partials/') // Updated path

}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views')); 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(fileUpload());

db.connect((err) => {
  if (err) console.log("Database Connection Error" + err);
  else console.log("Database Connected");
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.use(express.static('public'));

module.exports = app;

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') { throw error; }
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES': console.error(bind + ' requires elevated privileges'); process.exit(1); break;
    case 'EADDRINUSE': console.error(bind + ' is already in use'); process.exit(1); break;
    default: throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
