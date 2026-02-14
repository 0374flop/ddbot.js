import { Bot } from './core/core.js';
import * as DDUtils from './core/ddutils.js';
import BaseModule from './core/module.js';
import BotManager from './manager.js';
import Chat from './modules/chat.js';
import PlayerList from './modules/playerlist.js';
import Reconnect from './modules/reconnect.js';
import Snap from './modules/snap.js';

const StandardModules = {
	Chat,
	PlayerList,
	Reconnect,
	Snap,
};

export {
	Bot,
	DDUtils,
	BaseModule,
	BotManager,
	StandardModules,
};
