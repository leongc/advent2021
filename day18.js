/*
https://adventofcode.com/2021/day/18
--- Day 18: Snailfish ---
You descend into the ocean trench and encounter some snailfish. They say they saw the sleigh keys! They'll even tell you which direction the keys went if you help one of the smaller snailfish with his math homework.

Snailfish numbers aren't like regular numbers. Instead, every snailfish number is a pair - an ordered list of two elements. Each element of the pair can be either a regular number or another pair.

Pairs are written as [x,y], where x and y are the elements within the pair. Here are some example snailfish numbers, one snailfish number per line:

[1,2]
[[1,2],3]
[9,[8,7]]
[[1,9],[8,5]]
[[[[1,2],[3,4]],[[5,6],[7,8]]],9]
[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]
[[[[1,3],[5,3]],[[1,3],[8,7]]],[[[4,9],[6,9]],[[8,2],[7,3]]]]
This snailfish homework is about addition. To add two snailfish numbers, form a pair from the left and right parameters of the addition operator. For example, [1,2] + [[3,4],5] becomes [[1,2],[[3,4],5]].
*/

// encode snailfish numbers as objects with properties of:
// numbers - array of regular numbers within the pair, each regular number has: value, depth, isRight, pair, parent properties
// pair - a two-element array with each element being either a regular number or a pair
// parent - the parent of this pair, or undefined if this pair is the root
function parseNumber(rawArray, depth = 0, parent = undefined) {
  let numbers = [];
  let pair = new Array(2);
  let result = { numbers, pair, parent };
  for (let i = 0; i < 2; i++) {
    if (typeof rawArray[i] === 'number') {
      let regularNumber = { value: rawArray[i], depth, isRight: i === 1, pair, parent };
      numbers.push( regularNumber );
      pair[i] = regularNumber;
    } else {
      let child = parseNumber(rawArray[i], depth+1, pair);
      numbers.push( ...child.numbers );
      pair[i] = child;
    }
  }
  return result;
}
console.assert(parseNumber([1,2]).pair[0].value === 1, 'failed parseNumber left value');
console.assert(parseNumber([1,2]).pair[1].value === 2, 'failed parseNumber right value');
console.assert(parseNumber([1,2]).numbers.map(rn => [rn.value, rn.depth, rn.isRight].join()).join(';') === '1,0,false;2,0,true', 'failed parseNumber.numbers');
function add(left, right) {
  if (left === undefined) {
    return right;
  }
  let pair = [left, right];
  left.parent = pair;
  right.parent = pair;

  let numbers = left.numbers.concat(right.numbers);
  numbers.forEach(rn => {
    rn.parent ||= pair;
    rn.depth++;
  });

  return reduce({ numbers, pair });
}
console.assert(add(parseNumber([1,2]), parseNumber([3,4])).numbers
               .map(rn => [rn.value, rn.depth, rn.isRight].join()).join(';') 
               === '1,1,false;2,1,true;3,1,false;4,1,true', 'failed add');
