"use strict";

const Bot = require('./core/core');
const DDUtils = require('./core/ddutils');
const BaseModule = require('./core/module');

const Chat = require('./modules/chat');
const PlayerList = require('./modules/playerlist');
const Reconnect = require('./modules/reconnect');

const StandardModules = {
    Chat,
    PlayerList,
    Reconnect
}

module.exports = {
    Bot,
    DDUtils,
    BaseModule,
    StandardModules
}