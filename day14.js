/*
https://adventofcode.com/2021/day/14
--- Day 14: Extended Polymerization ---
The incredible pressures at this depth are starting to put a strain on your submarine. The submarine has polymerization equipment that would produce suitable materials to reinforce the submarine, and the nearby volcanically-active caves should even have the necessary input elements in sufficient quantities.

The submarine manual contains instructions for finding the optimal polymer formula; specifically, it offers a polymer template and a list of pair insertion rules (your puzzle input). You just need to work out what polymer would result after repeating the pair insertion process a few times.

For example:
*/
const testInput = [
'NNCB',
'',
'CH -> B',
'HH -> N',
'CB -> H',
'NH -> C',
'HB -> C',
'HC -> B',
'HN -> C',
'NN -> C',
'BH -> H',
'NC -> B',
'NB -> B',
'BN -> B',
'BB -> N',
'BC -> B',
'CC -> N',
'CN -> C',
  ];
/*
The first line is the polymer template - this is the starting point of the process.

The following section defines the pair insertion rules. A rule like AB -> C means that when elements A and B are immediately adjacent, element C should be inserted between them. These insertions all happen simultaneously.

So, starting with the polymer template NNCB, the first step simultaneously considers all three pairs:

The first pair (NN) matches the rule NN -> C, so element C is inserted between the first N and the second N.
The second pair (NC) matches the rule NC -> B, so element B is inserted between the N and the C.
The third pair (CB) matches the rule CB -> H, so element H is inserted between the C and the B.
Note that these pairs overlap: the second element of one pair is the first element of the next pair. Also, because all pairs are considered simultaneously, inserted elements are not considered to be part of a pair until the next step.

After the first step of this process, the polymer becomes NCNBCHB.
*/
// @return map from first_element => (map of second_element => inserted_element)
function makeAutomata(pairInsertionRules) {
  let automata = new Map();
  for (const rule of pairInsertionRules) {
    let [elementPair, insertedElement] = rule.split(' -> ', 2);
    let [firstElement, secondElement] = elementPair.split('');
    let secondMap;
    if (automata.has(firstElement)) {
      secondMap = automata.get(firstElement);
    } else {
      secondMap = new Map();
      automata.set(firstElement, secondMap);
    }
    secondMap.set(secondElement, insertedElement);
  }
  return automata;
}
function stringifyAutomata(automata) {
  return Array.from(automata.entries())
    .map(([k,v]) => Array.from(v.entries())
         .map(([k2,v2]) => [k, k2, ' -> ', v2].join('')))
    .join('|');
} 
console.assert(stringifyAutomata(makeAutomata(['AB -> C', 'AX -> Y', 'BD -> E'])) === 'AB -> C,AX -> Y|BD -> E');
  
// expand template once using rules
function expand(template, automata) {
  // special case of fewer than two element template cannot be expanded by pairs
  if (template.length < 2) { return template; }

  // initialize result with first element of template
  let result = [];
  let secondElement;
  for (const nextElement of template) {
    let firstElement = secondElement;
    secondElement = nextElement;
    // conditionally append inserted element
    if (automata.has(firstElement) && automata.get(firstElement).has(secondElement)) {
      result.push(automata.get(firstElement).get(secondElement));
    }
    // always append second element
    result.push(secondElement);
  }
  return result.join('');
}
function run(template, automata, steps = 1) {
  let output = template;
  for (let i = 0; i < steps; i++) {
    output = expand(output, automata);
  }
  return output;
}
/*
Here are the results of a few steps using the above rules:

Template:     NNCB
After step 1: NCNBCHB
After step 2: NBCCNBBBCBHCB
After step 3: NBBBCNCCNBBNBNBBCHBHHBCHB
After step 4: NBBNBNBBCCNBCNCCNBBNBBNBBBNBBNBBCBHCBHHNHCBBCBHCB
*/
const testAutomata = makeAutomata(testInput.slice(2));
const testStep1 = expand(testInput[0], testAutomata);
console.assert(testStep1 === 'NCNBCHB', 'failed test expand step 1. Expected: NCNBCHB, Actual: ', testStep1);
const testStep2 = run(testInput[0], testAutomata, 2);
console.assert(testStep2 === 'NBCCNBBBCBHCB', 'failed test expand step 2. Expected: NBCCNBBBCBHCB, Actual: ', testStep2);
const testStep3 = run(testInput[0], testAutomata, 3);
console.assert(testStep3 === 'NBBBCNCCNBBNBNBBCHBHHBCHB', 'failed test expand step 3. Expected: NBCCNBBBCBHCB, Actual: ', testStep3);
const testStep4 = run(testInput[0], testAutomata, 4);
console.assert(testStep4 === 'NBBNBNBBCCNBCNCCNBBNBBNBBBNBBNBBCBHCBHHNHCBBCBHCB', 'failed test expand step 4. Expected: NBCCNBBBCBHCB, Actual: ', testStep4);