/*
There's only one problem: snailfish numbers must always be reduced, and the process of adding two snailfish numbers can result in snailfish numbers that need to be reduced.

To reduce a snailfish number, you must repeatedly do the first action in this list that applies to the snailfish number:

If any pair is nested inside four pairs, the leftmost such pair explodes.
If any regular number is 10 or greater, the leftmost such regular number splits.
Once no action in the above list applies, the snailfish number is reduced.

During reduction, at most one action applies, after which the process returns to the top of the list of actions. For example, if split produces a pair that meets the explode criteria, that pair explodes before other splits occur.

To explode a pair, the pair's left value is added to the first regular number to the left of the exploding pair (if any), and the pair's right value is added to the first regular number to the right of the exploding pair (if any). Exploding pairs will always consist of two regular numbers. Then, the entire exploding pair is replaced with the regular number 0.
*/
// mutates n with a single explode
function explode(n, deepLeftIndex) {
  let deepLeftNumber = n.numbers[deepLeftIndex];
  let deepRightNumber = n.numbers[deepLeftIndex+1];
  console.assert(deepRightNumber.depth === 4 && deepRightNumber.isRight && deepLeftNumber.pair === deepRightNumber.pair,
                 'unexpected non-deep-right value: ', deepRightNumber.value, ' at depth: ', deepRightNumber.depth, ' of pair: ', deepRightNumber.pair);
  if (deepLeftIndex > 0) {
    n.numbers[deepLeftIndex-1].value += deepLeftNumber.value;
  }
  if (deepLeftIndex < n.numbers.length-2) {
    n.numbers[deepLeftIndex+2].value += deepRightNumber.value;
  }
  let wasRight = deepLeftNumber.pair === deepLeftNumber.parent[1].pair;
  let zero = { value: 0, depth: 3, isRight: wasRight, pair: deepLeftNumber.parent, parent: deepLeftNumber.parent[0].parent };
  n.numbers.splice(deepLeftIndex, 2, zero);
  deepLeftNumber.parent[wasRight ? 1 : 0] = zero;
  return n;
}
function printNumber(n) {
  if (n.value !== undefined) {
    return n.value;
  }
  return '[' + n.pair.map(printNumber).join() + ']';
}
console.assert(printNumber(parseNumber([[[[[9,8],1],2],3],4])) === '[[[[[9,8],1],2],3],4]', 'print failed');
function printNumbers(n) {
  return n.numbers.map(rn => [rn.value, rn.depth, rn.isRight].join()).join(';');
}
/*
Here are some examples of a single explode action:

[[[[[9,8],1],2],3],4] becomes [[[[0,9],2],3],4] (the 9 has no regular number to its left, so it is not added to any regular number).
[7,[6,[5,[4,[3,2]]]]] becomes [7,[6,[5,[7,0]]]] (the 2 has no regular number to its right, and so it is not added to any regular number).
[[6,[5,[4,[3,2]]]],1] becomes [[6,[5,[7,0]]],3].
[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]] becomes [[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]] (the pair [3,2] is unaffected because the pair [7,3] is further to the left; [3,2] would explode on the next action).
[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]] becomes [[3,[2,[8,0]]],[9,[5,[7,0]]]].
To split a regular number, replace it with a pair; the left element of the pair should be the regular number divided by two and rounded down, while the right element of the pair should be the regular number divided by two and rounded up. For example, 10 becomes [5,5], 11 becomes [5,6], 12 becomes [6,6], and so on.
*/
console.assert(printNumber(explode(parseNumber([[[[[9,8],1],2],3],4]), 0)) === '[[[[0,9],2],3],4]', 'explode [[[[[9,8],1],2],3],4] failed');
console.assert(printNumber(explode(parseNumber([7,[6,[5,[4,[3,2]]]]]), 4)) === '[7,[6,[5,[7,0]]]]', 'explode [7,[6,[5,[4,[3,2]]]]] failed');
console.assert(printNumber(explode(parseNumber([[6,[5,[4,[3,2]]]],1]), 3)) === '[[6,[5,[7,0]]],3]', 'explode [[6,[5,[4,[3,2]]]],1] failed');
console.assert(printNumber(explode(parseNumber([[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]), 3)) === '[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]', 'explode [[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]] failed');
console.assert(printNumber(explode(parseNumber([[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]), 7)) === '[[3,[2,[8,0]]],[9,[5,[7,0]]]]', 'explode [[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]] failed');

// mutates n with a single split
function split(n, overSizedIndex) {
  let overSizedNumber = n.numbers[overSizedIndex];
  let rawArray = [Math.floor(overSizedNumber.value / 2), Math.ceil(overSizedNumber.value / 2)];
  let splitNumber = parseNumber(rawArray, overSizedNumber.depth+1, overSizedNumber.pair);
  overSizedNumber.pair[overSizedNumber.isRight ? 1 : 0] = splitNumber;
  n.numbers.splice(overSizedIndex, 1, ...splitNumber.numbers);
  return n;
}
console.assert(printNumber(split(parseNumber([2,[11,3]), 1)) === '[2,[[5,6],3]]', 'split failed');

function reduce(n) {
  let deepLeftIndex = n.numbers.findIndex((e) => e.depth === 4);
  if (deepLeftIndex > -1) {
    return reduce(explode(n, deepLeftIndex));
  }
  let overSizedIndex = n.numbers.findIndex((e) => e.value >= 10);
  if (overSizedIndex > -1) {
    return reduce(split(n, overSizedIndex));
  }
  return n;  
}

/*
Here is the process of finding the reduced result of [[[[4,3],4],4],[7,[[8,4],9]]] + [1,1]:

after addition: [[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]
after explode:  [[[[0,7],4],[7,[[8,4],9]]],[1,1]]
after explode:  [[[[0,7],4],[15,[0,13]]],[1,1]]
after split:    [[[[0,7],4],[[7,8],[0,13]]],[1,1]]
after split:    [[[[0,7],4],[[7,8],[0,[6,7]]]],[1,1]]
after explode:  [[[[0,7],4],[[7,8],[6,0]]],[8,1]]
Once no reduce actions apply, the snailfish number that remains is the actual result of the addition operation: [[[[0,7],4],[[7,8],[6,0]]],[8,1]].
*/
console.assert(printNumber(reduce(parseNumber([[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]))) === '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]', 'reduce failed');
console.assert(printNumber(reduce(add(parseNumber([[[[4,3],4],4],[7,[[8,4],9]]]), parseNumber([1,1])))) === '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]', 'add reduce failed');
/*
The homework assignment involves adding up a list of snailfish numbers (your puzzle input). The snailfish numbers are each listed on a separate line. Add the first snailfish number and the second, then add that result and the third, then add that result and the fourth, and so on until all numbers in the list have been used once.

For example, the final sum of this list is [[[[1,1],[2,2]],[3,3]],[4,4]]:
*/
function sumLines(lines) {
  let n = reduce(parseNumber(lines[0]));
  for (let i = 1; i < lines.length; i++) {
    // hack, there's a bug in explode not setting parent pairs, so print and parse the number to rebuild 
    n = reduce(parseNumber([JSON.parse(printNumber(n)), lines[i]]));
  }
  return n;
}
console.assert(printNumber(sumLines([
[1,1],
[2,2],
[3,3],
[4,4],
  ])) === printNumber(parseNumber([[[[1,1],[2,2]],[3,3]],[4,4]])), 'failed sum 1,2,3,4');
/*
The final sum of this list is [[[[3,0],[5,3]],[4,4]],[5,5]]:
*/
console.assert(printNumber(sumLines([
[1,1],
[2,2],
[3,3],
[4,4],
[5,5],
  ])) === printNumber(parseNumber([[[[3,0],[5,3]],[4,4]],[5,5]])), 'failed sum 1,2,3,4,5');
/*
The final sum of this list is [[[[5,0],[7,4]],[5,5]],[6,6]]:
*/
console.assert(printNumber(sumLines([
[1,1],
[2,2],
[3,3],
[4,4],
[5,5],
[6,6],
  ])) === printNumber(parseNumber([[[[5,0],[7,4]],[5,5]],[6,6]])), 'failed sum 1,2,3,4,5,6');
/*
Here's a slightly larger example:
*/
console.assert(printNumber(sumLines([
[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]],
[7,[[[3,7],[4,3]],[[6,3],[8,8]]]],
[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]],
[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]],
[7,[5,[[3,8],[1,4]]]],
[[2,[2,2]],[8,[8,1]]],
[2,9],
[1,[[[9,3],9],[[9,0],[0,7]]]],
[[[5,[7,4]],7],1],
[[[[4,2],2],6],[8,7]],
  ])) === printNumber(parseNumber([[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]])), 'failed larger example');
/*
The final sum [[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]] is found after adding up the above snailfish numbers:

  [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
+ [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
= [[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]

  [[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]
+ [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
= [[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]

  [[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]
+ [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
= [[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]

  [[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]
+ [7,[5,[[3,8],[1,4]]]]
= [[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]

  [[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]
+ [[2,[2,2]],[8,[8,1]]]
= [[[[6,6],[6,6]],[[6,0],[6,7]]],[[[7,7],[8,9]],[8,[8,1]]]]

  [[[[6,6],[6,6]],[[6,0],[6,7]]],[[[7,7],[8,9]],[8,[8,1]]]]
+ [2,9]
= [[[[6,6],[7,7]],[[0,7],[7,7]]],[[[5,5],[5,6]],9]]

  [[[[6,6],[7,7]],[[0,7],[7,7]]],[[[5,5],[5,6]],9]]
+ [1,[[[9,3],9],[[9,0],[0,7]]]]
= [[[[7,8],[6,7]],[[6,8],[0,8]]],[[[7,7],[5,0]],[[5,5],[5,6]]]]

  [[[[7,8],[6,7]],[[6,8],[0,8]]],[[[7,7],[5,0]],[[5,5],[5,6]]]]
+ [[[5,[7,4]],7],1]
= [[[[7,7],[7,7]],[[8,7],[8,7]]],[[[7,0],[7,7]],9]]

  [[[[7,7],[7,7]],[[8,7],[8,7]]],[[[7,0],[7,7]],9]]
+ [[[[4,2],2],6],[8,7]]
= [[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]
To check whether it's the right answer, the snailfish teacher only checks the magnitude of the final sum. The magnitude of a pair is 3 times the magnitude of its left element plus 2 times the magnitude of its right element. The magnitude of a regular number is just that number.

For example, the magnitude of [9,1] is 3*9 + 2*1 = 29; the magnitude of [1,9] is 3*1 + 2*9 = 21. Magnitude calculations are recursive: the magnitude of [[9,1],[1,9]] is 3*29 + 2*21 = 129.
*/
function magnitude(n) {
  if (n.value !== undefined) {
    return n.value;
  }
  return (3*magnitude(n.pair[0])) + (2*magnitude(n.pair[1]));
}
console.assert(magnitude(parseNumber([9,1])) === 29, 'failed magnitude 9,1');
console.assert(magnitude(parseNumber([1,9])) === 21, 'failed magnitude 1,9');
console.assert(magnitude(parseNumber([[9,1],[1,9]])) === 129, 'failed magnitude [[9,1],[1,9]]');

/*
Here are a few more magnitude examples:

[[1,2],[[3,4],5]] becomes 143.
[[[[0,7],4],[[7,8],[6,0]]],[8,1]] becomes 1384.
[[[[1,1],[2,2]],[3,3]],[4,4]] becomes 445.
[[[[3,0],[5,3]],[4,4]],[5,5]] becomes 791.
[[[[5,0],[7,4]],[5,5]],[6,6]] becomes 1137.
[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]] becomes 3488.
So, given this example homework assignment:
*/
console.assert(printNumber(sumLines([
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]],
[[[5,[2,8]],4],[5,[[9,9],0]]],
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]],
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]],
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]],
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]],
[[[[5,4],[7,7]],8],[[8,3],8]],
[[9,3],[[9,9],[6,[4,9]]]],
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]],
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]],
  ])) === /*
The final sum is:
*/
'[[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]', 'failed test sum');
/*
The magnitude of this final sum is 4140.

Add up all of the snailfish numbers from the homework assignment in the order they appear. What is the magnitude of the final sum?
*/
console.assert(magnitude(parseNumber([[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]])) === 4140, 'failed magnitude test');

