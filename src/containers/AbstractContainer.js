/* globals Promise: false */
// const { consoleLog } = require('../log');

const DEFAULT_TIME_LIMIT = 5000;

class AbstractContainer {
  static async ensureImage() {
    // to be implemented by children
  }

  static promisifyStream(stream, handler) {
    return new Promise((resolve, reject) => {
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
  }

  constructor(timeLimit = DEFAULT_TIME_LIMIT) {
    if (this.constructor === AbstractContainer) {
      throw new Error('This class is abstract!');
    }
    this.timeLimit = timeLimit;
  }

  async createContainer() {
    // to be implemented by children
    // this.container = await docker.container.create({...});
  }
  async createExec(code) { // eslint-disable-line no-unused-vars
    // to be implemented by children
    // this.exec = await container.exec.create({...});
  }

  async killAndDelete() {
    await this.container.kill();
    await this.container.delete();
  }

  async run(code) {
    await this.createContainer();
    await this.container.start();
    await this.createExec(code);

    let result = [];

    setTimeout(() => {
      this.killAndDelete().catch(() => {});
    }, this.timeLimit);

    // If the execution is stopped because of the time limit, we'll encounter an error
    // Otherwise, we won't, we must inspect the exit code to check if the script was successful
    const stream = await this.exec.start({ Detach: false });
    let execStatus;
    try {
      await AbstractContainer.promisifyStream(stream, res => {
        result = [...result, ...res];
      });
      execStatus = await this.exec.status();
      await this.killAndDelete();
    } catch (e) {
      throw new Error(`Time limit reached (${this.timeLimit}ms)`);
    }
    if (execStatus.data.ExitCode) {
      // only code 0 means success
      throw new Error(result.join('\n'));
    }

    return result;
  }
}

module.exports = AbstractContainer;
