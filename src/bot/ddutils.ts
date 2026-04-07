import type * as Types from './types.js';

export function DefaultIdentity(name: string = 'nameless tee'): Types.SnapshotItemTypes.Identity {
	return {
		name: name,
		clan: "",
		skin: "default",
		use_custom_color: 0,
		color_body: 0,
		color_feet: 0,
		country: 0
	};
}

/**
 * NOT FULL. baze.
 */
export function reconstructPlayerInput(
    char: Types.SnapshotItemTypes.Character,
    ddnetChar: Types.SnapshotItemTypes.DDNetCharacter | null = null,
    tick: number | null = null
): Types.SnapshotItemTypes.PlayerInput {
    const input: Types.SnapshotItemTypes.PlayerInput = {
        m_Direction: char.character_core.direction,
        m_TargetX: 0,
        m_TargetY: -1,
        m_Jump: 0,
        m_Fire: 0,
        m_Hook: 0,
        m_PlayerFlags: char.player_flags || 0,
        m_WantedWeapon: char.weapon,
        m_NextWeapon: 0,
        m_PrevWeapon: 0
    };

    if (ddnetChar && (ddnetChar.m_TargetX !== 0 || ddnetChar.m_TargetY !== 0)) {
        input.m_TargetX = ddnetChar.m_TargetX!;
        input.m_TargetY = ddnetChar.m_TargetY!;
    } else {
        const angleRad = (char.character_core.angle / 256.0) * Math.PI / 128.0;
        input.m_TargetX = Math.cos(angleRad) * 256;
        input.m_TargetY = Math.sin(angleRad) * 256;
    }

    if (input.m_TargetX === 0 && input.m_TargetY === 0) {
        input.m_TargetY = -1;
    }

    const hookActive =
        char.character_core.hook_state !== 0 ||
        char.character_core.hooked_player !== -1;
    input.m_Hook = hookActive ? 1 : 0;

    const jumped = char.character_core.jumped;
    const grounded = Math.abs(char.character_core.vel_y) < 1 && jumped === 0;
    input.m_Jump = jumped > 0 && !grounded ? 1 : 0;

    const isNinja = ddnetChar != null && (ddnetChar.m_Flags & 0x20) !== 0;
    input.m_WantedWeapon = isNinja ? 5 : char.weapon;

    const isAutofireWeapon = [2, 3, 4].includes(input.m_WantedWeapon);
    const isJetpackGun = input.m_WantedWeapon === 1 && ddnetChar?.m_Flags != null;
    input.m_Fire = isAutofireWeapon || isJetpackGun ? 0 : 0;

    return input;
}