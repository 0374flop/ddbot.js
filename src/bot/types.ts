/**
 * Типы из библиотеки teeworlds
 */

export namespace SnapshotItemTypes {
    export interface PlayerInput {
        direction: number;
        target_x: number;
        target_y: number;
        jump: number;
        fire: number;
        hook: number;
        player_flags: number;
        wanted_weapon: number;
        next_weapon: number;
        prev_weapon: number;
    }

    export interface iOptions {
        identity?: Identity;
        password?: string;
        ddnet_version?: {
            version: number;
            release_version: string;
        };
        timeout?: number;
        NET_VERSION?: string;
        lightweight?: boolean;
        timeout_on_connecting?: boolean;
    }

    export interface Projectile {
        x: number;
        y: number;
        vel_x: number;
        vel_y: number;
        type_: number;
        start_tick: number;
    }

    export interface Laser {
        x: number;
        y: number;
        from_x: number;
        from_y: number;
        start_tick: number;
    }

    export interface Pickup {
        x: number;
        y: number;
        type_: number;
        subtype: number;
    }

    export interface Flag {
        x: number;
        y: number;
        team: number;
    }

    export interface GameInfo {
        game_flags: number;
        game_state_flags: number;
        round_start_tick: number;
        warmup_timer: number;
        score_limit: number;
        time_limit: number;
        round_num: number;
        round_current: number;
    }

    export interface GameData {
        teamscore_red: number;
        teamscore_blue: number;
        flag_carrier_red: number;
        flag_carrier_blue: number;
    }

    export interface CharacterCore {
        tick: number;
        x: number;
        y: number;
        vel_x: number;
        vel_y: number;
        angle: number;
        direction: number;
        jumped: number;
        hooked_player: number;
        hook_state: number;
        hook_tick: number;
        hook_x: number;
        hook_y: number;
        hook_dx: number;
        hook_dy: number;
    }

    export interface Character {
        character_core: CharacterCore;
        player_flags: number;
        health: number;
        armor: number;
        ammo_count: number;
        weapon: number;
        emote: number;
        attack_tick: number;
        client_id: number;
    }

    export interface iMessage {
        team: number;
        client_id: number;
        author?: {
            ClientInfo?: ClientInfo;
            PlayerInfo?: PlayerInfo;
        };
        message: string;
    }

    export interface iEmoticon {
        client_id: number;
        emoticon: number;
        author?: {
            ClientInfo?: ClientInfo;
            PlayerInfo?: PlayerInfo;
        };
    }

    export interface iKillMsg {
        killer_id: number;
        killer?: {
            ClientInfo?: ClientInfo;
            PlayerInfo?: PlayerInfo;
        };
        victim_id: number;
        victim?: {
            ClientInfo?: ClientInfo;
            PlayerInfo?: PlayerInfo;
        };
        weapon: number;
        special_mode: number;
    }

    export interface iKillMsgTeam {
        team: number;
        first: number;
    }

    export interface iMapChange {
        map_name: string;
        crc: number;
        size: number;
    }

    export interface PlayerInfo {
        local: number;
        client_id: number;
        team: number;
        score: number;
        latency: number;
    }

    export interface ClientInfo {
        name: string;
        clan: string;
        country: number;
        skin: string;
        use_custom_color: number;
        color_body: number;
        color_feet: number;
        id: number;
    }

    // ТОЛЬКО ИДЕНТИЧНОСТЬ, ЕТО НЕ КЛИЕНТ ИНФО. Только для создания бота.
    export interface Identity {
        name: string;
        clan: string;
        country: number;
        skin: string;
        use_custom_color: number;
        color_body: number;
        color_feet: number;
    }

    export interface SpectatorInfo {
        spectator_id: number;
        x: number;
        y: number;
    }

    export interface Common {
        x: number;
        y: number;
    }

    export interface Explosion {
        common: Common;
    }

    export interface Spawn {
        common: Common;
    }

    export interface HammerHit {
        common: Common;
    }

    export interface Death {
        common: Common;
        client_id: number;
    }

    export interface SoundGlobal {
        common: Common;
        sound_id: number;
    }

    export interface SoundWorld {
        common: Common;
        sound_id: number;
    }

    export interface DamageInd {
        common: Common;
        angle: number;
    }

    export interface MyOwnObject {
        m_Test: number;
    }

    export interface DDNetCharacter {
        m_Flags: number;
        m_FreezeEnd: number;
        m_Jumps: number;
        m_TeleCheckpoint: number;
        m_StrongWeakID: number;
        m_JumpedTotal?: number;
        m_NinjaActivationTick?: number;
        m_FreezeStart?: number;
        m_TargetX?: number;
        m_TargetY?: number;
        id: number;
    }

    export interface DDNetPlayer {
        m_Flags: number;
        m_AuthLevel: number;
        id: number;
    }

    export interface GameInfoEx {
        m_Flags: number;
        m_Version: number;
        m_Flags2: number;
    }

    export interface DDNetProjectile {
        m_X: number;
        m_Y: number;
        m_Angle: number;
        m_Data: number;
        m_Type: number;
        m_StartTick: number;
    }

    export interface DDNetLaser {
        m_ToX: number;
        m_ToY: number;
        m_FromX: number;
        m_FromY: number;
        m_StartTick: number;
        m_Owner: number;
        m_Type: number;
    }
}

export type Item = 
    | SnapshotItemTypes.PlayerInput 
    | SnapshotItemTypes.PlayerInfo 
    | SnapshotItemTypes.Projectile 
    | SnapshotItemTypes.Laser 
    | SnapshotItemTypes.Pickup 
    | SnapshotItemTypes.Flag 
    | SnapshotItemTypes.GameInfo 
    | SnapshotItemTypes.GameData 
    | SnapshotItemTypes.CharacterCore 
    | SnapshotItemTypes.Character 
    | SnapshotItemTypes.ClientInfo 
    | SnapshotItemTypes.SpectatorInfo 
    | SnapshotItemTypes.Common 
    | SnapshotItemTypes.Explosion 
    | SnapshotItemTypes.Spawn 
    | SnapshotItemTypes.HammerHit 
    | SnapshotItemTypes.Death 
    | SnapshotItemTypes.SoundGlobal 
    | SnapshotItemTypes.SoundWorld 
    | SnapshotItemTypes.DamageInd;

export type DDNetItem = 
    | SnapshotItemTypes.MyOwnObject 
    | SnapshotItemTypes.DDNetCharacter 
    | SnapshotItemTypes.DDNetPlayer 
    | SnapshotItemTypes.GameInfoEx 
    | SnapshotItemTypes.DDNetProjectile 
    | SnapshotItemTypes.DDNetLaser;

export type DeltaItem = {
    data: number[];
    parsed: Item | DDNetItem;
    type_id: number;
    id: number;
    key: number;
};

export interface ConnectionInfo {
    addr: string;
    port: number;
}