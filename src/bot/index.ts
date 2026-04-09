import { Bot } from './core/core.js';
import BaseModule from './core/module/module.js';

import Chat from './modules/chat.js';
import PlayerList from './modules/playerlist.js';
import Reconnect from './modules/reconnect.js';
import Snap from './modules/snap.js';

import * as DDUtils from './ddutils.js';
import * as Types from './types.js';

const StandardModules = {
	Chat,
	PlayerList,
	Reconnect,
	Snap,
};

export {
	Bot,
	Types,
	DDUtils,
	BaseModule,
	StandardModules,
};
