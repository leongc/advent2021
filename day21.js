/*
https://adventofcode.com/2021/day/21
--- Day 21: Dirac Dice ---
There's not much to do as you slowly descend to the bottom of the ocean. The submarine computer challenges you to a nice game of Dirac Dice.

This game consists of a single die, two pawns, and a game board with a circular track containing ten spaces marked 1 through 10 clockwise. Each player's starting space is chosen randomly (your puzzle input). Player 1 goes first.

Players take turns moving. On each player's turn, the player rolls the die three times and adds up the results. Then, the player moves their pawn that many times forward around the track (that is, moving clockwise on spaces in order of increasing value, wrapping back around to 1 after 10). So, if a player is on space 7 and they roll 2, 2, and 1, they would move forward 5 times, to spaces 8, 9, 10, 1, and finally stopping on 2.

After each player moves, they increase their score by the value of the space their pawn stopped on. Players' scores start at 0. So, if the first player starts on space 7 and rolls a total of 5, they would stop on space 2 and add 2 to their score (for a total score of 2). The game immediately ends as a win for any player whose score reaches at least 1000.

Since the first game is a practice game, the submarine opens a compartment labeled deterministic dice and a 100-sided die falls out. This die always rolls 1 first, then 2, then 3, and so on up to 100, after which it starts over at 1 again. Play using this die.

For example, given these starting positions:

Player 1 starting position: 4
Player 2 starting position: 8
This is how the game would go:

Player 1 rolls 1+2+3 and moves to space 10 for a total score of 10.
Player 2 rolls 4+5+6 and moves to space 3 for a total score of 3.
Player 1 rolls 7+8+9 and moves to space 4 for a total score of 14.
Player 2 rolls 10+11+12 and moves to space 6 for a total score of 9.
Player 1 rolls 13+14+15 and moves to space 6 for a total score of 20.
Player 2 rolls 16+17+18 and moves to space 7 for a total score of 16.
Player 1 rolls 19+20+21 and moves to space 6 for a total score of 26.
Player 2 rolls 22+23+24 and moves to space 6 for a total score of 22.
...after many turns...

Player 2 rolls 82+83+84 and moves to space 6 for a total score of 742.
Player 1 rolls 85+86+87 and moves to space 4 for a total score of 990.
Player 2 rolls 88+89+90 and moves to space 3 for a total score of 745.
Player 1 rolls 91+92+93 and moves to space 10 for a final score, 1000.
Since player 1 has at least 1000 points, player 1 wins and the game ends. At this point, the losing player had 745 points and the die had been rolled a total of 993 times; 745 * 993 = 739785.

Play a practice game using the deterministic 100-sided die. The moment either player wins, what do you get if you multiply the score of the losing player by the number of times the die was rolled during the game?
*/
function* deterministicDie() {
  let i = 0;
  while (true) {
    if (++i > 100) { i = 1; }
    yield i;
  }
}
const testDie = deterministicDie();
console.assert(testDie.next().value === 1, 'first die');
console.assert(testDie.next().value === 2, 'second die');
for (let i = 3; i < 100; i++) { testDie.next(); }
console.assert(testDie.next().value === 100, '100 die');
console.assert(testDie.next().value === 1, '101 die');

function getSum(dieIterator) {
  return dieIterator.next().value + dieIterator.next().value + dieIterator.next().value;
}
function* diracGame(start1, start2, dieIterator = deterministicDie(), winningScore = 1000) {
  let turns = 0;
  let score1 = 0;
  let score2 = 0;
  let position1 = start1;
  let position2 = start2;
  while (true) {
    // player 1's turn
    position1 += getSum(dieIterator);
    position1 %= 10;
    if (position1 === 0) { position1 = 10; }
    score1 += position1;
    turns++;
    if (score1 >= winningScore) {
      return score2 * turns * 3;
    }
    yield { position1, position2, score1, score2, turns };
    
    // player 2's turn
    position2 += getSum(dieIterator);
    position2 %= 10;
    if (position2 === 0) { position2 = 10; }
    score2 += position2;
    turns++;
    if (score2 >= winningScore) {
      return score1 * turns * 3;
    }
    yield { position1, position2, score1, score2, turns };
  }
}
const testGame = diracGame(4, 8);
let testState = testGame.next();
console.assert(testState.value.turns === 1, 'turn1');
console.assert(testState.value.position1 === 10, 'turn1, position1');
console.assert(testState.value.score1 === 10, 'turn1, score1');
testState = testGame.next();
console.assert(testState.value.turns === 2, 'turn2');
console.assert(testState.value.position2 === 3, 'turn2, position2');
console.assert(testState.value.score2 === 3, 'turn2, score2');
testState = testGame.next();
console.assert(testState.value.turns === 3, 'turn3');
console.assert(testState.value.position1 === 4, 'turn3, position1');
console.assert(testState.value.score1 === 14, 'turn3, score1');
testState = testGame.next();
console.assert(testState.value.turns === 4, 'turn4');
console.assert(testState.value.position2 === 6, 'turn4, position2');
console.assert(testState.value.score2 === 9, 'turn4, score2');
for (let i = 5; i < 328; i++) {
  testGame.next();
}
testState = testGame.next();
console.assert(testState.value.turns === 328, 'turn328');
console.assert(testState.value.position2 === 6, 'turn328, position2');
console.assert(testState.value.score2 === 742, 'turn328, score2');
testState = testGame.next();
console.assert(testState.value.turns === 329, 'turn329');
console.assert(testState.value.position1 === 4, 'turn329, position1');
console.assert(testState.value.score1 === 990, 'turn329, score1');
testState = testGame.next();
console.assert(testState.value.turns === 330, 'turn330');
console.assert(testState.value.position2 === 3, 'turn330, position2');
console.assert(testState.value.score2 === 745, 'turn330, score2');
testState = testGame.next();
console.assert(testState.value === 739785, 'winning score. Expected: 739785, Actual: ', testState.value);
console.assert(testState.done, 'player1 should reach winning score on turn331');  

const game = diracGame(6, 1);
let state = game.next();
while (!state.done) {
  state = game.next();
}
console.log(state.value);
