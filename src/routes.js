const PythonContainer = require('./containers/PythonContainer');
const RubyContainer = require('./containers/RubyContainer');
const { consoleLog, consoleError } = require('./log');
const TaskManager = require('../src/TaskManager');

const MAX_NUMBER_OF_CONCURRENT_TASKS = 5;
const taskManager = new TaskManager(MAX_NUMBER_OF_CONCURRENT_TASKS);

const appRouter = async app => {
  app.get('/', (req, res) => {
    res.status(200).send(`
    Welcome to our JS virtual machine. Try to POST on /python a text like 'nine = 99; print(nine + 1)'
    `);
  });

  app.post('/python', async (req, res) => {
    const code = req.body;
    consoleLog('Python request:\n', `${code}`);
    try {
      const taskId = await taskManager.queue();
      const result = await new PythonContainer().run(code);
      taskManager.markDone(taskId);
      consoleLog('Result:', result);
      res.status(200).send(JSON.stringify(result));
    } catch (err) {
      const { message } = err;
      consoleError(`Error:\n${message}`);
      res.status(400).send(
        `${err.name}:  ${
          // disabled // remove the file name from the error message
          message // .replace('File "<stdin>",', '')
        }`
      );
    }
  });

  app.post('/ruby', async (req, res) => {
    const code = req.body;
    consoleLog('Ruby request:\n', `${code}`);
    try {
      const taskId = await taskManager.queue();
      const result = await new RubyContainer().run(code);
      taskManager.markDone(taskId);
      consoleLog('Result:', result);
      res.status(200).send(JSON.stringify(result));
    } catch (err) {
      const { message } = err;
      consoleError(`Error:\n${message}`);
      res.status(400).send(`${err.name}:  ${message}`);
    }
  });
};

module.exports = appRouter;
