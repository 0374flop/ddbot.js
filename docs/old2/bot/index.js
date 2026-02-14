"use strict";

const Bot = require('./core/core');
const DDUtils = require('./core/ddutils');
const BaseModule = require('./core/module');

const BotManager = require('./manager');

const Chat = require('./modules/chat');
const PlayerList = require('./modules/playerlist');
const Reconnect = require('./modules/reconnect');
const Snap = require('./modules/snap');

const StandardModules = {
    Chat,
    PlayerList,
    Reconnect,
    Snap
}

module.exports = {
    Bot,
    DDUtils,
    BaseModule,
    BotManager,
    StandardModules
}