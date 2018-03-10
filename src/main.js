const { consoleError } = require('./log');
const { startServer } = require('../src/main');

startServer().catch(consoleError);
