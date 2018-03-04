const PythonShell = require('python-shell');
const { promisify } = require('util');
const { writeFile, existsSync, mkdirSync, unlink } = require('fs');

const runPythonScriptAsync = promisify(PythonShell.run);
const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

const OUTPUT_DIR = './output';
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR);
}

async function runPythonCode(code) {
  const fileName = `${OUTPUT_DIR}/${Math.floor(Math.random() * 99999999)}.py`;
  await writeFileAsync(fileName, code, 'utf8');

  try {
    const result = await runPythonScriptAsync(fileName);
    console.log({ result });
    await unlinkAsync(fileName);
    return result;
  } catch (err) {
    console.error(err);
    await unlinkAsync(fileName);
    throw err;
  }
}

module.exports = runPythonCode;
