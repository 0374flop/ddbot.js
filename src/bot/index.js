"use strict";
const { BotManager, DebugLogger2 } = require('./bot'); // Импортируем BotManager из модуля bot.js
const bot = new BotManager(); // Создаем экземпляр BotManager

module.exports = { bot, BotManager, DebugLogger2 }; // Экспортируем bot, BotManager, DebugLogger2