const { Docker } = require('node-docker-api');

process.on('uncaughtException', err => {
  console.error('Asynchronous error caught.', err);
});

const promisifyStream = stream =>
  new Promise((resolve, reject) => {
    stream.on('data', data => console.log(data.toString()));
    stream.on('end', resolve);
    stream.on('error', reject);
  });

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function runPythonCode(code) {
  code = `
x = 1
while x < 5:
    print(x)
    x = x + 1
`;

  // Pull docker image if necessary (python:slim)
  const imageStream = await docker.image.create({}, { fromImage: 'python:3', tag: 'slim' });
  await promisifyStream(imageStream);

  let container;
  try {
    container = await docker.container.get('python-runner');
  } catch (e) {
    console.log('caught', e)
    container = await docker.container.create({
      Image: 'python:slim',
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
      name: 'python-runner'
    });
  }
  await container.start();
  const exec = await container.exec.create({
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/bash', '-c', `echo "${code}" | python`]
  });
  const stream = await exec.start({ Detach: false });
  await promisifyStream(stream);
  await container.kill();
  // await container.delete();
}
runPythonCode()
  .then(() => process.exit())
  .catch(console.error);

module.exports = runPythonCode;
