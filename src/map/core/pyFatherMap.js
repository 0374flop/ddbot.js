const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../../logger').getLogger('pyFatherMap');

function main(inputPath, outputPath) {
    logger.info(`Parsing map from ${inputPath} to ${outputPath}`);

    const py = spawn('python', [path.join(__dirname, 'MapParser.py'), inputPath, outputPath]);

    py.stderr.on('data', (data) => {
        console.error(`[Python error]: ${data}`);
    });
}

function ParseMap(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        throw new Error('Input file does not exist');
    }
    if (!fs.existsSync(path.dirname(outputPath))) {
        throw new Error('Output directory does not exist');
    }
    main(inputPath, outputPath);
    return true;
}

function isParsedMap(mapName, PARSED_DIR) {
    const parsedMapPath = path.join(PARSED_DIR, `${mapName}.json`);
    return fs.existsSync(parsedMapPath);
}

module.exports = {
    ParseMap,
    isParsedMap
}