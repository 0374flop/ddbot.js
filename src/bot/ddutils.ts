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
        direction: char.character_core.direction,
        target_x: 0,
        target_y: -1,
        jump: 0,
        fire: 0,
        hook: 0,
        player_flags: char.player_flags || 0,
        wanted_weapon: char.weapon,
        next_weapon: 0,
        prev_weapon: 0
    };

    if (ddnetChar && (ddnetChar.m_TargetX !== 0 || ddnetChar.m_TargetY !== 0)) {
        input.target_x = ddnetChar.m_TargetX!;
        input.target_y = ddnetChar.m_TargetY!;
    } else {
        const angleRad = (char.character_core.angle / 256.0) * Math.PI / 128.0;
        input.target_x = Math.cos(angleRad) * 256;
        input.target_y = Math.sin(angleRad) * 256;
    }

    if (input.target_x === 0 && input.target_y === 0) {
        input.target_y = -1;
    }

    const hookActive =
        char.character_core.hook_state !== 0 ||
        char.character_core.hooked_player !== -1;
    input.hook = hookActive ? 1 : 0;

    const jumped = char.character_core.jumped;
    const grounded = Math.abs(char.character_core.vel_y) < 1 && jumped === 0;
    input.jump = jumped > 0 && !grounded ? 1 : 0;

    const isNinja = ddnetChar != null && (ddnetChar.m_Flags & 0x20) !== 0;
    input.wanted_weapon = isNinja ? 5 : char.weapon;

    const isAutofireWeapon = [2, 3, 4].includes(input.wanted_weapon);
    const isJetpackGun = input.wanted_weapon === 1 && ddnetChar?.m_Flags != null;
    input.fire = isAutofireWeapon || isJetpackGun ? 0 : 0; // без tick всегда 0

    return input;
}