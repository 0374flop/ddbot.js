"use strict";
const { bot, BotManager, logDebuger } = require('./src/bot'); // Импортируем bot и BotManager из модуля bot/index.js
const mapLoader = require('./src/map/maploader'); // Импортируем mapLoader из модуля map/maploader.js
const Automaploader = require('./src/map/Automaploader'); // Импортируем Automaploader из модуля map/Automaploader.js
const DebugLogger = require('./src/debug'); // Импортируем DebugLogger из модуля debug.js

/**
 * Зделал так чтобы было меньше експорта.
 * Тут у нас не активированый BotManager.
 * И logDebuger который изпользуеться в BotManager, а точнее в bot.
 */
const botClassAndLoger = {
    BotManager,
    logDebuger
}

module.exports = { bot, mapLoader, Automaploader, botClassAndLoger, DebugLogger }; // Экспортируем bot, mapLoader, Automaploader, botClassAndLoger и DebugLogger
