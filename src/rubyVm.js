/* globals Promise: false */
const { Docker } = require('node-docker-api');
const { consoleLog } = require('./log');

const CONTAINER_NAME = 'ruby-runner';
const TIME_LIMIT = 5000;

const promisifyStream = (stream, handler) =>
  new Promise((resolve, reject) => {
    // the result of the code's execution has some extra-fluf and we need to remove it
    // FIXME: the following buffer processing is kinda fragile
    // (depends too much on the ruby interpreter)
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

async function runRubyCode(code) {
  const container = await docker.container.create({
    Image: 'ruby:slim',
    // Image: 'iron/ruby',
    Cmd: ['/bin/bash', '-c', 'bundle install']
  });
  await container.start();
  const exec = await container.exec.create({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/bash', '-c', `echo "${code}" | ruby`]
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

async function ensureRubyDockerImage() {
  // Pull docker image if necessary (ruby:slim)
  const imageStream = await docker.image.create({}, { fromImage: 'ruby:2.5', tag: 'slim' });
  // const imageStream = await docker.image.create({}, { fromImage: 'iron/ruby', tag: 'dev' });
  await promisifyStream(imageStream, consoleLog);
}

module.exports = {
  runRubyCode,
  ensureRubyDockerImage
};
