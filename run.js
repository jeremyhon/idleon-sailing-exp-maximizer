const constants = require('./constants.json')
const save = require('./save.json')

function* getPermutations(array, start = 0) {
    if (start >= array.length) {
        yield array.slice();
    } else {
        for (let i = start; i < array.length; i++) {
            [array[start], array[i]] = [array[i], array[start]];
            yield* getPermutations(array, start + 1);
            [array[start], array[i]] = [array[i], array[start]];
        }
    }
}

function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

function maxReward(boats, captains, islands, minTime) {
    let maxReward = -Infinity;
    let bestAssignment = [];
    let iterations = 0;

    const boatIndices = Array.from(Array(boats.length).keys());
    const captainIndices = Array.from(Array(captains.length).keys());

    const boatCaptainPairLength = Math.min(boats.length, captains.length)

    for (let boatPerm of getPermutations(boatIndices)) {
        for (let captainPerm of getPermutations(captainIndices)) {
            for (let i = 0; i < islands.length; i++) {
                let reward = 0;
                const assignment = [];
                for (let j = 0; j < boatCaptainPairLength; j++) {
                    const time = Math.max(timeToTravel(boats[boatPerm[j]], captains[captainPerm[j]], islands[i]), minTime);
                    reward += islands[i].exp / time;
                    assignment.push({ boat: boatPerm[j], captain: captainPerm[j], island: i });

                    if (reward > maxReward) {
                        maxReward = reward;
                        bestAssignment = assignment;
                        console.log(iterations, maxReward, bestAssignment)
                    }
                }
            }
            iterations++
        }
    }
    return { maxReward, assignments: bestAssignment };
}

function maxRewardDp(boats, captains, islands, minTime) {
    const n = boats.length;
    const m = captains.length;
    const k = islands.length;
    const dp = Array.from(Array(n + 1), () => Array(m + 1).fill(0));
    const choice = Array.from(Array(n + 1), () => Array(m + 1).fill(null));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            let maxReward = -1;
            let maxRewardAssignment = null;
            for (let x = 0; x < k; x++) {
                const time = Math.max(timeToTravel(boats[i - 1], captains[j - 1], islands[x]), minTime);
                const rewardPerTime = islands[x].exp / time;
                if (rewardPerTime > maxReward) {
                    maxReward = rewardPerTime;
                    maxRewardAssignment = { boat: i - 1, captain: j - 1, island: x };
                }
            }
            if (dp[i - 1][j - 1] + maxReward > dp[i - 1][j] && dp[i - 1][j - 1] + maxReward > dp[i][j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + maxReward;
                choice[i][j] = maxRewardAssignment;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                dp[i][j] = dp[i - 1][j];
            } else {
                dp[i][j] = dp[i][j - 1];
            }
        }
    }

    const assignments = [];
    let i = n, j = m;
    while (i > 0 && j > 0) {
        if (choice[i][j]) {
            assignments.push(choice[i][j]);
        }
        i--;
        j--;
    }
    assignments.reverse();

    const maxReward = dp[n][m];

    return { maxReward, assignments };
}

const constants = require('./constants.json')
const save = require('./save.json')
function compileData() {
    const allIslands = constants.islands
    const saveSailing = JSON.parse(save.Sailing)
    const availableIslands = saveSailing[0]
    const islands = allIslands.map(([distance, exp], idx) => {
        return {
            id: idx,
            distance,
            exp,
            available: availableIslands[idx] < 0
        }
    }).filter(island => island.available)

    const saveCaptains = JSON.parse(save.Captains)
    const captains = saveCaptains.map(([tier, bonusOne, bonusTwo, level, exp, bonusOneLvl, bonusTwoLvl]) => {
        const bonusOneSpeed = calculateCaptainSpeedBonus(bonusOne, bonusOneLvl, level)
        const bonusTwoSpeed = calculateCaptainSpeedBonus(bonusTwo, bonusTwoLvl, level)
        return {
            available: tier >= 0 && exp > 0,
            speedBonus: bonusOneSpeed + bonusTwoSpeed
        }
    }).filter(captain => captain.available)

    const saveBoats = JSON.parse(save.Boats)
    const boats = saveBoats.map(([curCaptain, curIsland, _, lootLvl, distance, speedLvl]) => {
        return {
            available: lootLvl + speedLvl !== 0,
            speed: calculateBoatSpeed(speedLvl)
        }
    }).filter(boat => boat.available)

    return { islands, captains, boats }
}

function calculateCaptainSpeedBonus(bonusType, bonusLvl, captainLvl) {
    if (bonusType !== 0) {
        return 0
    }
    return bonusLvl * captainLvl
}

function calculateBoatSpeed(speedLvl) {
    return (10 + speedLvl * (5 + Math.pow(Math.floor(speedLvl / 7), 2))) * constants.boat_speed_multiplier
}

function timeToTravel(boat, captain, island) {
    return island.distance / boat.speed * (1 + (captain.speedBonus / 100))
}

const data = compileData()
console.log(data)
// console.log(maxReward(data.boats, data.captains, data.islands, constants.min_travel_time_hours))