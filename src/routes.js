const runNodeJs = require('./vmNode');
const { consoleLog, consoleError } = require('./log')

const appRouter = app => {
  app.get('/', (req, res) => {
    res.status(200).send(`
    Welcome to our JS virtual machine. Try to POST on /js a text like "Math.random()" 
    `);
  });

  app.post('/js', (req, res) => {
    const code = req.body;
    consoleLog('Received JS request:\n', `${code}`);
    try {
      const result = runNodeJs(code);
      consoleLog('Result:', result);
      res.status(200).send(JSON.stringify(result));
    } catch (err) {
      const { message } = err;
      consoleError(message)
      res.status(400).send(`${err.name}:  ${message}`);
    }
  });
};

module.exports = appRouter;
