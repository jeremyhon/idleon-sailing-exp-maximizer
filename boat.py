import json
import pulp

import json
import math

# This is the minimum travel time in Sailing
# You can find this by clicking on any island in the Sailing map
min_time_in_minutes=105

# This is your boat speed multiplier
# Basically a multiplier calculated from all your other bonuses
# Including Alchemy, Divinity, Stamps, Slab, etc
# I worked this out by back-calculating it once using the formula on the wiki page
# and the actual boat speed in game. 
boat_speed_multiplier=10.8975

def compile_data():
    # Make sure constants.json is updated with correct values
    with open('./constants.json') as constants_file:
        constants = json.load(constants_file)

    # Make sure save.json is available with latest save data
    with open('./save.json') as save_file:
        save = json.load(save_file)
    
    all_islands = constants['islands']
    save_sailing = json.loads(save['Sailing'])
    available_islands = save_sailing[0]
    islands = [
        {
            'distance': distance,
            'exp': exp,
        }
        for idx, (distance, exp) in enumerate(all_islands)
        if available_islands[idx] < 0
    ]
    
    save_captains = json.loads(save['Captains'])
    captains = []
    for tier, bonus_one, bonus_two, level, exp, bonus_one_lvl, bonus_two_lvl in save_captains:
        if tier == -1:
            break
        captains.append({
            'speed_bonus': calculate_captain_speed_bonus(bonus_one, bonus_one_lvl, level) + calculate_captain_speed_bonus(bonus_two, bonus_two_lvl, level)
        })
    
    save_boats = json.loads(save['Boats'])
    boats = [
        {
            'speed': calculate_boat_speed(speed_lvl, constants['boat_speed_multiplier'])
        }
        for cur_captain, cur_island, _, loot_lvl, _, speed_lvl in save_boats
        if loot_lvl + speed_lvl != 0
    ]
    
    return {'islands': islands, 'captains': captains, 'boats': boats}

def calculate_captain_speed_bonus(bonus_type, bonus_lvl, captain_lvl):
    if bonus_type != 0:
        return 0
    return bonus_lvl * captain_lvl

def calculate_boat_speed(speed_lvl, boat_speed_multiplier):
    return (10 + speed_lvl * (5 + math.pow(math.floor(speed_lvl / 7), 2))) * boat_speed_multiplier

data = compile_data()

boats = data['boats']
captains = data['captains']
islands = data['islands']

# Define the problem
problem = pulp.LpProblem("BoatCaptainAssignment", pulp.LpMaximize)

# Number of boats, captains, and islands
num_boats = len(boats)
num_captains = len(captains)
num_islands = len(islands)

min_time=min_time_in_minutes/60

# Define decision variables
x = [[[pulp.LpVariable(f"x_{i}_{j}_{k}", cat='Binary') for k in range(num_islands)] for j in range(num_captains)] for i in range(num_boats)]

# Define objective function
problem += pulp.lpSum(islands[k]["exp"]/max(min_time, islands[k]["distance"]/(boats[i]["speed"] * (1 + (captains[j]["speed_bonus"] / 100))))*x[i][j][k] for i in range(num_boats) for j in range(num_captains) for k in range(num_islands))

# Each boat is assigned to at most one captain and visits at most one island
for i in range(num_boats):
    problem += pulp.lpSum(x[i][j][k] for j in range(num_captains) for k in range(num_islands)) <= 1

# Each captain is assigned to at most one boat
for j in range(num_captains):
    problem += pulp.lpSum(x[i][j][k] for i in range(num_boats) for k in range(num_islands)) <= 1

# Solve the problem
problem.solve()

# Print the status of the solved LP
print("Status:", pulp.LpStatus[problem.status])

# Print the optimal assignments
for i in range(num_boats):
    for j in range(num_captains):
        for k in range(num_islands):
            if pulp.value(x[i][j][k]) == 1:
                captain_letter = chr(ord('A') + j)
                print(f"Boat {i+1} is assigned to captain {captain_letter} and visits island {k+1}")

# Print the value of the objective
print("Total reward:", pulp.value(problem.objective))

for i in range(num_captains):
    captain_letter = chr(ord('A') + i)
    print(f"Captain {captain_letter} has a speed bonus of {captains[i]['speed_bonus']}")
