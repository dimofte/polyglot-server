const AbstractContainer = require('./AbstractContainer');
const { consoleLog } = require('../log');
const { Docker } = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class RubyContainer extends AbstractContainer {
  async createContainer() {
    this.container = await docker.container.create({
      Image: 'ruby:slim',
      Cmd: ['/bin/bash', '-c', 'bundle install']
    });
  }

  async createExec(code) {
    this.exec = await this.container.exec.create({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/bash', '-c', `echo "${code}" | ruby`]
    });
  }

  static async ensureImage() {
    const imageStream = await docker.image.create({}, { fromImage: 'ruby:2.5', tag: 'slim' });
    await AbstractContainer.promisifyStream(imageStream, consoleLog);
  }
}

module.exports = RubyContainer;
