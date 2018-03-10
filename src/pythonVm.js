const { Docker } = require('node-docker-api');

const CONTAINER_NAME = 'python-runner';

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
    console.log('Creating container', CONTAINER_NAME);
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
  const stream = await exec.start({ Detach: false });
  await promisifyStream(stream, res => {
    result = [...result, ...res];
  });
  await container.kill();
  console.log({ result });
  if ((await exec.status()).data.ExitCode) {
    // only code 0 means success
    throw new Error(result.join('\n'));
  }
  await container.delete();
  return result;
}

async function ensureDockerImage() {
  // Pull docker image if necessary (python:slim)
  const imageStream = await docker.image.create({}, { fromImage: 'python:3', tag: 'slim' });
  await promisifyStream(imageStream, console.log);
}

module.exports = {
  runPythonCode,
  ensureDockerImage
};
