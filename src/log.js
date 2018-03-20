/**
 * @file a poor man's way to only log messages if the server was started in verbose mode
 * TODO: better ways do exist
 */
const isVerbose = process.env.VERBOSE === 'true';
module.exports = {
  consoleLog: isVerbose ? console.log : () => {},
  consoleError: isVerbose ? console.error : () => {}
};
