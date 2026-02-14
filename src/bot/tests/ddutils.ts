export interface ConnectionInfo {
  addr: string;
  port: number;
}

export interface Identity {
  name: string;
  clan: string;
  skin: string;
  use_custom_color: 0 | 1;
  color_body: number;
  color_feet: number;
  country: number;
}

export interface Input {
  m_Direction: -1 | 0 | 1;
  m_TargetX: number;
  m_TargetY: number;
  m_Jump: 0 | 1;
  m_Fire: 0 | 1;
  m_Hook: 0 | 1;
  m_PlayerFlags: number;
  m_WantedWeapon: 1 | 2 | 3 | 4 | 5 | 6;
  m_NextWeapon: 0 | 1;
  m_PrevWeapon: 0 | 1;
}

export function DefaultIdentity(name: string = 'nameless tee'): Identity {
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

export function IsValidIdentity(identity: unknown): identity is Identity {
  if (!identity || typeof identity !== 'object') {
    return false;
  }

  const obj = identity as Record<string, unknown>;

  const requiredFields = ['name', 'clan', 'skin', 'use_custom_color', 'color_body', 'color_feet', 'country'];
  for (const field of requiredFields) {
    if (!(field in obj)) {
      return false;
    }
  }

  if (typeof obj.name !== 'string') return false;
  if (typeof obj.clan !== 'string') return false;
  if (typeof obj.skin !== 'string') return false;
  if (typeof obj.use_custom_color !== 'number') return false;
  if (typeof obj.color_body !== 'number') return false;
  if (typeof obj.color_feet !== 'number') return false;
  if (typeof obj.country !== 'number') return false;

  if ((obj.name as string).length > 15) return false;
  if ((obj.clan as string).length > 11) return false;
  if ((obj.skin as string).length > 23 || (obj.skin as string).length === 0) return false;
  if (obj.use_custom_color !== 0 && obj.use_custom_color !== 1) return false;
  if (!Number.isInteger(obj.color_body) || (obj.color_body as number) < 0) return false;
  if (!Number.isInteger(obj.color_feet) || (obj.color_feet as number) < 0) return false;
  if (!Number.isInteger(obj.country) || (obj.country as number) < -1 || (obj.country as number) > 999) return false;

  return true;
}

export function IsValidClient(client: unknown): boolean {
  if (!client || typeof client !== 'object') {
    return false;
  }

  const obj = client as Record<string, unknown>;
  const requiredMethods = ['Flush', 'SendMsgRaw', 'sendInput', 'Disconnect', 'connect'];

  for (const method of requiredMethods) {
    if (typeof obj[method] !== 'function') {
      return false;
    }
  }

  return true;
}

export function IsValidInput(input: unknown): input is Input {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const obj = input as Record<string, unknown>;
  const requiredFields = ['m_Direction', 'm_TargetX', 'm_TargetY', 'm_Jump', 'm_Fire', 'm_Hook', 'm_PlayerFlags', 'm_WantedWeapon', 'm_NextWeapon', 'm_PrevWeapon'];

  for (const field of requiredFields) {
    if (!(field in obj) || typeof obj[field] !== 'number' || !Number.isInteger(obj[field])) {
      return false;
    }
  }

  if ((obj.m_Direction as number) < -1 || (obj.m_Direction as number) > 1) return false;
  if ((obj.m_Jump as number) !== 0 && (obj.m_Jump as number) !== 1) return false;
  if ((obj.m_Fire as number) !== 0 && (obj.m_Fire as number) !== 1) return false;
  if ((obj.m_Hook as number) !== 0 && (obj.m_Hook as number) !== 1) return false;
  if ((obj.m_WantedWeapon as number) < 1 || (obj.m_WantedWeapon as number) > 6) return false;
  if ((obj.m_NextWeapon as number) !== 0 && (obj.m_NextWeapon as number) !== 1) return false;
  if ((obj.m_PrevWeapon as number) !== 0 && (obj.m_PrevWeapon as number) !== 1) return false;

  return true;
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function connectionInfo(): ConnectionInfo {
  return {
    addr: 'string',
    port: 8303
  };
}