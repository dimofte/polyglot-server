const { consoleError } = require('./log');
const { startServer } = require('./express');

startServer().catch(consoleError);
