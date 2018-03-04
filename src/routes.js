const runNodeJs = require('./vmNode');

const appRouter = app => {
  app.get('/', (req, res) => {
    res.status(200).send(`
    Welcome to our virtual machine. Try to POST on /js a json like { "code": "Math.random()" } 
    `);
  });
  app.post('/js', (req, res) => {
    const code = req.body && req.body.code;
    console.log('Received JS request:\n', code);
    try {
      const result = runNodeJs(code);
      console.log('Result:', result);
      res.status(200).send({ result });
    } catch (err) {
      const { message } = err;
      console.error(message)
      res.status(400).send({ error: message });
    }
  });
};

module.exports = appRouter;
