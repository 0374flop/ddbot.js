import { Bot } from './core/core.js';
import BaseModule from './core/module/BaseModule.js';
import InputModule from './core/module/InputModule.js';
import ModuleContainer from './core/module/container.js';
import { InputMixer, InputChannel } from './core/module/InputMixer.js';

import Chat from './modules/chat.js';
import PlayerList from './modules/playerlist.js';
import Reconnect from './modules/reconnect.js';
import Snap from './modules/snap.js';
import LookAt from './modules/input/LookAt.js';
import Follow from './modules/input/Follow.js';

import * as DDUtils from './ddutils.js';
import * as Types from './types.js';

const StandardModules = {
	Chat,
	PlayerList,
	Reconnect,
	Snap,
};

const InputModules = {
	LookAt,
	Follow,
};

export {
	Bot,
	Types,
	DDUtils,
	BaseModule,
	InputModule,
	InputChannel,
	InputMixer,
	ModuleContainer,
	StandardModules,
	InputModules,
};
