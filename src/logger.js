const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'data', 'logs.txt');

function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level.toUpperCase()}] ${message}`;
    const fileLogMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
    fs.appendFile(LOG_FILE, fileLogMessage + '\n', err => {
        if (err) {
            console.error('Logger error:', err);
        }
    });
}

function getLogger(moduleName) {
    return {
        log: (msg, level = 'info') => log(`[${moduleName}] ${msg}`, level),
        info: (msg) => log(`[${moduleName}] ${msg}`, 'info'),
        warn: (msg) => log(`[${moduleName}] ${msg}`, 'warn'),
        error: (msg) => log(`[${moduleName}] ${msg}`, 'error'),
    };
}

module.exports = {
    log,
    info: (msg) => log(msg, 'info'),
    warn: (msg) => log(msg, 'warn'),
    error: (msg) => log(msg, 'error'),
    getLogger,
}; 