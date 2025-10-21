"use strict";
const { bot, BotManager } = require('./src/bot'); // Импортируем bot и BotManager из модуля bot/index.js
const mapLoader = require('./src/map/maploader'); // Импортируем mapLoader из модуля map/maploader.js
const Automaploader = require('./src/map/Automaploader'); // Импортируем Automaploader из модуля map/Automaploader.js
const DebugLogger = require('./src/debug'); // Импортируем DebugLogger из модуля debug.js

module.exports = { bot, mapLoader, Automaploader, BotManager, DebugLogger }; // Экспортируем bot, mapLoader, Automaploader, BotManager и DebugLogger