/*
This polymer grows quickly. After step 5, it has length 97; After step 10, it has length 3073. After step 10, B occurs 1749 times, C occurs 298 times, H occurs 161 times, and N occurs 865 times; taking the quantity of the most common element (B, 1749) and subtracting the quantity of the least common element (H, 161) produces 1749 - 161 = 1588.
*/
const testStep5 = run(testInput[0], testAutomata, 5);
console.assert(testStep5.length === 97, 'failed test expand step 5 length. Expected: 97, Actual: ', testStep5.length);
const testStep10 = run(testInput[0], testAutomata, 10);
console.assert(testStep10.length === 3073, 'failed test expand step 10 length. Expected: 3073, Actual: ', testStep10.length);

function getHistogram(polymer) {
  let result = new Map();
  for (const c of polymer) {
    result.set(c, result.has(c) ? result.get(c)+1 : 1);
  }
  return result;
}
console.assert(Array.from(getHistogram('aba').entries()).map(([k, v]) => [k, v].join('=>')).join() === ['a=>2','b=>1'].join(), 'getHistogram failed');
function getMinMaxDifference(histogram) {
  return Math.max(...histogram.values()) - Math.min(...histogram.values());
}
console.assert(getMinMaxDifference(getHistogram('aabaa')) === 3, 'getMinMaxDifference failed');
console.assert(getMinMaxDifference(getHistogram(testStep10)) === 1588, 'getMinMaxDifference of testStep10 failed');
/*
Apply 10 steps of pair insertion to the polymer template and find the most and least common elements in the result. What do you get if you take the quantity of the most common element and subtract the quantity of the least common element?
*/
const dayInput = [
  'VFHKKOKKCPBONFHNPHPN',
'',
'VS -> B',
'HK -> B',
'FO -> P',
'NC -> F',
'VN -> C',
'BS -> O',
'HS -> K',
'NS -> C',
'CV -> P',
'NV -> C',
'PH -> H',
'PB -> B',
'PK -> K',
'HF -> P',
'FV -> C',
'NN -> H',
'VO -> K',
'VP -> P',
'BC -> B',
'KK -> S',
'OK -> C',
'PN -> H',
'SB -> V',
'KO -> P',
'KH -> C',
'KS -> S',
'FP -> B',
'PV -> B',
'BO -> C',
'OS -> H',
'NB -> S',
'SP -> C',
'HN -> N',
'FN -> B',
'PO -> O',
'FS -> O',
'NH -> B',
'SO -> P',
'OB -> S',
'KC -> C',
'OO -> H',
'BB -> V',
'SC -> F',
'NP -> P',
'SH -> C',
'BH -> O',
'BP -> F',
'CC -> S',
'BN -> H',
'SS -> P',
'BF -> B',
'VK -> P',
'OV -> H',
'FC -> S',
'VB -> S',
'PF -> N',
'HH -> O',
'HC -> V',
'CH -> B',
'HP -> H',
'FF -> H',
'VF -> V',
'CS -> F',
'KP -> F',
'OP -> H',
'KF -> F',
'PP -> V',
'OC -> C',
'PS -> F',
'ON -> H',
'BK -> B',
'HV -> S',
'CO -> K',
'FH -> C',
'FB -> F',
'OF -> V',
'SN -> S',
'PC -> K',
'NF -> F',
'NK -> P',
'NO -> P',
'CP -> P',
'CK -> S',
'HB -> H',
'BV -> C',
'SF -> K',
'HO -> H',
'OH -> B',
'KV -> S',
'KN -> F',
'SK -> K',
'VH -> S',
'CN -> S',
'VC -> P',
'CB -> H',
'SV -> S',
'VV -> P',
'CF -> F',
'FK -> F',
'KB -> V',
  ];
