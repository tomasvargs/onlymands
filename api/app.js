require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
app.use(fileUpload());

const db = require('../config/connection');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nocache = require('nocache');
const http = require('http');
const multer = require('multer');
const upload = multer({ dest: '/tmp/uploads/' });

const userRouter = require('../routes/user');
const adminRouter = require('../routes/admin');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Health check route
app.get('/health', (req, res) => res.status(200).send('OK'));

// Create HTTP server
const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(nocache());
 db.connect();
console.log("Connected to MongoDB");

// Set up session middleware
app.use(session({
  secret: "Key",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { maxAge: 600000 }
}));


server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

// View engine setup
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '../views/layout/'),
  partialsDir: path.join(__dirname, '../views/partials/')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// File upload setup


// Initialize MongoDB connection and session store
// (async () => {
//   try {
//     await db.connect();
//     console.log("Connected to MongoDB");

//     // Set up session middleware
//     app.use(session({
//       secret: "Key",
//       resave: false,
//       saveUninitialized: true,
//       store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
//       cookie: { maxAge: 600000 }
//     }));

    
//     server.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
//   } catch (error) {
//     console.error("Database Connection Error:", error);
//   }
// })();
// Route setup after session middleware
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Routes for user selection between admin and user
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

app.post('/route', (req, res) => {
  const role = req.body.role;
  if (role === 'user') {
    console.log('user')
    res.redirect('/user');
  } else if (role === 'admin') {
    res.redirect('/admin');
  } else {
    res.send('Invalid role selected.');
  }
});

// File upload route


// Catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`); // Log the not found URL
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Port normalization function
function normalizePort(val) {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
}

// Event listeners
function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

module.exports = app;
