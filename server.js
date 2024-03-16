require('dotenv').config();
const express = require('express');
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');

connectDB();
const app = express();
const PORT = process.env.PORT || 3500;

app.use(logger);
// below express.json() is called the buillt in middleware
app.use(express.json());
app.use(cookieParser());
// below cors(corsOptions) is called the third party middleware
app.use(cors(corsOptions));

// below is called as buillt-in middleware
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'));

app.use('/users', require('./routes/userRoutes'));

app.use('/notes', require('./routes/noteRoutes'));

app.all('*', (req, res) => {
  res.status(404);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to mongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
  console.log({ mongoDB_Connect_err_index_js_48: err });
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  );
});