console.log(getMinMaxDifference(getHistogram(run(dayInput[0], makeAutomata(dayInput.slice(2)), 10))));

/*
The resulting polymer isn't nearly strong enough to reinforce the submarine. You'll need to run more steps of the pair insertion process; a total of 40 steps should do it.

In the above example, the most common element is B (occurring 2192039569602 times) and the least common element is H (occurring 3849876073 times); subtracting these produces 2188189693529.

Apply 40 steps of pair insertion to the polymer template and find the most and least common elements in the result. What do you get if you take the quantity of the most common element and subtract the quantity of the least common element?
*/
function parseExpansionMap(pairInsertionRules) {
  let result = new Map();
  for (const rule of pairInsertionRules) {
    let [elementPair, insertedElement] = rule.split(' -> ', 2);
    result.set(elementPair, insertedElement);
  }
  return result;
}

function expandHistogram(template, expansionMap, maxSteps = 10) {
  let result = new Map();
  function increment(c) {
    result.set(c, result.has(c) ? result.get(c)+1 : 1);
  }
  
  let rightStack = []; // array of [char, step]
  function push(expansion, step) {
    increment(expansion);
    rightStack.push([expansion, step]);    
  }  
  // initialize stack with template in reverse order
  template.split('').reverse().forEach(c => push(c, 0));
  
  let left, step;
  // pop right stack and use the values to reset left and step
  // @return false when rightStack is empty, otherwise true
  function pop() {
    if (rightStack.length < 1) {
      return false;
    }
    [left, step] = rightStack.pop();
    return true;
  }
  // initialize
  pop();
  
  // @return topmost char from rightStack, or undefined when rightStack is empty
  function peekRight() {
    return rightStack.length > 0 ? rightStack[rightStack.length-1][0] : undefined;
  }
  
  // @return true iff expansion reached maxSteps, otherwise false
  function expandHeadMax() {
    let right = peekRight();
    while (step < maxSteps) {
      let pair = left + right;
      if (!expansionMap.has(pair)) {
        return false;
      }
      right = expansionMap.get(pair);
      push(right, ++step);
    }
    return step === maxSteps;
  }
  
  while (rightStack.length > 0) {
    // pop twice when max reached, otherwise pop once
    if (expandHeadMax()) {
      pop();
    }
    pop();
  }
  
  return result;
}

function printHistogram(h) {
  return Array.from(h.keys()).sort().map(k=>[k,h.get(k)].join('=>')).join('\n');
}
const testTemplate = testInput[0];
const testExpansionMap = parseExpansionMap(testInput.slice(2));
console.assert(printHistogram(expandHistogram(testTemplate, testExpansionMap, 1)) === printHistogram(getHistogram(testStep1)), 'failed step 1');
console.assert(printHistogram(expandHistogram(testTemplate, testExpansionMap, 2)) === printHistogram(getHistogram(testStep2)), 'failed step 2');
console.assert(printHistogram(expandHistogram(testTemplate, testExpansionMap, 3)) === printHistogram(getHistogram(testStep3)), 'failed step 3');
console.assert(printHistogram(expandHistogram(testTemplate, testExpansionMap, 4)) === printHistogram(getHistogram(testStep4)), 'failed step 4');

const testStep10Histogram = new Map();
[['B',1749], ['C',298], ['H',161], ['N',865]].forEach(([k,v]) => testStep10Histogram.set(k,v));
console.assert(printHistogram(expandHistogram(testTemplate, testExpansionMap, 10)) === printHistogram(testStep10Histogram), 'failed step 10');
console.assert(getMinMaxDifference(expandHistogram(dayInput[0], parseExpansionMap(dayInput.slice(2)), 10)) === 2988, 'failed min/max for dayInput'); 

// still too slow; let's try memoization
function merge(leftHistogram, rightHistogram) {
  if (leftHistogram.size === 0) {
    return rightHistogram;
  }
  rightHistogram.forEach((v, k) => {
      leftHistogram.set(k, leftHistogram.has(k) ? leftHistogram.get(k) + v : v);
  });
  return leftHistogram; 
}

// console.assert(getMinMaxDifference(expandHistogram(testTemplate, testExpansionMap, 40)) === 2188189693529, 'failed step 40');




// console.log(getMinMaxDifference(expandHistogram(dayInput[0], parseExpansionMap(dayInput.slice(2)), 40)));
