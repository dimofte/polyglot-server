/* globals Promise: false */
const { Docker } = require('node-docker-api');
const { consoleLog } = require('./log');

const CONTAINER_NAME = 'ruby-runner';

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
  let container;
  try {
    container = await docker.container.get(CONTAINER_NAME);
    await container.start();
  } catch (e) {
    consoleLog('Creating container', CONTAINER_NAME);
    container = await docker.container.create({
      Image: 'ruby:slim',
      // Image: 'iron/ruby',
      Cmd: ['/bin/bash', '-c', 'bundle install'],
      name: CONTAINER_NAME
    });
    await container.start();
  }
  // await container.start();
  const exec = await container.exec.create({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/bash', '-c', `echo "${code}" | ruby`]
  });

  let result = [];
  const stream = await exec.start({ Detach: false });
  await promisifyStream(stream, res => {
    result = [...result, ...res];
  });
  await container.kill();
  if ((await exec.status()).data.ExitCode) {
    // only code 0 means success
    throw new Error(result.join(''));
    // throw new Error(result);
  }
  await container.delete();
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
