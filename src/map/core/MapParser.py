import twmap
import json
import sys
import json

input_path = sys.argv[1]
output_path = sys.argv[2]

# Define NUM_ENTITIES from mapitems.h
NUM_ENTITIES = 50

m = twmap.Map(input_path)

out = {
    "hookable": [],           # TILE_SOLID (1)
    "death": [],              # TILE_DEATH (2)
    "unhookable": [],         # TILE_NOHOOK (3)
    "nolaser": [],            # TILE_NOLASER (4)
    "hookthrough": [],        # TILE_THROUGH_CUT (5)
    "through": [],            # TILE_THROUGH (6)
    "jump": [],               # TILE_JUMP (7)
    "freeze": [],             # TILE_FREEZE (9)
    "teleinevil": [],         # TILE_TELEINEVIL (10)
    "unfreeze": [],           # TILE_UNFREEZE (11)
    "dfreeze": [],            # TILE_DFREEZE (12)
    "dunfreeze": [],          # TILE_DUNFREEZE (13)
    "teleinweapon": [],       # TILE_TELEINWEAPON (14)
    "teleinhook": [],         # TILE_TELEINHOOK (15)
    "walljump": [],           # TILE_WALLJUMP (16)
    "ehook_enable": [],       # TILE_EHOOK_ENABLE (17)
    "ehook_disable": [],      # TILE_EHOOK_DISABLE (18)
    "hit_enable": [],         # TILE_HIT_ENABLE (19)
    "hit_disable": [],        # TILE_HIT_DISABLE (20)
    "solo_enable": [],        # TILE_SOLO_ENABLE (21)
    "solo_disable": [],       # TILE_SOLO_DISABLE (22)
    "switch_timed_open": [],  # TILE_SWITCHTIMEDOPEN (23)
    "switch_timed_close": [], # TILE_SWITCHTIMEDCLOSE (24)
    "switch_open": [],        # TILE_SWITCHOPEN (25)
    "switch_close": [],       # TILE_SWITCHCLOSE (26)
    "telein": [],             # TILE_TELEIN (27)
    "teleout": [],            # TILE_TELEOUT (28)
    "speed_boost": [],        # TILE_SPEED_BOOST (30), TILE_SPEED_BOOST_OLD (29)
    "telecheck": [],          # TILE_TELECHECK (31)
    "telecheckout": [],       # TILE_TELECHECKOUT (32)
    "telecheckin": [],        # TILE_TELECHECKIN (33)
    "refill_jumps": [],       # TILE_REFILL_JUMPS (34)
    "start": [],              # TILE_START (35)
    "finish": [],             # TILE_FINISH (36)
    "time_checkpoint": [],    # TILE_TIME_CHECKPOINT_* (37-61)
    "stop": [],               # TILE_STOP (62), TILE_STOPS (63), TILE_STOPA (64)
    "telecheckinevil": [],    # TILE_TELECHECKINEVIL (65)
    "checkpoint": [],         # TILE_CP (66), TILE_CP_F (67)
    "through_all": [],        # TILE_THROUGH_ALL (68)
    "through_dir": [],        # TILE_THROUGH_DIR (69)
    "tune": [],               # TILE_TUNE (70)
    "entities_off": [],       # TILE_ENTITIES_OFF_1 (190), TILE_ENTITIES_OFF_2 (191)
    "credits": [],            # TILE_CREDITS_1-8 (140-143, 156-159)
    "teleport_in": [],        # Слой tele (входы)
    "teleport_out": [],       # Слой tele (выходы)
    "speedup": [],            # Слой speedup
    "switch": [],             # Слой switch
    "tune_layer": []          # Слой tune
}

def process_game_layer(layer):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Processing 'game' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])
            flags = int(tile[1])
            if idx != 0 or flags != 0:  # Only non-empty tiles
                if idx == 1:
                    out["hookable"].append({"x": x, "y": y})
                elif idx == 2:
                    out["death"].append({"x": x, "y": y})
                elif idx == 3:
                    out["unhookable"].append({"x": x, "y": y})
                elif idx == 4:
                    out["nolaser"].append({"x": x, "y": y})
                elif idx == 5:
                    out["hookthrough"].append({"x": x, "y": y})
                elif idx == 6:
                    out["through"].append({"x": x, "y": y})
                elif idx == 7:
                    out["jump"].append({"x": x, "y": y})
                elif idx == 9:
                    out["freeze"].append({"x": x, "y": y})
                elif idx == 10:
                    out["teleinevil"].append({"x": x, "y": y})
                elif idx == 11:
                    out["unfreeze"].append({"x": x, "y": y})
                elif idx == 12:
                    out["dfreeze"].append({"x": x, "y": y})
                elif idx == 13:
                    out["dunfreeze"].append({"x": x, "y": y})
                elif idx == 14:
                    out["teleinweapon"].append({"x": x, "y": y})
                elif idx == 15:
                    out["teleinhook"].append({"x": x, "y": y})
                elif idx == 16:
                    out["walljump"].append({"x": x, "y": y})
                elif idx == 17:
                    out["ehook_enable"].append({"x": x, "y": y})
                elif idx == 18:
                    out["ehook_disable"].append({"x": x, "y": y})
                elif idx == 19:
                    out["hit_enable"].append({"x": x, "y": y})
                elif idx == 20:
                    out["hit_disable"].append({"x": x, "y": y})
                elif idx == 21:
                    out["solo_enable"].append({"x": x, "y": y})
                elif idx == 22:
                    out["solo_disable"].append({"x": x, "y": y})
                elif idx == 23:
                    out["switch_timed_open"].append({"x": x, "y": y})
                elif idx == 24:
                    out["switch_timed_close"].append({"x": x, "y": y})
                elif idx == 25:
                    out["switch_open"].append({"x": x, "y": y})
                elif idx == 26:
                    out["switch_close"].append({"x": x, "y": y})
                elif idx == 27:
                    out["telein"].append({"x": x, "y": y})
                elif idx == 28:
                    out["teleout"].append({"x": x, "y": y})
                elif idx in (29, 30):
                    out["speed_boost"].append({"x": x, "y": y})
                elif idx == 31:
                    out["telecheck"].append({"x": x, "y": y})
                elif idx == 32:
                    out["telecheckout"].append({"x": x, "y": y})
                elif idx == 33:
                    out["telecheckin"].append({"x": x, "y": y})
                elif idx == 34:
                    out["refill_jumps"].append({"x": x, "y": y})
                elif idx == 35:
                    out["start"].append({"x": x, "y": y})
                elif idx == 36:
                    out["finish"].append({"x": x, "y": y})
                elif 37 <= idx <= 61:
                    out["time_checkpoint"].append({"x": x, "y": y})
                elif idx in (62, 63, 64):
                    out["stop"].append({"x": x, "y": y})
                elif idx == 65:
                    out["telecheckinevil"].append({"x": x, "y": y})
                elif idx in (66, 67):
                    out["checkpoint"].append({"x": x, "y": y})
                elif idx == 68:
                    out["through_all"].append({"x": x, "y": y})
                elif idx == 69:
                    out["through_dir"].append({"x": x, "y": y})
                elif idx == 70:
                    out["tune"].append({"x": x, "y": y})
                elif idx in (140, 141, 142, 143, 156, 157, 158, 159):
                    out["credits"].append({"x": x, "y": y})
                elif idx in (190, 191):
                    out["entities_off"].append({"x": x, "y": y})

