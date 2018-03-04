class CompilationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
class ExecutionError extends CompilationError {}

module.exports = {
  CompilationError,
  ExecutionError
};
