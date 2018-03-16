const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { consoleLog } = require('./log');
const PythonContainer = require('./containers/PythonContainer');
const RubyContainer = require('./containers/RubyContainer');
const PhpContainer = require('./containers/PhpContainer');

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();
  app.use(bodyParser.text());
  app.use(bodyParser.urlencoded({ extended: true }));

  await PythonContainer.ensureImage();
  await RubyContainer.ensureImage();
  await PhpContainer.ensureImage();

  await routes(app);

  const expressServer = app.listen(PORT, HOST, () => {
    consoleLog('App running on port ', expressServer.address().port);
  });
  return expressServer;
}

module.exports = { startServer };
