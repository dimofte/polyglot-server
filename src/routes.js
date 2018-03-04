const appRouter = app => {
  app.get('/', (req, res) => {
    res.status(200).send('Welcome to our virtual machine. Try to POST on /js');
  });
  app.post('/js', (req, res) => {
    res.status(200).send({ foo: 1, bar: 2 });
  });
};

module.exports = appRouter;
