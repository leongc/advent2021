/*
https://adventofcode.com/2021/day/25
--- Day 25: Sea Cucumber ---
This is it: the bottom of the ocean trench, the last place the sleigh keys could be. Your submarine's experimental antenna still isn't boosted enough to detect the keys, but they must be here. All you need to do is reach the seafloor and find them.

At least, you'd touch down on the seafloor if you could; unfortunately, it's completely covered by two large herds of sea cucumbers, and there isn't an open space large enough for your submarine.

You suspect that the Elves must have done this before, because just then you discover the phone number of a deep-sea marine biologist on a handwritten note taped to the wall of the submarine's cockpit.

"Sea cucumbers? Yeah, they're probably hunting for food. But don't worry, they're predictable critters: they move in perfectly straight lines, only moving forward when there's space to do so. They're actually quite polite!"

You explain that you'd like to predict when you could land your submarine.

"Oh that's easy, they'll eventually pile up and leave enough space for-- wait, did you say submarine? And the only place with that many sea cucumbers would be at the very bottom of the Mariana--" You hang up the phone.

There are two herds of sea cucumbers sharing the same region; one always moves east (>), while the other always moves south (v). Each location can contain at most one sea cucumber; the remaining locations are empty (.). The submarine helpfully generates a map of the situation (your puzzle input). For example:
*/
const testInput = [
'v...>>.vv>',
'.vv>>.vv..',
'>>.>v>...v',
'>>v>>.>.v.',
'v>v.vv.v..',
'>.>>..v...',
'.vv..>.>v.',
'v.v..>>v.v',
'....v..v.>',
  ];
/*
Every step, the sea cucumbers in the east-facing herd attempt to move forward one location, then the sea cucumbers in the south-facing herd attempt to move forward one location. When a herd moves forward, every sea cucumber in the herd first simultaneously considers whether there is a sea cucumber in the adjacent location it's facing (even another sea cucumber facing the same direction), and then every sea cucumber facing an empty location simultaneously moves into that location.
*/
function parseGrid(lines) {
  let result = [];
  for (const line of lines) {
    result.push(line.split(''));
  }
  return result;
}
function printGrid(grid) {
  return grid.map(r => r.join('')).join('\n');
}
// @return eastern i if it is open, otherwise original i 
function tryEast(row, i) {
  let east = i+1;
  if (east === row.length) { east = 0; } // wrap-around
  return (row[east] === '.') ? east : i;
}
// @return southern j if it is open after eastern moves, otherwise original j
function trySouth(oldGrid, eastGrid, i, j) {
  let south = j+1;
  if (south === oldGrid.length) { south = 0; } // wrap-around
  // south is open when not previously occupied by southbound and still empty after eastbound moves
  return (oldGrid[south][i] !== 'v' && eastGrid[south][i] === '.') ? south : j;
}
function* gridIterator(grid) {
  let result = grid;
  while (true) {
    let curGrid = result;
    let modified = false;
    result = [];
    // move east herd into new grid
    for (const row of curGrid) {
      let nextRow = new Array(row.length).fill('.');
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '>') {
          let nexti = tryEast(row, i); 
          nextRow[nexti] = '>';
          if (!modified && i !== nexti) {
            modified = true;
          }
        } // >
      } // i
      result.push(nextRow);
    } // row
    
    // move south herd after east herd
    for (let j = 0; j < curGrid.length; j++) {
      for (let i = 0; i < curGrid[j].length; i++) {
        if (curGrid[j][i] === 'v') {
          let nextj = trySouth(curGrid, result, i, j);
          result[nextj][i] = 'v';
          if (!modified && j !== nextj) {
            modified = true;
          }
        } // v
      } // i
    } // j
    
    if (modified) {
      yield result;
    } else {
      return curGrid;
    }
  } // true
}
/*
So, in a situation like this:
*/
const eastInput = ['...>>>>>...'];
/*
After one step, only the rightmost sea cucumber would have moved:
*/
const east1 = '...>>>>.>..';
const eastIter = gridIterator(parseGrid(eastInput));
console.assert(printGrid(eastIter.next().value) === east1, 'failed east step 1');
/*
After the next step, two sea cucumbers move:
*/
const east2 = '...>>>.>.>.';
console.assert(printGrid(eastIter.next().value) === east2, 'failed east step 2');
/*
During a single step, the east-facing herd moves first, then the south-facing herd moves. So, given this situation:

..........
.>v....v..
.......>..
..........
After a single step, of the sea cucumbers on the left, only the south-facing sea cucumber has moved (as it wasn't out of the way in time for the east-facing cucumber on the left to move), but both sea cucumbers on the right have moved (as the east-facing sea cucumber moved out of the way of the south-facing sea cucumber):

..........
.>........
..v....v>.
..........
Due to strong water currents in the area, sea cucumbers that move off the right edge of the map appear on the left edge, and sea cucumbers that move off the bottom edge of the map appear on the top edge. Sea cucumbers always check whether their destination location is empty before moving, even if that destination is on the opposite side of the map:

Initial state:
*/
const tinyInput = [
'...>...',
'.......',
'......>',
'v.....>',
'......>',
'.......',
'..vvv..',
  ];

// After 1 step:
const tiny1 = [
'..vv>..',
'.......',
'>......',
'v.....>',
'>......',
'.......',
'....v..',
  ];
const tinyIter = gridIterator(parseGrid(tinyInput));
console.assert(printGrid(tinyIter.next().value) === printGrid(parseGrid(tiny1)), 'failed tiny step 1');

// After 2 steps:
const tiny2 = [
'....v>.',
'..vv...',
'.>.....',
'......>',
'v>.....',
'.......',
'.......',
  ];
console.assert(printGrid(tinyIter.next().value) === printGrid(parseGrid(tiny2)), 'failed tiny step 2');

// After 3 steps:
const tiny3 = [
'......>',
'..v.v..',
'..>v...',
'>......',
'..>....',
'v......',
'.......',
  ];
