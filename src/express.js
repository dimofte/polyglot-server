const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { consoleLog } = require('./log');
const { ensurePythonDockerImage } = require('./pythonVm');
const { ensureRubyDockerImage } = require('./rubyVm');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

let expressServer;

async function startServer() {
  await ensurePythonDockerImage();
  await ensureRubyDockerImage();
  await routes(app);
  expressServer = app.listen(PORT, HOST, () => {
    consoleLog('App running on port ', expressServer.address().port);
  });
  return expressServer;
}

function stopServer() {
  expressServer.close();
}

module.exports = { startServer, stopServer };
