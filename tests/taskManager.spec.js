const chai = require('chai');
const TaskManager = require('../src/TaskManager');
const { expect } = chai;

describe('Task manager', async () => {
  it('should approve task if queue is empty', async () => {
    const taskManager = new TaskManager(2);
    const id = await taskManager.queue();
    expect(id).to.be.within(0, 1);
  });

  it('should approve task if queue is under limit', async () => {
    const taskManager = new TaskManager(2);
    await taskManager.queue();
    const id = await taskManager.queue();
    expect(id).to.be.within(0, 1);
  });

  it('should remove queued tasks when finished', async () => {
    const taskManager = new TaskManager(2);
    const id1 = await taskManager.queue();
    expect(!!taskManager.tasks.find(({ id }) => id === id1)).to.be.true;
    await taskManager.markDone(id1);
    expect(!!taskManager.tasks.find(({ id }) => id === id1)).to.be.false;
  });

  it('should delay tasks until queue is under limit', done => {
    const taskManager = new TaskManager(1);
    taskManager.queue().then(idFirst => {
      let isSecondStarted = false;
      taskManager.queue().then(idSecond => {
        isSecondStarted = true;
      });
      expect(isSecondStarted).to.be.false;
      setTimeout(() => taskManager.markDone(idFirst), 50);
      setTimeout(() => {
        expect(isSecondStarted).to.be.true;
        done();
      }, 100);
    });
  });
});
