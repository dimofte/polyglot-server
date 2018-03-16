const PythonContainer = require('./containers/PythonContainer');
const RubyContainer = require('./containers/RubyContainer');
const PhpContainer = require('./containers/PhpContainer');
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

  const containerDefinitions = [{
    name: 'Python',
    path: '/python',
    constructor: PythonContainer,
  }, {
    name: 'Ruby',
    path: '/ruby',
    constructor: RubyContainer,
  }, {
    name: 'PHP',
    path: '/php',
    constructor: PhpContainer,
  }];

  containerDefinitions.forEach(containerProps => {
    app.post(containerProps.path, async (req, res) => {
      const code = req.body;
      consoleLog(`${containerProps.name} request:\n${code}`);
      try {
        const taskId = await taskManager.queue();
        const result = await new (containerProps.constructor)().run(code);
        taskManager.markDone(taskId);
        consoleLog('Result:', result);
        res.status(200).send(JSON.stringify(result));
      } catch (err) {
        const { message } = err;
        consoleError(`Error:\n${message}`);
        res.status(400).send(`${err.name}:  ${message}`);
      }
    });
  });
};

module.exports = appRouter;