def process_tele_layer(layer, type_name):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Processing '{layer.name}' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])  # m_Type
            number = int(tile[1])  # m_Number
            if idx != 0:
                out[type_name].append({
                    "x": x,
                    "y": y,
                    "type": idx,
                    "number": number
                })

def process_speedup_layer(layer):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Processing '{layer.name}' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])  # m_Type
            force = int(tile[1])  # m_Force
            max_speed = int(tile[2])  # m_MaxSpeed
            angle = int.from_bytes(tile[4:6], byteorder='little', signed=True)  # m_Angle (short)
            if idx != 0:
                out["speedup"].append({
                    "x": x,
                    "y": y,
                    "type": idx,
                    "force": force,
                    "max_speed": max_speed,
                    "angle": angle
                })

def process_switch_layer(layer):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Processing '{layer.name}' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])  # m_Type
            number = int(tile[1])  # m_Number
            flags = int(tile[2])  # m_Flags
            delay = int(tile[3])  # m_Delay
            if idx != 0:
                out["switch"].append({
                    "x": x,
                    "y": y,
                    "type": idx,
                    "number": number,
                    "flags": flags,
                    "delay": delay
                })

def process_tune_layer(layer):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Processing '{layer.name}' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])  # m_Type
            number = int(tile[1])  # m_Number
            if idx != 0:
                out["tune_layer"].append({
                    "x": x,
                    "y": y,
                    "type": idx,
                    "number": number
                })

def process_entities(layer):
    width = layer.width()
    height = layer.height()
    tiles = layer.tiles
    print(f"Checking entities in '{layer.name}' layer: {width}x{height}")

    for y in range(height):
        for x in range(width):
            tile = tiles[y, x]
            idx = int(tile[0])
            flags = int(tile[1])
            if 0 < idx <= NUM_ENTITIES:  # Check if index is a valid entity
                entity_name = {
                    1: "spawn",
                    2: "spawn_red",
                    3: "spawn_blue",
                    4: "flagstand_red",
                    5: "flagstand_blue",
                    6: "armor_1",
                    7: "health_1",
                    8: "weapon_shotgun",
                    9: "weapon_grenade",
                    10: "powerup_ninja",
                    11: "weapon_laser",
                    12: "laser_fast_ccw",
                    13: "laser_normal_ccw",
                    14: "laser_slow_ccw",
                    15: "laser_stop",
                    16: "laser_slow_cw",
                    17: "laser_normal_cw",
                    18: "laser_fast_cw",
                    19: "laser_short",
                    20: "laser_medium",
                    21: "laser_long",
                    22: "laser_c_slow",
                    23: "laser_c_normal",
                    24: "laser_c_fast",
                    25: "laser_o_slow",
                    26: "laser_o_normal",
                    27: "laser_o_fast",
                    29: "plasmae",
                    30: "plasmaf",
                    31: "plasma",
                    32: "plasmau",
                    33: "crazy_shotgun_ex",
                    34: "crazy_shotgun",
                    35: "armor_shotgun",
                    36: "armor_grenade",
                    37: "armor_ninja",
                    38: "armor_laser",
                    42: "dragger_weak",
                    43: "dragger_normal",
                    44: "dragger_strong",
                    45: "dragger_weak_nw",
                    46: "dragger_normal_nw",
                    47: "dragger_strong_nw",
                    49: "door"
                }.get(idx, f"entity_{idx}")
                out.setdefault(entity_name, []).append({
                    "x": x,
                    "y": y,
                    "index": idx,
                    "flags": flags
                })

for group in m.groups:
    for layer in group.layers:
        name = layer.name.lower()
        print("Found layer:", name)

        if name == "game":
            process_game_layer(layer)
            process_entities(layer)
        elif "tele" in name:
            process_tele_layer(layer, "teleport_out" if "out" in name else "teleport_in")
        elif name == "speedup":
            process_speedup_layer(layer)
        elif name == "switch":
            process_switch_layer(layer)
        elif name == "tune":
            process_tune_layer(layer)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

print("Экспорт завершён! Результат в", output_path)