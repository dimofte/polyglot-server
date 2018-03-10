const DEFAULT_LIMIT = 5;

class TaskManager {
  constructor(limit = DEFAULT_LIMIT) {
    if (Number.isNaN(limit) || limit < 0) {
      limit = DEFAULT_LIMIT;
    }
    this.limit = limit;
    this.tasks = [];
  }

  queue() {
    const { tasks, limit } = this;
    const id = Math.random();
    return new Promise(resolve => {
      tasks.push({
        id,
        start: () => resolve(id)
      });
      if (tasks.length <= limit) {
        resolve(id);
      }
    });
  }

  markDone(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    const { tasks, limit } = this;
    if (tasks.length === limit) {
      tasks[limit - 1].start();
    }
  }
}

module.exports = TaskManager;
