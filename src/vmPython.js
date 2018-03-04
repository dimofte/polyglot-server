const {VM, VMScript} = require('vm2');
const { CompilationError, ExecutionError } = require('./errorTypes');

function runNodeJS(code) {
  let script;
  let result;
  try {
    script = new VMScript(code).compile();
  } catch (err) {
    // TODO: error types
    throw new CompilationError(err.message);
  }

  const vm = new VM({ timeout: 1500 });

  try {
    result = vm.run(script);
  } catch (err) {
    throw new ExecutionError(err.message);
  }
  return result;
}


module.exports = runNodeJS;