console.assert(printGrid(tinyIter.next().value) === printGrid(parseGrid(tiny3)), 'failed tiny step 3');

// After 4 steps:
const tiny4 = [
'>......',
'..v....',
'..>.v..',
'.>.v...',
'...>...',
'.......',
'v......',
  ];
console.assert(printGrid(tinyIter.next().value) === printGrid(parseGrid(tiny4)), 'failed tiny step 4');
/*
To find a safe place to land your submarine, the sea cucumbers need to stop moving. Again consider the first example:

Initial state:
v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>

After 1 step:
*/
const test1 = [
'....>.>v.>',
'v.v>.>v.v.',
'>v>>..>v..',
'>>v>v>.>.v',
'.>v.v...v.',
'v>>.>vvv..',
'..v...>>..',
'vv...>>vv.',
'>.v.v..v.v',
  ];
const testIter = gridIterator(parseGrid(testInput));
console.assert(printGrid(testIter.next().value) === printGrid(parseGrid(test1)), 'failed test step 1');

// After 2 steps:
const test2 = [
'>.v.v>>..v',
'v.v.>>vv..',
'>v>.>.>.v.',
'>>v>v.>v>.',
'.>..v....v',
'.>v>>.v.v.',
'v....v>v>.',
'.vv..>>v..',
'v>.....vv.',
  ];
console.assert(printGrid(testIter.next().value) === printGrid(parseGrid(test2)), 'failed test step 2');

/*
After 3 steps:
v>v.v>.>v.
v...>>.v.v
>vv>.>v>..
>>v>v.>.v>
..>....v..
.>.>v>v..v
..v..v>vv>
v.v..>>v..
.v>....v..

After 4 steps:
v>..v.>>..
v.v.>.>.v.
>vv.>>.v>v
>>.>..v>.>
..v>v...v.
..>>.>vv..
>.v.vv>v.v
.....>>vv.
vvv>...v..

After 5 steps:
vv>...>v>.
v.v.v>.>v.
>.v.>.>.>v
>v>.>..v>>
..v>v.v...
..>.>>vvv.
.>...v>v..
..v.v>>v.v
v.v.>...v.

...

After 10 steps:
..>..>>vv.
v.....>>.v
..v.v>>>v>
v>.>v.>>>.
..v>v.vv.v
.v.>>>.v..
v.v..>v>..
..v...>v.>
.vv..v>vv.

...

After 20 steps:
v>.....>>.
>vv>.....v
.>v>v.vv>>
v>>>v.>v.>
....vv>v..
.v.>>>vvv.
..v..>>vv.
v.v...>>.v
..v.....v>

...

After 30 steps:
.vv.v..>>>
v>...v...>
>.v>.>vv.>
>v>.>.>v.>
.>..v.vv..
..v>..>>v.
....v>..>v
v.v...>vv>
v.v...>vvv

...

After 40 steps:
>>v>v..v..
..>>v..vv.
..>>>v.>.v
..>>>>vvv>
v.....>...
v.v...>v>>
>vv.....v>
.>v...v.>v
vvv.v..v.>

...

After 50 steps:
..>>v>vv.v
..v.>>vv..
v.>>v>>v..
..>>>>>vv.
vvv....>vv
..v....>>>
v>.......>
.vv>....v>
.>v.vv.v..

...

After 55 steps:
..>>v>vv..
..v.>>vv..
..>>v>>vv.
..>>>>>vv.
v......>vv
v>v....>>v
vvv...>..>
>vv.....>.
.>v.vv.v..

After 56 steps:
..>>v>vv..
..v.>>vv..
..>>v>>vv.
..>>>>>vv.
v......>vv
v>v....>>v
vvv....>.>
>vv......>
.>v.vv.v..

After 57 steps:
..>>v>vv..
..v.>>vv..
..>>v>>vv.
..>>>>>vv.
v......>vv
v>v....>>v
vvv.....>>
>vv......>
.>v.vv.v..

After 58 steps:
..>>v>vv..
..v.>>vv..
..>>v>>vv.
..>>>>>vv.
v......>vv
v>v....>>v
vvv.....>>
>vv......>
.>v.vv.v..
In this example, the sea cucumbers stop moving after 58 steps.

Find somewhere safe to land your submarine. What is the first step on which no sea cucumbers move?
*/
function countSteps(input) {
  let iter = gridIterator(parseGrid(input));
  let step = 0;
  for (const grid of iter) {
    step++;
  }
  return step+1;
}
console.assert(countSteps(testInput) === 58, 'countSteps failed');

