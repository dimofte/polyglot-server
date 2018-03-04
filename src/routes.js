const runPython = require('./vmPython');
const { consoleLog, consoleError } = require('./log');

const appRouter = app => {
  app.get('/', (req, res) => {
    // TODO
    res.status(200).send(`
    Welcome to our JS virtual machine. Try to POST on /python a text like ... 
    `);
  });

  app.post('/python', (req, res) => {
    const code = req.body;
    consoleLog('Received request:\n', `${code}`);
    try {
      const result = runPython(code);
      consoleLog('Result:', result);
      res.status(200).send(JSON.stringify(result));
    } catch (err) {
      const { message } = err;
      consoleError(message);
      res.status(400).send(`${err.name}:  ${message}`);
    }
  });
};

module.exports = appRouter;