const dayInput = [
[[[[2,5],4],[[1,0],[8,3]]],[[2,[2,4]],[1,[3,3]]]],
[[[2,2],[[4,3],3]],[[[8,6],3],[3,7]]],
[[[9,[4,1]],[9,0]],[6,[6,0]]],
[[[3,9],[[4,4],[2,5]]],[[9,[8,4]],8]],
[[[[0,0],9],[[9,3],[8,2]]],[2,[1,3]]],
[[[8,4],6],[[5,1],[3,6]]],
[[[6,[7,6]],[[2,6],5]],[[6,4],2]],
[[1,[9,7]],[[[5,9],[9,5]],[[7,0],1]]],
[[[[5,8],[9,4]],[[9,3],[7,8]]],8],
[[[0,9],[[6,0],7]],[[[7,7],6],[[9,7],[0,4]]]],
[[[[4,3],[9,5]],[7,[7,3]]],[[[2,8],9],4]],
[[7,5],[8,1]],
[[4,6],[[[0,6],6],[7,4]]],
[[[1,8],[[1,4],[1,6]]],[3,4]],
[[[6,5],[4,[7,3]]],[[[0,1],[8,4]],[4,8]]],
[[5,1],[9,[9,[3,3]]]],
[[[[7,0],[2,5]],1],[9,[[2,7],[4,4]]]],
[[[[5,8],8],0],[8,[1,[2,5]]]],
[8,[[5,4],7]],
[[[9,8],[6,7]],[[2,[2,6]],[9,6]]],
[[[[2,3],7],6],[[8,6],3]],
[[[8,[7,2]],3],[[[3,9],4],[6,8]]],
[9,[[[6,7],[6,0]],[[3,9],8]]],
[[[7,7],[4,7]],[[[9,8],9],[9,[2,4]]]],
[[[[5,0],1],[4,[4,8]]],[9,[6,7]]],
[[[[9,2],5],[1,[5,8]]],[[9,[0,1]],[3,8]]],
[[[5,[2,5]],8],[2,[0,[9,3]]]],
[[7,[[8,4],[8,4]]],4],
[[[[3,3],4],[[0,0],[5,5]]],[4,5]],
[[[[9,3],[9,3]],2],[5,3]],
[[[9,5],[1,4]],[[7,1],[3,[6,5]]]],
[8,[[[1,1],[0,1]],[9,[3,6]]]],
[[[[4,4],7],[0,3]],[1,5]],
[[[3,[0,8]],8],[5,[7,5]]],
[[[[9,6],2],7],[[5,[3,7]],0]],
[4,9],
[[[5,[1,3]],[[9,5],6]],[[[7,9],5],3]],
[[[[3,9],[7,2]],[5,[8,8]]],[1,9]],
[[[[7,8],8],[[9,0],[5,1]]],[6,[[1,0],[3,3]]]],
[[[[5,8],1],[[8,6],[2,9]]],[[5,1],6]],
[[1,7],[[5,[3,2]],4]],
[[[[3,1],2],[0,8]],[3,[4,6]]],
[[9,6],[0,[[5,2],[1,1]]]],
[[[[1,8],8],[[9,0],3]],[[6,[2,8]],[[6,4],[6,0]]]],
[[7,[[3,2],[9,0]]],[[[3,2],[2,8]],[[5,5],[9,2]]]],
[[[[2,5],[3,1]],[7,[9,6]]],[[[7,0],7],[2,[9,1]]]],
[[[[1,6],9],[1,[6,5]]],[[8,[4,1]],6]],
[[[7,[4,6]],[[2,7],[6,6]]],[8,0]],
[[9,7],[[[0,7],5],[[1,4],[1,3]]]],
[[[1,[8,2]],[[0,6],[9,0]]],8],
[[[4,0],[7,[3,3]]],[9,6]],
[0,[[[6,9],7],[[0,6],1]]],
[5,[[4,3],[[8,3],[5,7]]]],
[[9,0],[0,[[7,8],[1,8]]]],
[[[[4,3],[5,6]],2],[[2,3],1]],
[4,[[9,9],[[1,8],[9,2]]]],
[[[[6,9],5],1],[[[7,4],[8,1]],3]],
[[8,[5,[2,6]]],[[[2,7],6],[6,0]]],
[[[[6,8],8],6],[[[5,7],2],[[6,5],[3,0]]]],
[[[1,[2,5]],3],[5,[4,[6,6]]]],
[[[[4,9],8],1],[9,0]],
[[1,[0,[5,7]]],[[1,[5,9]],[[3,2],[1,7]]]],
[[[[2,9],[2,7]],[[4,2],5]],[[[9,1],[7,2]],[2,[7,5]]]],
[[[[5,7],[8,9]],[5,[7,9]]],[[7,[6,6]],[7,[8,0]]]],
[[[[6,6],[4,6]],[4,[7,8]]],[1,[[5,5],[1,9]]]],
[[[[4,3],8],2],[[9,[4,0]],[8,[7,0]]]],
[[2,[7,5]],[[[0,1],1],[8,[3,5]]]],
[[[4,[4,2]],[[0,4],9]],[1,4]],
[[[5,5],[5,6]],[[0,[4,2]],[[7,8],[5,6]]]],
[2,[[0,[9,1]],[[1,7],[0,0]]]],
[[[5,[4,8]],1],9],
[8,[[2,1],[3,0]]],
[[[[6,5],[1,1]],7],[[[7,5],3],[0,1]]],
[[[[0,3],7],7],[[[4,8],[6,1]],[[6,1],9]]],
[[[[4,8],9],[1,0]],[6,[4,[4,8]]]],
[[[[8,0],[5,1]],6],1],
[[[[6,6],[7,7]],[[4,3],[2,6]]],[[3,5],[[7,0],[7,3]]]],
[[1,[5,8]],[[[3,7],[9,6]],[[4,8],[3,4]]]],
[[[1,5],[8,2]],[[[3,1],5],[4,1]]],
[[[[6,3],5],8],[[9,[3,6]],[[3,5],[6,9]]]],
[[[7,[5,4]],[0,[6,0]]],[[[7,7],[1,1]],[[5,1],7]]],
[[[1,5],[[8,6],0]],5],
[[[[0,8],[6,0]],[[3,0],9]],[[[7,1],2],[4,2]]],
[[[6,[8,7]],[2,[2,0]]],[9,[7,[6,6]]]],
[3,[[7,[4,5]],[[8,5],4]]],
[[[[8,0],[8,3]],[[5,4],[1,6]]],[[0,[8,5]],3]],
[[[7,2],1],[9,[[3,8],4]]],
[[4,[7,[9,9]]],[3,8]],
[[[[7,1],9],[[6,9],[9,6]]],[2,0]],
[[[[6,2],9],[3,[3,9]]],[[8,[3,4]],[3,7]]],
[[4,9],[8,[5,[9,8]]]],
[3,[[9,[9,7]],4]],
[[[[5,9],6],[1,[3,1]]],[4,[1,[3,8]]]],
[[[[7,6],2],3],[[0,[1,8]],[[4,9],[4,3]]]],
[[3,[[8,1],[3,8]]],[[[2,0],[0,8]],[[7,0],9]]],
[[[[9,7],[9,3]],[[5,8],6]],[[[6,2],0],[2,4]]],
[[[8,[9,7]],[[5,1],[1,4]]],3],
[[7,[[5,6],[2,7]]],[[[7,3],0],[1,[0,6]]]],
[[2,[[5,5],2]],[[3,[7,2]],[[7,1],8]]],
[[[[2,4],[6,8]],[0,[7,5]]],[[3,[2,5]],[7,7]]],  
  ];
console.log(magnitude(sumLines(dayInput)));

/*
--- Part Two ---
You notice a second question on the back of the homework assignment:

What is the largest magnitude you can get from adding only two of the snailfish numbers?

Note that snailfish addition is not commutative - that is, x + y and y + x can produce different results.

Again considering the last example homework assignment above:

[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
The largest magnitude of the sum of any two snailfish numbers in this list is 3993. This is the magnitude of [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]] + [[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]], which reduces to [[[[7,8],[6,6]],[[6,0],[7,7]]],[[[7,8],[8,8]],[[7,9],[0,6]]]].

What is the largest magnitude of any sum of two different snailfish numbers from the homework assignment?
*/
function maxPair(numbers) {
  let max = -Infinity;
  for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      if (i === j) { continue; }
      let mag = magnitude(add(parseNumber(numbers[i]), parseNumber(numbers[j])));
      if (mag > max) { 
        max = mag; 
      }
    } // j
  } // i
  return max;
}
console.log(maxPair(dayInput));