const dayInput = [
'..v>.>.v..>v>.vvvvvv.>v.....>...>>..>.v>.....>..v.>..>v>..>.v.......v.vv>...v>..>..>..v.v.v..>>>v........v.v.>vv>>>...>.>>v...v>>.>.>...>..',
'>.>.>.v..>......v.>>vv.v>..>v>....>....vv.v....v>.vv.v.v>v>v....>v.>>v>>.>>>..v>...v.>.>vv..>>v...vvvv.......v.vvv>.v>>v...v>..>>.v>vv.>v..',
'>.v..>>.v>..vv...>.>..>v..v...vv>....v>v.>v..>....>v>.....>v>.v>>.v>...vv..>v>.v>>v.vv......>...v.>..>.>>vv..>...v.v.>.v...v..vv..>....>.>v',
'....>vv.v>v.>..>.v..v>>>v...v.v..>>...v.>......v.v.v..v>..v.>>v.>v>v.v....v>.>.>...>...vv.v.v..>>........>..>....v.>..v>...v..>...v.>>...>.',
'v..v...>v....>>....v.>.....>..v>....v>v.........v.>vv>>.v.>>v>>...>>.>v.vv>.v......>...vv.>>v..v>>...>.....>.>.vv.v>v>v.v.v..>...>vvvv.v...',
'.v.v..>v>>>vv..v..>....>>.v.v.>>vv.>>...>v..>v>..v.v.>>...v.v..>>.>>...vv.v......v...v.v...>>..>v>>>...v.vv..v...>>>v.>..v>vv.vv..v..v>>>..',
'v>..v.>v>.v.>..vv......v...>...>..vv>>..>.v..>vvv.v>>.>.v.v...v.>.>>.v.v.v.vv.v>>>.v.v.....v..>.vv.>>>>>>....v.>>.>v>>.v.>.>...vv.....>v..>',
'vv>vv..>.vv...>vv..>.....>v>>>>v.v>......v...>.v...v....v..>v...>>.v>.>vvv.v>.vvvvv>>vvv..>>....>.>>v>v..v...>v.vv.v....>>.>v.>..>v..>.>vvv',
'>>>v.v>..>.>.>v..v>v.vvv>...vv>>v.vv.>>vv>v>>......vvvv..>.>.>.>..>.>v>.v...>.....>vv..>.>v.>..>.>v>v.v.....vv.v.......v>..v.>..v.v..v...v.',
'..vv.v..>>v..vv.v>.v....>..>..v.v....v.>.v.>..>.>vvv..>>vvv>v>.>v.v.>...vv..v..>.v..v..v..>v>vv....>>.>..>vv>....>>..>...>v.v>..v...vv.>.>>',
'.v..>..>>>v....vv.>vvv.>.>v.v....>>v...>v..v.v>v..>.>>vv...v..v.v.v>.>v.v.v>v>vv......v..>...v..>.>....>>........v.v>>.>>....>..v>...vvv...',
'.>..>>...>..>.>....v>>..>>>v..v>.>>>>.>.v>....>.>.vv>v.>.v>>>v>>..v..v......v>.>>v...v>.v.>v......>v>.v.>>.v..>>...vvv.v>....v.vv>...>.vvv.',
'.....v..v..>v.>vv>v>>.v...vv.>v.v.>>>>..>...v>.v.>.v>.v...vv>..v.......>..vv.>v>>vvv>v..>v...>>v.>>..vv>.vv>....vvv.vv.>.vvv..>v>>.>..>v.>.',
'>.>>>..>.v.>..v.>...>v>...vv>....vv.v..>vv.v.vvv..>>>...vvv>.>>>.>.....>..>v...v>v..vv..>>.>..>>v...v....>>..>.>.v>>.v>v..v.>v.v.>>v.>..>>v',
'v.vv>.v>v.v>....v..v.v>.v>.v....>..v>>..>.v.>.>v>.>>v>>..vv..v.>v..v.v...>>.>.>>vvv>...vv>...>.vv.......>..>..v>.vv.v.vv...v..v.>>....v>.vv',
'v...>.>>..v.>..v.v..v.>.......>...vvv.v..>.v..>v...>v.v..v.v>.v..>>...vv....v.v....v.>v...v.v.....>v.....>vv..v.v....vv>>v..v..>v.v...v.v.v',
'..>>vv.v>v..>.v...v.v>..>.>.vv..v..v>vv.>v.....>v.>vv.>...v.>.>v.v>>...>>.v...>.>...v>..>>v>v>...>>..>...>v.>...>v...>..>.>vv>>.vv.v.vv>...',
'v..>vv>>...>.vv..>.v.v.>...>....>v.>v.>.vv..v..>...>...v.v..>.>>>.>....>>.>>vv....v.v.>v...>.......v.v...vv....>.>.v>.v>>..v...v.v..>v>>v..',
'v>>vvv.v....>.>vvv>v.v..vv>...v.>.>..vv>.v..vvv>v.>..v>.v>....v>>.>>>..>.>.vv.....>>>v.>.v..>v>...vvv..v.>.v...>..vv..vvv.v....>.vvv..v....',
'.vv>v>vv...>...>>vv.>vvv>.v...>.>....v..>....>.v>vvv....>vv.v..v>>vv...>v.>.v..>v.>.>vv...>>.v.vv......>>>vv.vv..v..vv>..>>.vv..>..v..>v.v>',
'>>v>.>.>v>.>>>.>>v.>v.>.v>>.>>v.>.v..>vv..>.v..>...>v>.v>v..v.v.v...>>>v.>.vvv...v>.>.v.v>..>>>>.>>v>..vv.>>>>vv.vv>v>v>v.vv.vv.>.v......>.',
'v.v...>v.vv>..>>.vv>....v>>.v.v.v.>.v>.>vv...v..vv...v..vvvv.>...>v.v.v>vv.vv.v.v.v.vvv>..v..>..........v.....>.v.v.v.>>>...>>.v.>>.>.v.v>v',
'>..>..vv.>v....>.>...v..>.>vv>>v..>.v.>>v.v..vvv>v..vv.>.>...>.>..v>v.>vv..>.>vv...v>.vv........>...v.v.>vv>>..>>.v>..v..>>>..v.v>.v...vvv.',
'...>>.>>.....>v..>.vvv>..v..vv.>vvvv>v.>>.....>>..>..v>.>v..v.>....v..>>..vv>.>v.v>v..v.v..vv..>>v>.v.>>.vvvvv>>.v.>v>vv.vv>>.v>>..v>..>...',
'.>.>.>>....>.>.>>v...>.>......v>..>>.>v...v..v..v>>>>.>.......v>.v>........vv.>v..>..v.....>>>.....vv...>...vv>>.>v>....>.>..v....>...>v>v>',
'>..v....v..v>v.>..>>.v>>......>>v.>.v...>v>>.>vv.v.>....v.v>.>....v...>..>.....>v>...>vv..v..vv...>..>v..>.>.>>.>>...vvvvv.>>.vv.vv..>v....',
'>.v.....>>v..v.v...v..>..>.>vv>>v....>>.>.>v>v>.>>>>>.>.>>v...>>....v...v>>.>>...v.>.>vv>..>.v..>.>...>vv...v.>v..v.>v...>v>...>.>.v>v>>>>v',
'v.....v.>vv...v.>..>vv.vv>...vv>..>>vvv..v>>v>v..v.v.>.>vv.....v>vv...>vvv..>>v>...>..>>v..vv.v>v...v.v..>v.v>v>>..>.....>v.v>v.....>>>>...',
'>v>v.>.v.>>v.........v.........v.>v.v>.>...>v>...>...>>v..v>v>vv..>>..v.>>>.v.>...>v>>.>...>v...>....>vvv>..vv.....vv.v>v...>.v....v......>',
'.v.>>>>v>v>.>>...v..vv.>.vv..v.>..>v....v..>vvv.v>>.>>v.v.v.v>v.vv..vvv...v..>>v.>v>>..vv>.>v...>>.>>v....v>.v.v>vvvv.v....>>.v>>.>.v>v.vv>',
'v...vv..v>vv>>..vv....>v..>>..v>.v.>v.v.v.>.>v...>>>......v.>.>.>v.>..v.>vv>v...v.....v......>..v...>v..>v.v...v.>v.vvv..>.>.>.v>vvv.>.v...',
'v>...vvv.>v>v>>v>v.v..v....v>v..v>v.>v.>>>>>v..>vvvv.vv...vv.>vvv....>>>...>vvv.v.>v>.v..>..>>v.v.vvvv>...>v.>......vv>....>.vv...vv.vv...>',
'v..>..>....>..vv..>>v.v.v.v.>v>v>....v..v>.v.>>..>vv..v...v>..>...v>>..>.>.>.>..>>vvv>>..>.>v..>..>v.>..v..>.vvvv>v>v..v>.v.>v..vvv.v>.>v>v',
'.>>>>...>.>.v...v>>>vv.>...v.v..>........>>v>.v>..>.vv>>vv>.vv.v.>v>vvv..>vvv...v>>...>vv.>>>.>vv.vv..v..>>..>vv>..v>.>>.>>v.v>v>..v..v..>.',
'.vv..v.>.>.vv.>v.vv.>.>>.v...>>...v.>vvv.v.....>>v.>.>...v>v.>>....>.v..>>...>v.>v>.>v.>.v.>>.......>.v.v>>>vvv>.>>>.v>.>>.>.v.v>v...>vv.>>',
'..>.>..>v..v>v.>>v..>v>.>v.>.vv.vv>.v.v>vv>.>.vvv.>...>v....v.>.v>...>.>.>...>>>....>v>>.>.v>.>v.....>>v>...>vvv..>>v.>v.vvvvv.>.vv..v..v..',
'>.v..v.v.v...v>....v....>>vv..v>.v.>>>v.>v....>..v......>>.v.>>v>..vv...>..>v....v..>.........>..v.....v..v>>>.v>.>v..v.>vv.>vvv>..>v.v>...',
'.v>>.v.>v....>..>...v.v>>v>v...vv.>v.>>..>......>v.v.>>vv>v..>..>v.v..>..>.v..>.v>.>...>v>>v.v.....>>v..v..>v>.v...v..v.v..vv>v>vv.>>.>..>>',
'...>>.v.v>>v.vv.v>>.v.>.>>v>.>..v>...>>>..>......>v.>v>v>....v>v>..>..v..>v>.vv>>..v...>...>>vv>v.vv.v.v.>...v.>vv..>v>.>.v>>..vv>vv.>>..v>',
'>..>..>vv..>....v..v.>v....>...>>>.>v..>.>.>>>.>v.v>.v..vv>.v.>...>..>v>v....v.v>.>>.>.v....v>..v.....>>v.v>...v>.v.>.>.>.vvv.>...v.vv.>.>v',
'v>.v>v....>v..vv>..>vv.>>.v.>>>v>.>v>.......>.v..>v..>...vvv>..v>..>.v...v>v.vvv.>..>>>v...vv.>...>>.v>>>..v.v.v...>..>...>>...>v...>...>v.',
'.>.>..>>>v...v>>..>v..>..>v.v>v.>.v>>...v.vv>>vv>....>>>.>.vvv>..v.>..v>>.v>.>v.>v.v.>>..v.v>...v..v>>v>vvv.>vv..>v....v..>...v.>.vvv>.>>.v',
'vv.vv>v..vv>>>.v....>.>>.>.>v..v>vvv..vv.v>.v.>>.v..v>...>..vv>.v..vv>v.>vvvv...v>.vv...v..vv.>>v>.>>>>.v.>>>>>>v>....vv....>....v....v.v>.',
'v....>>>>v.v.v..v.v>>..>>>vvvv>>.v...v>....>>...>>.>v..>>v.>......vv.vvv.>vv>.>....v.v>..>v..vv..>vv>v.>v>.>>>....>>..v....>.>.>v.>.v>v>.v.',
'..v...>v>vv>vv..>.v.>..v.v>v...>..>.vvv>.>..>....>>>>>>.vv..v>v.>.vvvv...v>>>>>.>......>>.vvv..v.vv.>vv>....v.>>.....>v..>>....>>v.v..>vv..',
'...v..v.>v...>>....>>...vvv.>.vv.>..vvv.>..>.>v...>v....>..v....>.>>vv>v....v>v>.vv.>v>v.v>>>v...v.v>>v>v....vvvvv.....v......v>v...v>>.vv.',
'v.>.>>>.>..vv>>vvv.....>....>vvv...vvv.v.vv>v.v>.v..v......v..>.v>..vvv.....v.v...v.>..>.>>.>>vvv>.v....>vv..>>>.>>....>.>..>...>.v.vv>>>.>',
'>vv.....v>v>>vv.vv..>.vv>....v.>>....>>>v>.>.v..v>.v>>.>..>>..v...>vv..vv>...>.......>>.>>.v.vv......vv>.>>vv>v.vv..>>.v..v..v..v>.....v>>v',
'vvv>v>v.>v.>..>.>v>>...>..>>..>.>.>..v.>.v>....>..v>.v.>.v>..vv.>>>...v..>v>>.v.>.v.>....>..v.>.>>vvv.vvv....v..v..v.>...v>>...>.>.>>>v..vv',
'vv>>v>.>.v.v.v>>..v..v....>>>.v..>v..v..>..>>.v.>v>v>v..v...v.v..v..>vvv>v>>v.>v...>v.v.>.>.>.v...>.v.v..vv..>v..>..v..>vv>...>v>>...v..>.v',
'>v...v>.>......v>>>v..v.>>v..>..vv.v.v..>...v>.......v...>.>>.>>>.>>v>vv....v....vv..v..>.vv.>>....vv..v>>.v.>.v.>.>.>.>v>.>v.>v.v....>v>>v',
'vv>v.v.v>.>.v>..v>vv...>..>>.vv>.v....v>>>>..v.>>.>>>.>..v>>>.v..........v.v..>.>.vv.>..>.>>v...vvv.....v....vv>>....vvv.vv....>.>.v.......',
'..>vv..>........v.>v........>..v......>>.>v.>v.....>>.>v>.v.>.>.v.v...>.>vv>...>..>v....>....>..>v..>v..v..>..v.>..>....v>v.>v..>.v.>>.>>..',
'.....>>..>>.>...v>..v.v>.v.>>>v>..>.v.vvv.>>.v..>>vv>..>.v.vv.>...vv.v..v.....vv..>..v..>.>>v.vv.>.>vv>>..>>....v>.v>v>v>>v..v.vv.>.vv>>v..',
'....>.v>v.>>.>.>>.....v.>v.v..v>>>>>.>.v>..v.>.vvv.v.v>.>>>>v.v..>>vv>...>v..v.....>.>....>......>.>v.v....v..>v...vv..v.v.v.>...v>>.>v>v>.',
'.vvv...>..v>>>>>....>>...v.v.v.v>.vv.>......v>.>.vv..>..vv........>>.>>v.v.>.>.>.>>>.>.v..vv.>.>....>.v.vv....>>....>..>.v.>..v>>v...vv>...',
'>>.vv..>v.>v.vv>...>.>v.>>v>.>.>v.v..v..v.v.......v>.vv.>v..>.v>.>.......>>>vv>..vvv..>>........>.>v..>....v.>..vvv.>.v..>.v..>..v>>....>.v',
'..>....>..vvv....>....v.v.>..>>v>..>>>v..>...>...>..>.....v>..>>>v.>>>v.>v..v...vv>.....v.v..>..vv.>..vv>>.vv......v.>..v>.....>.>v>...>vv.',
'.>.>..v.>v>>>>.>.....v.v...v...vv..v....v>..>.v>.v..>.>>v.v.v.>.>vv..>v..>vv.>.vv...>>>v.>.>.v......v...>...>........v......>>>>v..v....v..',
'vv.....v.v>..v.>.vv.v....>>.>>..v.>...>..v....>....>.....vv...v>vvv..>.vv.vv>v...v>....>>vv...v>>vv..v.v.v>.......v>.>>v.>>....v>v>.v>>.v..',
'..>>>..>..v>>.>>>...v>v......v.>.v>.......>v>...>.>v.....v.>>.....>>v....v.>..>vv>.>v>.v>..v>.v>....v>>.v>v.v.....v.v.....>>>>>vv..v.>v..>.',
'.>...vv>.v>.vv..v>.v...>v>..>>vvv.>>.>..>.>>.......>...v.v>.>.v>vv..>...>.v..>...>v.v.v...vv...v.....v>>v>v..v>.>.vv..>.vv...>v>>>>>.>>.v>.',
'.>.v..v>v.vv.v>v..>>.v>>v.vv.v.v..>......v..>..>>.>..>v.>.......v....v..>vvvvv.vv..>..>>.v>v>.>>...>.v.v>>v..>..>.vv>v..>...>>.>>>v>>...>.>',
'>>..>vvv>v..v>...>..v..>.>..v>>v.v>>..v.v.......>.....>>...>vvv.v.>>..>v.v.vv.v.v>>....v>v.v..>>vv..vv.>v....>>v>v>>.v.v.v..>...>...v.....>',
'.>..v.>v.v.>vv>vvv...>..v.v.>.v..>v>>>>>..v>>...>.v>.vv.....v.....>..>v.>...v....>..>v....vv.>>.v......v..>.vvvv.>.>...>....>.>...v.v...>v.',
'.>>>..>v.>.>.>..v.v.v.v..v.>.>.v.vv..>...>>v.>.>v.>>...v..v>>v..>..>.>.....v.vv...v.v>...v..>.....v.v..v>v....>..>..>v...v.>...>>.v.>....v>',
'..>>..vv>v>.......>vv..v>v..>.>v......v>..v..>...>v>.v>.v..vv...v.v.v>.>..>.....>>.vv.v>....>v.v.>>>>.v.vv>.v>.>..v>>.vv>.vvv.v....v.>...v.',
'>>.v>...>>>.>.v...v...>>.v>>.....v>..v>.v..>.v>v>v..>v.v>.....v>..>.>>..v.>.>>..>v>v>>>v.vvv>....v..>.>>v.vv.>.v>.>.>>.........>>.v...v>..>',
'..v>.vv..v.vv.>>v..v.vv..vvvv.v>.v>>.>.>>vv.>.>>>....>.>....>>>..v>v.vvvv>>v..>v..........v>..v.>...v....v>>v>..v..>..>..>>>>>...v....>v...',
'.>>>.v>.>>.v...v.>.....v>>v.vv....v>>....vv.v.>....>.v.>...v.v..>>vv>.>..>v.......>..v>.v.....>...>.v.v..>..>.>..>>v>.v>>>.>..>>.....>v>..v',
'....>.>vv>vv>..>....v..>.v...>....v..v>>.v..v.>.>.>>>..v...>.>.>>.v.......vv..>....>>>.>vv.v.>>.vv..>v>...>.>>.v>.vvv>..vv.>.>>v>>..>.>>...',
'..vvvv...vv..v.....v.>vv.>v.....vv...v>....>.v.v....v..>v>>..v..vv..v>v>.v.>>vv>.v..vv.v.v>>.v>vv>..>..vvv>v.>.v>..>.>....v>.>>...v.>.>...v',
'v.>>>>>>>v>..>vv.v.v.>.>v..>>.>v>>>v.v.....v.v.v>v>v....>.>.v..vv>.vv.v>..v>.>v>>.v.v..vv.>>>v>.>.v.v>..v....v...v>....>...v..v>v....v..>>.',
'>vv.>>....>v>v.v..v..>v>..>..>>v>>.v......v>.v..>.vv..v...v>....v.v.>vv....v.>>.vv..>>.v>>v..v>...>....>v....>.v...v.v.......>.>..>..v.v>..',
'v>>>.v>>v.vv.v......>.....v>v>v>.....>vv....v>.v.v..v>>.>>.v.>>v>>.>v.>..>.v.v...v.>>v>>...vv.....v>..vv..v.v.>>.>.v>.>.vv>v....v.>...>vv>v',
'v>vvvv.vv>>vv>..>.vvvv>>.v..>.v..>..v.>..v>..>.v>..>...vvv>v.>v..vv.>.>>>v....v>>>..v.v...>......v..>>v.vv>>>v..>.v..>....>v..v.>>vv>...v..',
'v>.v.vv.vvv.v..>>v.vv.....>...v....>..v..>.....>v..>....v.>.>>v>....>>>v>>.v>..v...>.v.>>...>>...v>.>.vv......>>.....>v>>...vvvvvv.v...>.v.',
'>...>.......vvv.v>v..v.....>>v>.v.>>v>.v.>>..v>vv..vv>.>.v.>.v.v>v>.v.>>.v.>...vvv..v.v.v>.v....>v>..>...v.>.>v>...>...>..vv...>....>>.v.vv',
'.v.v...v.>v>v....v>.>.>.>.v.v.v...vvv..v>>vv..>v.>>>v.>.>v..>v....v.>vv..>>>.....v....v..vv..v>..v...v..>..>..v>v>v>.>.vvv.v>..>..v......>v',
'v>>>..v.>..v....v..v>vvv>..vvv>>....v.>..v.>v...>v.v>>...vv..v..>v..vv..vv>v.v.>v.v.>>...v.vv>..>>..>>>...vvv>..>.>...v.v.>.....vvvv..>.v>>',
'.vv>.vvvv.....vvv>v...>..>.>.v.v>.v>>...>..v>..vv.>..>..>.>..>>vv.>v>.>v...vv>>..>>.>.v.>...v..v>...>.>>v>>..vv.vv..>v.v.>>.vv.vv..>.>>>.>v',
'>.>v.>>..>vv>..>..v..>>>>.>.>>..v...v.v...v..vv.>...>>>...>>>v.>>v.vv..v.v>v>.>>.v>v...vvv.v..v..>v..v.>>....>..v.v.>v>>..vv.v.>...v..v>..v',
'.>>>..v.v..v.>.>..vvv.v>v...v>.>......>v...v.>..>v....v....vv....v.v..vv...v>v.>v>..vv..v.v.>v.....v....>.>v..>>>>...v.....>.v>..vv>>>..v.>',
'....>..>vv..v..>..v>>..v>.>v.v>..>>..>.v..v>>vv.v.>>..>..v..v.v.>.>..>....>.>.v>v..v..>..>vvv>...vv..>vv>..v..>vv..>.v.>......v>...vv..v>v.',
'..>vv>.>.....v.v.v>v.v..>.vv..>v>v>...v>v.>.vvv.>>v...>....>>>>vv.>.v..v.>v>>.>..v>v>>>vvvv>...>v.>..vvvv...v>>v...v.v.>>.>..v>v..vv..>v>v.',
'.>>.>v...>.v...v>>>..>>...>...>..v..v>.>....>>.v>>v.>.v>.v.v>v.>..v.v..vvv>.>v..>vvvvv.>.>.>>v>v.v>v>v.>...vv......v>vv..>..>>v.>.v.>>...>.',
'.vv.>>>.v..>>.vv.v....>>vv>v.v...v..v>...v.>v.v..>v.>.v>.v.v.>..>>...>v.v>...v.>>>.v...v>>v>..v..>>...v>v.>vvv.>v...v>v.>v...v......>.>.>..',
'vvv...>...>...>>>>v>>.v>.>..v..v..>v>>..>>..v..>.vv>.vvv..>vv.v...vv...>.>.v..>..v>.v>v.>....>...vv>..v.v.v...>vvv.....v.>.v>v..v...>vv..>>',
'.v.>..v..v.v.v>..>..v..>>..vv>>.v..>>v..>.v..v>v>>v>>....>.>v.v>v>>....v>v.v.>....v>.>....v.v......>vv>vvv.v..v..>..>>.....>..>>v......v>>.',
'..>>.>.v....v>vv..>v..>>v.>>vv...>>.v>>..vvv>>....>>.....>.v>....v>v.>v...>.>.>..>.>v>.>v>vvv...vv>>...vv..>..v...>..>....vv.>.v...vv....v.',
'...>v.>....>......>.v>...>.>>v>..v..v..>..v...vv.>.v..>..v.>v.v>>>.v.>.>>.v>>......>.>.v.>v....>>v.>vv.vv.....vvv>v>v..>..>..vv>..>....v.vv',
'..>vv.v.v.>.v>.>..>v...>v>.>.>v>...>>....>>v.>v..v.>.>>....>>.>.>v.>.v>..v>>.>>.v.>.>v>>.>v.v..>>..v.vv...vv.>>v>.>.v>.......>.>.....>.>..>',
'...>.>v>........>..>..v.vv..>..>..>..v.vvv.>..v.....v....v.>.>...v.v........>.>....>>v..v..>....>vv.>...v....v.v..>.....v>v....v...v.>>...>',
'..v.>v...>.v.>.v.v..>v>>.>vv..v...v>.v.>vvv..vvv..>vv.v.>.>>..>.>v..v.>..........>vv>.v.vvv...v..vv.v>v>.v>...>vv>>>..>.v>>.>...vv...>vv>>v',
'.>>>v>>.>>...v.>vv...>v.vv..v.vvv.>........>vvv>>..>..v.>.v....>v.v..>vv....v.>>.>>.>..>.>v>..>>.>vv>.>>v.>>..v>.vv....v...v........>v.v>v>',
'v..>vv>>.>>.>>.>.v.>>.vv>.>...>.v.v..>....>v.vv.v>.v...>.v>v.>.v.v.v..>v.vv...v>v..>>>>>....v.v>.vv.vvv>v..vv.v..>..v...v.>>v>>.>...v>v>.>.',
'.>.v.v...>...>v.>.v.....>...v>>........>v>..>v...>>..>.....>.v.vv>>>v>>.vv..>v.>..v....v>..>v...>v>v>.>.>.....vv>v.v>..v>>>..>v..>.>.>>>v.v',
'.....v.v>...v.v>v>.>.>.>>v.>v>>..>v.v.>.>....>>>v>>...>v.v..v.v>>>......>v..v..>.>v.vvv.>.....v...>>..>...>v.....v...>v..v>....vv..>.>.>.v.',
'..>..vv>>>..v.>>.v.v>>v..v>....v..>.>.>vvvv...>..v>.>>.>v.v>.>vv>v..>.>..v>...>..>v>v..v...>v...>..>v...>v..>..>...v>vvv........>.>.v.>v.vv',
'>.v...v>>.vv>>.v.>>.vv.>vv.vv..>v.>.>.>v.>.>.>>>>...>......v.>>.v.>>.>.v..>.......v.>.>vvv...v>.v...>v.v.v..vv>..>.>......>>..v...v.>v>..>>',
'.>.>.vv>...vv>.v>.v.>>..vv...v.>v.>....>vvv....v.v>>.v.vv.v>....>>v>..>...........>>..v...>.vv.v.v.v>....v.....vv..v........v.>....>.>v.v.>',
'.>v>>...>>>....>.v.v.vv.>.>>....v.>.>.>..>....v.>>.v>.>..v>.v>...>.>v..vv.>v..>>>v.v>>>vv>v.v..v>.....>>>..v..vv.v.>.....>.vv.vv>.vv...>>>v',
'.>.....>v........v.....>...>.v.>>>.>.....vv>...>.>.v.>.>.v>v>.vvv..>>..vv>>.v..>.>>.v>.>.>..>..vv...>>>.>>>.v>v>..>>>.v..v>.v......>.vvv>>.',
'v..vvv>>vvv.v..>>......>>...vv.v.>.v..vvv.>.vv>.>...v>>v...v...v.v.>...v.>...v.....>>>..>>.vv..v.>....v.v.v.v>v...v..>>.>v.>>>>v>>.>.v...v.',
'>v..v...v>>v...>>vv..>.v.>v.>.>.....v.>..v..v.>...v>>v.>v>..>v...>.>>..v>...>>.vv>..vv.>...>..v....v..>.vv>v>vv..v>.>..vv>>..>.>v>>v..>....',
'.v>>>.v.....>..>.....vv.vv>..>.>>..>vv.>v.....vvv>.v>.v.v..vv>...v.>...>v..>v........>...v..>v.>..v.v..v...v>v>v>>.v..>v.>.vvv>>....v.vv.v.',
'.>.v.v.>.v>v.>v..v.>...>.>.>..vv>.>v.v..>.v>.v..v>v.>...>>v.v>vv>.vvv..v.>v.>>...v..vv..v.v.vv.v.v.>v>.v...v.>>v..v...>>>vv..vv..v.v>.v.vv.',
'>.....v>>v.v>>.v.....>>>vv.v>v>>.>>v.v.>>.>>..vv.v...v>..>..vv..>>>v.>....v.>v.>vvv>>vv..v>.vv.v.>v....v>...>......v>v>.v..v..vv>vv>>.vvv>.',
'..>.>v>..vv>.>....>>.v.>>...>.v.>vv.v>........>>..vv..v.vv.>v>.....>..v..>..>>.vv.v>..>....v.vv.>...>>>.v...>.>..>.vv>v.>>vvv..v>>>.vv>vv..',
'v..>>..>v.>v>v>>>>..>...v>>>>..>v>>...v....v..v.>..v>.v..vv......vv.>.>.vvv..>v..vvv..v>>..>.v.v..>>.v>>vvv>v>.vv..>......>vv.>.v.>>...vv.v',
'..v.v..>..v.>.v..>.>.>.....>...v.>>.vv.>..vv>.....vvv.v.v>>.v>v.vv.v.v.>v..>....>.....v.v>>.>v.v>>.>.>>>.>v>..v>v..>...v..vv..v>v.>.>v>...v',
'..>..>>v>>v.>.>.....v.v..>>.vv>>vvv.vv>v>>.>v.>.v...vv..v.>.v...vvvv..vvvv>v.v..>.....>...v>v.>v..>>..vv..v....>.v>...>..>v..vv.v.v..v.v...',
'..>..v...vv.v.v.>..v.>>v...v...>>v>..v>..>>.v..v.vv......>v>..>>.v..>>>v...>v.v>.>>v>>....>v>.>>.>>v>..>>.vv.vv>>...v.>.v>.>>>v..>vvv>v.v.>',
'.>v.>.>.vv.v..v>..v..>.v.v>.v.>>..>...>.v..v>.v..>>>vv.v.>.....>....v..>.v>v..>..>>.>.v>vv...>v.v...>.vv...v>...v>vv.v>>..>.>.>.vv...>>>v>>',
'..vvv>.>v>>..vv>vv...v.v.>>.v..>v.v.>>.>.v>>...vvv>vv>..vv>..>....v.>..v....>>.v...v.>..v>>..>>.v..v>..>>v>..vv.v>...vv..>.vv.v>>>....>vvvv',
'v>>.>>.v>>.>.v..v>..v>v>...>.v..>>...v>.>..>.>..vvv.>v.>........>.>>..>>>>>..>>v..>..v..>.v.>.v.>>v.v...........>.>v.vv.>>.v...v>v>>.v.v.>v',
'v..v.>>>v.>vv.>>v.....>>.>.v.v..v>.>>....v>v>v>..>v.v>v.>..v>..v.>>>.v>vv.>..>v>>......vv.v.>>.vv..v.>....>>>..>.v.>.vv...>v.vv.>.>...v...v',
'..v>..>.v>>..v.>..>>.>...v>>v......vv.vvv.>..v.v>.>..>..>>v.>v..v>v.>>..>v.>...>>v.>...>....v...v>vv..v.v>.>.>.>v..>>v.>>.>.v>.vvv.>v.>.v..',
'..v.vvv>........>>vv.>.v>.v.>..v>>v>...v.vv>>v>>>.vv>v..>......vv.....v.v....>...v.......v..v..>v>v.v....>..>v.>v.v...>vvvv.v>.v>>v.>..v..>',
'...>.vv>..vvv>v..v....>>......>v>v..v..v..v.vvvv>vv..v.>...vv>...v>...>v......>v>>v.....vv.>....v>>>......>.v..>.v....>vvvv...>..v>>v...v..',
'.>v>>v.....v..>v.vvv>>>v.v>...>..>....>..>v..v..v.>>..v..>...>..vv..>....vv>v>v>...v...v>.v>>.....>.>.>.>..v.....>..>v..v.....v..v>..v.....',
'...v....vv>>..v>>.v.v>.>..v...v>..v.......>v>vvv.vv.v>.>>>v.>..v.v..>.vv>.v...vv.>.v.v..>..v.>vv.v>>..>.>...>.v>.v.v......>v>>v>.>>>...v>.v',
'>>v.v.v.>.>.v.>vv..v...>.>...>....vv>..v.>>v.>....vv.>>....vv..v.........v....v.v...>...>v>..v.>.vv>>.>>>..>v>....>..>>...v.v..>.vv....>.v.',
'v>.>.v.>v...v....>v>>>>.v..>.v>.>v..>vvv.v>v>..>>vv......>>.v...>.v...v.v...>vvv..>>>vv.vv..>v>vvvvvvvv...>...v>v..vv..v..v>.vv>..v>.>>..>.',
'>....vv.v.v...v>..v...v.>>>>.v>.v>.>>..>v.v>.v>v....v...>>.>..>>>v...v>.>.....>>..v..vv.vv.v..v.v>....>vvvv.>vv.vv...v.>.>>.v..vv>v..vv>.v.',
'..v.vv.>..v>...vvv>vv.v...v>..vvv>.vvv.>.>v>.v>>.>...v>.........v.v......v.>>..>...v.v...v...>.vv.v.>vvv>v.>vv>..v..>vv...v..v.v...>.vvvvvv',
'..>>v...>...........>>v>>...vv>v.>v........>..v>...vv....v>..v..v>>vv...>..>>...vvvv.>.>>>.>vv...>v.v.>>.......>..vv>.>vv.v.vvv..>vv>>.v.>.',
'.>vv>.>>>..vv.v..>.>v....v.>..v>.v.vv.vv...v..>.vv...>v>.>...vv....v>>>v..>....>....vv.>.>..>..>.>v.vv..v...>.v...v.v>.>>.......>..>v......',
'..vv.>....>.>v.>..>.>>>.v..vv..vvv>..vv.v>...v.v>..>..vv>.v.v.v...vv.>....vv...>.>....v.v.>>.>>..v..>>..>..>>v.v>vv>.v..v.v.>..>..>>.v.v>vv',
'.>..vvv>v.>.v>>v>v>.v..>..>v..vv>>>>.>>...v>..v>>>v..>>>v>>.v.>>.>>.>.>>v....v>...v>.v>v>vvv.>.>v.....v>.>v.v...>...v.v...v.v...>.....v>v..',
'..>v.>...>>.>>.v>..>v.>..v>..>...v.>..>.>..v......>v.v.v>..>>>v.v.v..>.>v>......vv..>.....vvv.>.v>.vv...v...>.v.v.>..>.>>.....>>>>...v>....',
'>.v>vvv>....>..v>..v.>..>vv>v..>...>>>>....v..v...>v.v>..>>..>.....>>.....>..vv>>.>>......>.>.vvvvvvv..>v.>>>v>....v>.v>v.v.v.vv...>>....>.',
'vv>>.v>..>vv..>.v.>.>.vv.v..vv.>>..>.....vv.>.v..vv>v>vv...vvv>....v>.v>v...>vv.v.vv...>.vv>.v.vv>....>..>>v..>v.>.v.v..v>v..>.vvvv..v..v>>',
'..v>v>>....vv....v>..>.>v.v...>v.>.>>.>>>.v..>.v>v>......v>.....v..>.>vvv>.>..>.v...vv>>v.>vv>v..v.>.>v..v.>.>>>.>.v.v.>.v>vvv.>.>v....v...',
'>v..v.>v....vv>v...>.v....v>>..>..v..>>...>....v..>..>vv>v..>v..>v.v.>v......>.v.>..vv>>v..v.v>>.>v>v.....v.v.vv>..>>..>>.v.v.v>..>>>.v>.v.',
'.>.v..v..>>.....v>..>.>>.vv..v>>..vv>..>v.vv>>>v.>.vv....v...v.>.vv...v>...>v>..vvvv>v...>>v>>>.>v>v..>vv....v.>>v.>>.>...>v>>>>v....>.>.v.',
'>...vv..v.>>.>.vv>...vv..>>vv..>..>>>.....vv>..v.>>.>..>.>....>v.>..>...vv....v.vvv.>.>vv..v....>v>>.v.v>..>>...>>....>..v.>..v>>>.vv>>..v>',  
  ];
console.log(countSteps(dayInput));
