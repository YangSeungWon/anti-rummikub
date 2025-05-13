/**
 * Calculate score based on votes and topic difficulty
 * @param {Array} votes - Array of vote objects with userId and vote (boolean)
 * @param {Number} difficulty - Topic difficulty (1-5)
 * @returns {Number} - Calculated score
 */
function calculateScore(votes = [], difficulty = 1) {
    // If no votes, return 0
    if (!votes.length) {
        return 0;
    }

    // Calculate the percentage of positive votes
    const positiveVotes = votes.filter(v => v.vote === true).length;
    const votePercentage = positiveVotes / votes.length;

    // Calculate base score (difficulty * 10 is the maximum score per difficulty level)
    const baseScore = difficulty * 10;

    // Final score is the percentage of the base score
    const finalScore = Math.floor(baseScore * votePercentage);

    return finalScore;
}

module.exports = {
    calculateScore
}; 