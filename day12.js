/*
https://adventofcode.com/2021/day/12
--- Day 12: Passage Pathing ---
With your submarine's subterranean subsystems subsisting suboptimally, the only way you're getting out of this cave anytime soon is by finding a path yourself. Not just a path - the only way to know if you've found the best path is to find all of them.

Fortunately, the sensors are still mostly working, and so you build a rough map of the remaining caves (your puzzle input). For example:
*/
const tinyInput = [
'start-A',
'start-b',
'A-c',
'A-b',
'b-d',
'A-end',
'b-end',
  ];
/*
This is a list of how all of the caves are connected. You start in the cave named start, and your destination is the cave named end. An entry like b-d means that cave b is connected to cave d - that is, you can move between them.

So, the above cave system looks roughly like this:

    start
    /   \
c--A-----b--d
    \   /
     end
Your goal is to find the number of distinct paths that start at start, end at end, and don't visit small caves more than once. There are two types of caves: big caves (written in uppercase, like A) and small caves (written in lowercase, like b). It would be a waste of time to visit any small cave more than once, but big caves are large enough that it might be worth visiting them multiple times. So, all paths you find should visit small caves at most once, and can visit big caves any number of times.

Given these rules, there are 10 paths through this example cave system:

start,A,b,A,c,A,end
start,A,b,A,end
start,A,b,end
start,A,c,A,b,A,end
start,A,c,A,b,end
start,A,c,A,end
start,A,end
start,b,A,c,A,end
start,b,A,end
start,b,end
(Each line in the above list corresponds to a single path; the caves visited by that path are listed in the order they are visited and separated by commas.)

Note that in this cave system, cave d is never visited by any path: to do so, cave b would need to be visited twice (once on the way to cave d and a second time when returning from cave d), and since cave b is small, this is not allowed.
*/
// @return string representing connection from source to destination
// @see splitConnection for the inverse operation
function getConnection(source, destination) {
  return [source, destination].join('-');
}
console.assert(getConnection('A', 'b') === 'A-b', 'getConnection failed');

// @return [source, destination]
// @see getConnection for the inverse operation
function splitConnection(connection) {
  return connection.split('-', 2);
}
console.assert(splitConnection('b-d').join() === ['b','d'].join(), 'splitConnection failed');

/* @return Map<cave, Set<connected caves>> */
function parseCaves(lines) {
  const caveMap = new Map();
  function connect(source, destination) {
    // skip connections departing from 'end' or arriving at 'start'
    if (source === 'end' || destination === 'start') { return; }
    let destinationSet;
    if (caveMap.has(source)) {
      destinationSet = caveMap.get(source); 
    } else {
      destinationSet = new Set();
      caveMap.set(source, destinationSet);
    }
    destinationSet.add(destination);
  }
  for (const line of lines) {
    let [cave1, cave2] = splitConnection(line);
    connect(cave1, cave2);
    connect(cave2, cave1);
  }
  return caveMap;
}
function printCaves(caves) {
  return Array.from(caves.entries())
    .map(([cave, connectedSet]) => 
      [cave, Array.from(connectedSet)].join('\t=>\t'))
    .join('\n');
}
console.assert(printCaves(parseCaves(['start-end', 'start-a', 'a-b', 'b-end'])) === 
               [ ['start',['end,a']], ['a',['b']], ['b',['a','end']] ].map(([c, cs]) => [c, cs].join('\t=>\t')).join('\n'));

function isSmallCave(cave) {
  return cave !== 'start' && cave === cave.toLowerCase();
}
console.assert(!isSmallCave('start'), 'start should not be a small cave');
console.assert(!isSmallCave('A'), 'big A should not be a small cave');
console.assert(isSmallCave('dc'), 'dc should be a small cave');

/**
 * context is { 
 *   current: current cave,
 *   path: [visited caves in order, current cave is last],
 *   brokenConnections: Set<connections that cannot be visited in the future> 
 * }
 */
