"use strict";

/**
 * @typedef {Object} ConnectionInfo
 * @property {string} addr - Server IP address or hostname
 * @property {number} port - Server port number
 */

/**
 * @typedef {Object} Identity
 * @property {string} name - Player name (max 15 chars)
 * @property {string} clan - Clan tag (max 11 chars)
 * @property {string} skin - Skin name (1-23 chars)
 * @property {0|1} use_custom_color - Use custom colors flag
 * @property {number} color_body - Body color (integer)
 * @property {number} color_feet - Feet color (integer)
 * @property {number} country - Country code (-1 to 999)
 */

/**
 * @typedef {Object} Input
 * @property {-1|0|1} m_Direction - Movement direction
 * @property {number} m_TargetX - Aim X coordinate
 * @property {number} m_TargetY - Aim Y coordinate
 * @property {0|1} m_Jump - Jump state
 * @property {0|1} m_Fire - Fire state
 * @property {0|1} m_Hook - Hook state
 * @property {number} m_PlayerFlags - Player flags
 * @property {1|2|3|4|5|6} m_WantedWeapon - Desired weapon
 * @property {0|1} m_NextWeapon - Next weapon switch
 * @property {0|1} m_PrevWeapon - Previous weapon switch
 */

class DDUtils {
    constructor() {}

    static DefaultIdentity(name = 'nameless tee') {
        return {
            name: name,
            clan: "",
            skin: "default",
            use_custom_color: 0,
            color_body: 0,
            color_feet: 0,
            country: 0
        }
    }

    static IsValidIdentity(identity) {
        if (!identity || typeof identity !== 'object') {
            return false;
        }

        const requiredFields = ['name', 'clan', 'skin', 'use_custom_color', 'color_body', 'color_feet', 'country'];
        for (const field of requiredFields) {
            if (!(field in identity)) {
                return false;
            }
        }

        if (typeof identity.name !== 'string') return false;
        if (typeof identity.clan !== 'string') return false;
        if (typeof identity.skin !== 'string') return false;
        if (typeof identity.use_custom_color !== 'number') return false;
        if (typeof identity.color_body !== 'number') return false;
        if (typeof identity.color_feet !== 'number') return false;
        if (typeof identity.country !== 'number') return false;

        if (identity.name.length > 15) return false;
        
        if (identity.clan.length > 11) return false;
        
        if (identity.skin.length > 23) return false;
        if (identity.skin.length === 0) return false;

        if (identity.use_custom_color !== 0 && identity.use_custom_color !== 1) return false;

        if (!Number.isInteger(identity.color_body) || identity.color_body < 0) return false;
        if (!Number.isInteger(identity.color_feet) || identity.color_feet < 0) return false;

        if (!Number.isInteger(identity.country) || identity.country < -1 || identity.country > 999) return false;

        return true;
    }

    static IsValidClient(client) {
        if (!client || typeof client !== 'object') {
            return false;
        }

        const requiredMethods = ['Flush', 'SendMsgRaw', 'sendInput', 'Disconnect', 'connect'];
        
        for (const method of requiredMethods) {
            if (typeof client[method] !== 'function') {
                return false;
            }
        }

        return true;
    }

    static IsValidInput(input) {
        if (!input || typeof input !== 'object') {
            return false;
        }

        const requiredFields = [
            'm_Direction', 
            'm_TargetX', 
            'm_TargetY', 
            'm_Jump', 
            'm_Fire', 
            'm_Hook', 
            'm_PlayerFlags', 
            'm_WantedWeapon', 
            'm_NextWeapon', 
            'm_PrevWeapon'
        ];
        
        for (const field of requiredFields) {
            if (!(field in input)) {
                return false;
            }
        }

        for (const field of requiredFields) {
            if (typeof input[field] !== 'number') {
                return false;
            }
            if (!Number.isInteger(input[field])) {
                return false;
            }
        }

        // m_Direction: -1 (влево), 0 (нет), 1 (вправо)
        if (input.m_Direction < -1 || input.m_Direction > 1) {
            return false;
        }

        // m_Jump, m_Fire, m_Hook: 0 или 1
        if (input.m_Jump !== 0 && input.m_Jump !== 1) {
            return false;
        }
        if (input.m_Fire !== 0 && input.m_Fire !== 1) {
            return false;
        }
        if (input.m_Hook !== 0 && input.m_Hook !== 1) {
            return false;
        }

        // m_WantedWeapon: 1-6 (Hammer=1, Gun=2, Shotgun=3, Grenade=4, Laser=5, Ninja=6)
        if (input.m_WantedWeapon < 1 || input.m_WantedWeapon > 6) {
            return false;
        }
        
        // m_NextWeapon, m_PrevWeapon: 0 или 1
        if (input.m_NextWeapon !== 0 && input.m_NextWeapon !== 1) {
            return false;
        }
        if (input.m_PrevWeapon !== 0 && input.m_PrevWeapon !== 1) {
            return false;
        }

        return true;
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static connectionInfo() {
        return {
            addr: 'string',
            port: 8303
        }
    }
}

module.exports = DDUtils;