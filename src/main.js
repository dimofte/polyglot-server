const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { consoleLog, consoleError } = require('./log')

const app = express();

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

const server = app.listen(3000, () => {
  consoleLog('app running on port ', server.address().port);
});

process.on('uncaughtException', (err) => {
  consoleError('Asynchronous error caught.', err);
})

function stop() {
  server.close();
}

module.exports = { server, stop }; // for testing
