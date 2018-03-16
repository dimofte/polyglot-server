const AbstractContainer = require('./AbstractContainer');
const { consoleLog } = require('../log');
const { Docker } = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class PythonContainer extends AbstractContainer {
  async createContainer() {
    this.container = await docker.container.create({
      Image: 'python:slim',
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    });
  }

  async createExec(code) {
    this.exec = await this.container.exec.create({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/bash', '-c', `echo '${code}' | python`]
    });
  }

  static async ensureImage() {
    const imageStream = await docker.image.create({}, { fromImage: 'python:3', tag: 'slim' });
    await AbstractContainer.promisifyStream(imageStream, consoleLog);
  }
}

module.exports = PythonContainer;
