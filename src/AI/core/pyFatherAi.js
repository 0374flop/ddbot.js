const { spawn } = require('child_process');
const path = require('path');
const logger = require('../../logger').getLogger('pyFatherAi');

function connectPython(scriptName) {
  const py = spawn('python', [path.join(__dirname, scriptName)]);
  py.stderr.on('data', (data) => {
    logger.error(`[${scriptName}] ${data.toString()}`);
  });

  let responseCallback = null;
  py.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        if (responseCallback) {
          responseCallback(line.trim());
        } else {
          logger.info(`[${scriptName}] ${line.trim()}`);
        }
      }
    }
  });

  return {
    send: (message) => py.stdin.write(message + '\n'),
    onResponse: (cb) => { responseCallback = cb; },
    kill: () => py.kill()
  };
}

module.exports = {
  connectPython
};