const runNodeJs = require('./vmNode');

const appRouter = app => {
  app.get('/', (req, res) => {
    res.status(200).send(`
    Welcome to our JS virtual machine. Try to POST on /js a text like "Math.random()" 
    `);
  });

  app.post('/js', (req, res) => {
    const code = req.body;
    console.log('Received JS request:\n', `${code}`);
    try {
      const result = runNodeJs(code);
      console.log('Result:', result);
      res.status(200).send({ result });
    } catch (err) {
      const { message } = err;
      res.status(400).send({ error: `${err.name}:  ${message}` });
    }
  });
};

module.exports = appRouter;
