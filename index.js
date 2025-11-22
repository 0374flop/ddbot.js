"use strict";
const { bot, BotManager, logDebuger } = require('./src/bot'); // Импортируем bot и BotManager из модуля bot/index.js

/**
 * Зделал так чтобы было меньше експорта.
 * Тут у нас не активированый BotManager.
 * И logDebuger который изпользуеться в BotManager, а точнее в bot.
 */
const botClassAndLoger = {
    BotManager,
    logDebuger
}

module.exports = { bot, botClassAndLoger }; // Экспортируем bot, mapLoader, Automaploader, botClassAndLoger и DebugLogger