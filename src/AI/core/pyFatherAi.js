const { spawn } = require('child_process');
const path = require('path');
function connectPython(scriptName) {
  const py = spawn('python', [path.join(__dirname, scriptName)]);
  let responseCallback = null;
  py.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        if (responseCallback) {
          responseCallback(line.trim());
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