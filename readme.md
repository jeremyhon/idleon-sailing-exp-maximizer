# Sailing EXP Optimizer

This Python script performs boat captain assignment optimization based on given data. It considers information about islands, captains, and boats to maximize the amount of exp gained per unit time.
It doesn't care about loot, so don't use this if you need to care about loot. This program was written with the help of ChatGPT.

## Prerequisites

To run this script, ensure that you have the following prerequisites:

- Python (version 3 or higher) installed on your system.
- Required Python packages: `json`, `pulp`, and `math`. You can install them using `pip install <package_name>`.

## Usage

1. Make sure that the `constants.json` and `save.json` files are in the same directory as the script.
2. Update the values in `constants.json` with the correct information.
3. Ensure that `save.json` contains your latest save data from idleonefficiency. (copy from raw data)
4. Update `minTimeInMinutes` and `boat_speed_multipler` according to the instructions.
5. Open a terminal or command prompt and navigate to the directory containing the script and data files.
6. Run the script using the command: `python script.py`.
7. The script will perform calculations and optimization based on the provided data.
8. The results will be displayed in the terminal or console.

## Data Files

This script requires two JSON data files:

- `constants.json`: Contains constants and data related to islands.
- `save.json`: Contains the latest save data for sailing, captains, and boats.

Ensure that both files exist in the same directory as the script and are properly formatted.

## Output

The script provides the following information:

- The status of the solved linear programming (LP) problem.
- The optimal assignments of boats to captains and the corresponding islands.
- The total reward value obtained from the objective function.
- The speed bonus for each captain, so you can identify which captains have 0 speed bonus and are thus interchangeable.

Note: Some parts of the script are commented out by default. You can uncomment those sections if you want to print additional information, such as the LP problem definition and objective value.

## Additional Notes

- The script utilizes the PuLP library for linear programming and optimization.
- The `compile_data()` function reads and compiles data from the JSON files.
- The script defines decision variables, objective function, and constraints for the optimization problem.
- The objective function aims to maximize the total exp per time by assigning boats to captains and islands based on specific criteria.
- The script also prints the speed bonus for each captain.

Ensure that the necessary data files (`constants.json` and `save.json`) are available and properly formatted in the same directory as the script for the script to execute without errors.

Feel free to modify and customize the script as per your requirements.