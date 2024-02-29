const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logFolderPath = path.join(__dirname, '..', 'logs');

    if (!fs.existsSync(logFolderPath)) {
      await fsPromises.mkdir(logFolderPath);
    }

    await fs.promises.appendFile(
      path.join(logFolderPath, logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');

  console.log(`${req.method} ${req.path}`);

  next();
};

module.exports = {
  logEvents,
  logger,
};
