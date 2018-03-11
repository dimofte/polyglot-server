/* globals Promise: false */
const { Docker } = require('node-docker-api');
const { consoleLog, consoleError } = require('./log');

const CONTAINER_NAME = 'python-runner';
const TIME_LIMIT = 5000;

const promisifyStream = (stream, handler) =>
  new Promise((resolve, reject) => {
    // the result of the code's execution has some extra-fluf and we need to remove it
    // FIXME: the following buffer processing is kinda fragile
    // (depends too much on the python interpreter)
    stream.on('data', data =>
      handler(
        data
          .toString()
          .substr(8)
          .split('\n')
          .slice(0, -1)
      )
    );
    stream.on('end', resolve);
    stream.on('error', reject);
  });

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function runPythonCode(code) {
  let container;
  try {
    container = await docker.container.get(CONTAINER_NAME);
    await container.start();
  } catch (e) {
    // consoleLog('Creating container', CONTAINER_NAME);
    container = await docker.container.create({
      Image: 'python:slim',
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
      name: CONTAINER_NAME
    });
    await container.start();
  }
  // await container.start();
  const exec = await container.exec.create({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/bash', '-c', `echo "${code}" | python`]
  });

  let result = [];

  const killAndDelete = async () => {
    await container.kill();
    await container.delete();
  };

  setTimeout(() => {
    killAndDelete().catch(() => {});
  }, TIME_LIMIT);

  // If the execution is stopped because of the time limit, we'll encounter an error
  // Otherwise, we won't, we must inspect the exit code to check if the script was successful
  const stream = await exec.start({ Detach: false });
  let execStatus;
  try {
    await promisifyStream(stream, res => {
      result = [...result, ...res];
    });
    execStatus = await exec.status();
    await killAndDelete();
  } catch (e) {
    throw new Error(`Time limit reached (${TIME_LIMIT}ms)`);
  }
  if (execStatus.data.ExitCode) {
    // only code 0 means success
    throw new Error(result.join('\n'));
  }

  return result;
}

async function ensurePythonDockerImage() {
  // Pull docker image if necessary (python:slim)
  const imageStream = await docker.image.create({}, { fromImage: 'python:3', tag: 'slim' });
  await promisifyStream(imageStream, consoleLog);
}

module.exports = {
  runPythonCode,
  ensurePythonDockerImage
};
