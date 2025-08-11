const MapDownloader = require('./core/MapDownloader');
const pyFather = require('./core/pyFatherMap');
const path = require('path');

const MAPS_DIR = path.join(__dirname, '..', '..', 'data', 'maps');
const PARSED_DIR = path.join(__dirname, '..', '..', 'data', 'parsed');

async function mapLoader(mapName) {
    const isMapDownloaded = await MapDownloader.loadMap(mapName, MAPS_DIR);
    if (isMapDownloaded) {
        if (!pyFather.isParsedMap(mapName, PARSED_DIR)) {
            await pyFather.ParseMap(path.join(MAPS_DIR, `${mapName}.map`), path.join(PARSED_DIR, `${mapName}.json`));
        }
    } else {
        if (!pyFather.isParsedMap(mapName, PARSED_DIR)) {
            await pyFather.ParseMap(path.join(MAPS_DIR, `${mapName}.map`), path.join(PARSED_DIR, `${mapName}.json`));
        }
    }
};

module.exports = {
    MapDownloader,
    pyFather,
    MAPS_DIR,
    PARSED_DIR,
    mapLoader
}