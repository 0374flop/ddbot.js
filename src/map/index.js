const MapDownloader = require('./core/MapDownloader');
const pyFather = require('./core/pyFather');
const path = require('path');

const MAPS_DIR = path.join(__dirname, '..', '..', 'data', 'maps');
const PARSED_DIR = path.join(__dirname, '..', '..', 'data', 'parsed');

module.exports = {
    MapDownloader,
    pyFather,
    MAPS_DIR,
    PARSED_DIR
}