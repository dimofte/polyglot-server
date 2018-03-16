const AbstractContainer = require('./AbstractContainer');
const { consoleLog } = require('../log');
const { Docker } = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class PhpContainer extends AbstractContainer {

  async createContainer() {
    this.container = await docker.container.create({
      Image: 'php:7.0-cli',
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    });
  }

  async createExec(code) {
    this.exec = await this.container.exec.create({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/bash', '-c', `php -r '${code}'`]
    });
  }

  static async ensureImage() {
    const imageStream = await docker.image.create({}, { fromImage: 'php:7.0-cli' });
    await AbstractContainer.promisifyStream(imageStream, consoleLog);
  }
}

module.exports = PhpContainer;
