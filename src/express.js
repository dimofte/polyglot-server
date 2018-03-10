const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { consoleLog } = require('./log');
const { ensureDockerImage } = require('./pythonVm');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

let expressServer;

async function startServer() {
  await ensureDockerImage();
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
