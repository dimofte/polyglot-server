const { runPythonCode } = require('./pythonVM');
const { runRubyCode } = require('./rubyVm');
const { consoleLog, consoleError } = require('./log');
const TaskManager = require('../src/TaskManager');

const taskManager = new TaskManager(5);

const appRouter = async app => {
  app.get('/', (req, res) => {
    res.status(200).send(`
    Welcome to our JS virtual machine. Try to POST on /python a text like 'nine = 9; print(nine + 1)'
    `);
  });

  app.post('/python', async (req, res) => {
    const code = req.body;
    consoleLog('Python request:\n', `${code}`);
    try {
      const taskId = await taskManager.queue();
      const result = await runPythonCode(code);
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
      const result = await runRubyCode(code);
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