function getNextContext(context = { path: [], brokenConnections: new Set() }, 
                         nextCave = 'start', 
                         ...nextBrokenConnections) {
  let brokenConnections = new Set(context.brokenConnections);
  nextBrokenConnections.forEach(nbc => brokenConnections.add(nbc));
  return { 
    current: nextCave, 
    path: context.path.concat([nextCave]), 
    brokenConnections,
    filterNextCaves: function(nextCaves) {
      return Array.from(nextCaves).filter(
        c => !this.brokenConnections.has(getConnection(this.current, c)));                                          
    }
  };
}
function getNextBrokenConnections(cave, nextCave, connectedCaves) {
  let directConnection = [getConnection(cave, nextCave)];
  return isSmallCave(cave) 
    ? directConnection.concat(Array.from(connectedCaves)
                              .filter(cc => cc !== 'end')
                              .map(cc => getConnection(cc, cave)))
    : directConnection;
}
console.assert(getNextBrokenConnections('BC', 'end', new Set()).join() === ['BC-end'].join(), 'nbc failed big cave end');
console.assert(getNextBrokenConnections('c', 'NC', new Set(['p','end','NC'])).join() === ['c-NC', 'p-c', 'NC-c'].join(), 'nbc failed small cave');

function countPaths(lines) {
  let count = 0;
  let caveMap = parseCaves(lines);
  let contextStack = [getNextContext()];
  let context;
  while (context = contextStack.pop()) {
    let connectedCaves = caveMap.get(context.current);
    context.filterNextCaves(connectedCaves).forEach(
      nc => {
        if (nc === 'end') { count++; return; }
        contextStack.push(getNextContext(context, nc, ...getNextBrokenConnections(context.current, nc, connectedCaves)));
      });
  }
  return count;    
}
console.assert(countPaths(tinyInput) === 10, 'failed tinyInput. Expected: 10, actual: ', countPaths(tinyInput));

/*
Here is a slightly larger example:
*/
const mediumInput = [
'dc-end',
'HN-start',
'start-kj',
'dc-start',
'dc-HN',
'LN-dc',
'HN-end',
'kj-sa',
'kj-HN',
'kj-dc',
  ];
/*
The 19 paths through it are as follows:

start,HN,dc,HN,end
start,HN,dc,HN,kj,HN,end
start,HN,dc,end
start,HN,dc,kj,HN,end
start,HN,end
start,HN,kj,HN,dc,HN,end
start,HN,kj,HN,dc,end
start,HN,kj,HN,end
start,HN,kj,dc,HN,end
start,HN,kj,dc,end
start,dc,HN,end
start,dc,HN,kj,HN,end
start,dc,end
start,dc,kj,HN,end
start,kj,HN,dc,HN,end
start,kj,HN,dc,end
start,kj,HN,end
start,kj,dc,HN,end
start,kj,dc,end
*/
console.assert(countPaths(mediumInput) === 19, 'failed mediumInput. Expected: 19, actual: ', countPaths(mediumInput));
/*
Finally, this even larger example has 226 paths through it:
*/
const testInput = [
'fs-end',
'he-DX',
'fs-he',
'start-DX',
'pj-DX',
'end-zg',
'zg-sl',
'zg-pj',
'pj-he',
'RW-he',
'fs-DX',
'pj-RW',
'zg-RW',
'start-pj',
'he-WI',
'zg-he',
'pj-fs',
'start-RW',
  ];
console.assert(countPaths(testInput) === 226, 'failed testInput. Expected: 226, actual: ', countPaths(testInput));
/*
How many paths through this cave system are there that visit small caves at most once?
*/
const dayInput = [
'qi-UD',
'jt-br',
'wb-TF',
'VO-aa',
'UD-aa',
'br-end',
'end-HA',
'qi-br',
'br-HA',
'UD-start',
'TF-qi',
'br-hf',
'VO-hf',
'start-qi',
'end-aa',
'hf-HA',
'hf-UD',
'aa-hf',
'TF-hf',
'VO-start',
'wb-aa',
'UD-wb',
'KX-wb',
'qi-VO',
'br-TF',
];
console.log(countPaths(dayInput));
