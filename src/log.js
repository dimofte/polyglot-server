/**
 * @file a poor man's way to hide messages while in 'test' env,
 * while showing them in development env
 * TODO: better ways do exist
 */
const isVerbose = process.env.VERBOSE === 'true';
module.exports = {
  consoleLog: isVerbose ? console.log : () => {},
  consoleError: isVerbose ? console.error : () => {}
};
