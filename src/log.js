module.exports = {
  consoleLog: process.env.NODE_ENV !== 'test' ? console.log : () => {},
  consoleError: process.env.NODE_ENV !== 'test' ? console.error : () => {}
};
