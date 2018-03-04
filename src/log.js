/**
 * @file a poor man's way to hide messages while in 'test' env,
 * while showing them in development env
 */
// TODO: better ways do exist
module.exports = {
  consoleLog: process.env.NODE_ENV !== 'test' ? console.log : () => {},
  consoleError: process.env.NODE_ENV !== 'test' ? console.error : () => {}
};
