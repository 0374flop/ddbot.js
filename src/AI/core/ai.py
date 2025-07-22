import sys
import json
import numpy as np
import random
import pickle
import time
import os

# Параметры Q-Learning
GAMMA = 0.99  # Фактор дисконтирования
ALPHA = 0.1   # Скорость обучения
INITIAL_EPSILON = 1  # Больше случайных действий для исследования
EPSILON_DECAY = 0.8  # Медленное затухание
MIN_EPSILON = 0.1  # Минимальная вероятность случайных действий
ACTIONS = [
    "runright", "runleft", "jump", "runstop", "fire", "nextweapon", "prevweapon",
    "hook_N", "hook_NE", "hook_E", "hook_SE", "hook_S", "hook_SW", "hook_W", "hook_NW"
]
AIM_LIMIT = 200

# Инициализация Q-таблицы
state_space_size = (10, 10, 3, 3, 2)  # Увеличенная сетка 20x20
action_space_size = len(ACTIONS)
q_table = np.zeros(state_space_size + (action_space_size,))

# Счётчики
iteration_count = 0
SAVE_INTERVAL = 50
epsilon = INITIAL_EPSILON
episode_start_time = time.time()
collision_start_time = None
collision_action = None

# Путь к папке AI относительно этого файла
AI_DIR = os.path.join(os.path.dirname(__file__), '..')
Q_TABLE_PATH = os.path.join(AI_DIR, 'q_table.pkl')

def load_q_table():
    """Загрузка Q-таблицы."""
    global q_table
    try:
        with open(Q_TABLE_PATH, "rb") as f:
            q_table = pickle.load(f)
        print(f"Q-table loaded from {Q_TABLE_PATH}", file=sys.stderr)
    except FileNotFoundError:
        print(f"Q-table not found, using new one", file=sys.stderr)

def save_q_table():
    """Сохранение Q-таблицы."""
    with open(Q_TABLE_PATH, "wb") as f:
        pickle.dump(q_table, f)
    print(f"Q-table saved to {Q_TABLE_PATH}", file=sys.stderr)

def discretize_state(state):
    """Преобразование состояния в дискретные индексы."""
    if "character" not in state or "character_core" not in state["character"]:
        return (0, 0, 0, 0, 0)

    core = state["character"]["character_core"]
    x = core["x"] // 50  # Уменьшенный шаг для большей точности
    y = core["y"] // 50
    jumps = min(core["jumped"], 2)

    vel_x = core["vel_x"]
    movement_state = 0
    if vel_x > 0:
        movement_state = 2
    elif vel_x < 0:
        movement_state = 1

    hook_state = 1 if core["hook_state"] > 0 else 0

    x = min(max(x, 0), state_space_size[0] - 1)
    y = min(max(y, 0), state_space_size[1] - 1)

    return (int(x), int(y), jumps, movement_state, hook_state)

def compute_reward(prev_state, current_state, action):
    """Улучшенная функция награды с аккумуляцией наград и штрафов."""
    global collision_start_time, collision_action

    if "character" not in current_state or "character_core" not in current_state["character"]:
        return -1

    prev_core = prev_state.get("character", {}).get("character_core", {}) if prev_state else {}
    curr_core = current_state["character"]["character_core"]

    prev_x, prev_y = prev_core.get("x", 0), prev_core.get("y", 0)
    curr_x, curr_y = curr_core["x"], curr_core["y"]

    reward = 0  # Начальная награда

    # Штраф за застревание (долгое отсутствие движения)
    if curr_core["vel_x"] == 0 and action in ["runleft", "runright"] and abs(curr_y - prev_y) < 50:
        if collision_action == action and collision_start_time is not None:
            collision_duration = time.time() - collision_start_time
            if collision_duration > 0.3:
                reward -= 10  # Штраф за застревание
        else:
            collision_start_time = time.time()
            collision_action = action
    else:
        collision_start_time = None
        collision_action = None

    # Штраф за фриз
    if curr_core.get("is_frozen", False):
        reward -= 50

    # Штраф за удар молотком
    if curr_core.get("is_hit_by_hammer", False):
        reward -= 10

    # Награда за прыжок
    if curr_core["jumped"] > prev_core.get("jumped", 0) and abs(curr_y - prev_y) < 50:
        reward += 0.5

    # Награда за хук, если он помог изменить позицию
    if curr_core["hook_state"] > prev_core.get("hook_state", 0) and (curr_x != prev_x or curr_y != prev_y):
        reward += 5

    # Штраф за отсутствие прогресса
    if curr_x == prev_x and curr_y == prev_y:
        reward -= 2

    # Награда за близость к другому игроку
    proximity_threshold = 80  # Дистанция в пикселях, считающаяся "близко"
    for obj in current_state.get("other_players", []):
        if obj.get("type_id") == 9 and obj.get("parsed", {}).get("character_core"):
            other_x = obj["parsed"]["character_core"]["x"]
            other_y = obj["parsed"]["character_core"]["y"]
            distance = ((curr_x - other_x) ** 2 + (curr_y - other_y) ** 2) ** 0.5
            if distance < proximity_threshold:
                reward += 10

    return reward

def main():
    global iteration_count, epsilon
    print("ai.py ready", file=sys.stderr)
    load_q_table()
    prev_state = None
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            data = json.loads(line)
            state = data
            curr_x = state.get("character", {}).get("character_core", {}).get("x", 0)
            curr_y = state.get("character", {}).get("character_core", {}).get("y", 0)

            discretized_state = discretize_state(state)
            reward = compute_reward(prev_state, state, action=None) if prev_state else 0

            # Выбор действия только по argmax (без рандома)
            action_idx = np.argmax(q_table[discretized_state])
            action = ACTIONS[action_idx]

            if action.startswith("hook_"):
                direction = action.split("_")[1]
                aim_x, aim_y = 0, 0
                if "N" in direction:
                    aim_y = -AIM_LIMIT
                if "S" in direction:
                    aim_y = AIM_LIMIT
                if "E" in direction:
                    aim_x = AIM_LIMIT
                if "W" in direction:
                    aim_x = -AIM_LIMIT

                print(json.dumps({"action": "setaim", "x": aim_x, "y": aim_y}), flush=True)
                print(json.dumps({"action": "hook", "value": True}), flush=True)
                print(json.dumps({"action": "hook", "value": False}), flush=True)
            elif action == "jump":
                print(json.dumps({"action": "jump", "value": True}), flush=True)
                print(json.dumps({"action": "jump", "value": False}), flush=True)
            else:
                print(json.dumps({"action": action}), flush=True)

            if prev_state:
                prev_discretized_state = discretize_state(prev_state)
                next_max = np.max(q_table[discretized_state])
                q_table[prev_discretized_state][action_idx] += ALPHA * (
                    reward + GAMMA * next_max - q_table[prev_discretized_state][action_idx]
                )

            prev_state = state
            epsilon = max(MIN_EPSILON, epsilon * EPSILON_DECAY)
            iteration_count += 1
            if iteration_count % SAVE_INTERVAL == 0:
                save_q_table()
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()