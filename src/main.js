const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { consoleLog, consoleError } = require('./log');
const { ensureDockerImage } = require('./pythonVm');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

ensureDockerImage()
  .then(() => routes(app))
  .catch(consoleError);

const server = app.listen(PORT, HOST, () => {
  consoleLog('app running on port ', server.address().port);
});

function stop() {
  server.close();
}

module.exports = { server, stop }; // for testing
