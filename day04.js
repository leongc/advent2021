/*
https://adventofcode.com/2021/day/4
--- Day 4: Giant Squid ---
You're already almost 1.5km (almost a mile) below the surface of the ocean, already so deep that you can't see any sunlight. What you can see, however, is a giant squid that has attached itself to the outside of your submarine.

Maybe it wants to play bingo?

Bingo is played on a set of boards each consisting of a 5x5 grid of numbers. Numbers are chosen at random, and the chosen number is marked on all boards on which it appears. (Numbers may not appear on all boards.) If all numbers in any row or any column of a board are marked, that board wins. (Diagonals don't count.)

The submarine has a bingo subsystem to help passengers (currently, you and the giant squid) pass the time. It automatically generates a random order in which to draw numbers and a random set of boards (your puzzle input). For example:
*/
const testInput = [
"7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1",
"",
"22 13 17 11  0",
" 8  2 23  4 24",
"21  9 14 16  7",
" 6 10  3 18  5",
" 1 12 20 15 19",
"",
" 3 15  0  2 22",
" 9 18 13 17  5",
"19  8  7 25 23",
"20 11 10 24  4",
"14 21 16 12  6",
"",
"14 21 17 24  4",
"10 16 15  9 19",
"18  8 23 26 20",
"22 11 13  6  5",
" 2  0 12  3  7",
  ];
function generateBoard() {
  const rows = [];
  const cols = new Array(5);
  for (let i = 0; i < cols.length; i++) {
    cols[i] = new Set();
  }
  const numberMap = new Map();
  let score;
  return {
    addRow: function(line) {
      const rowArray = line.trim().split(/\s+/);
      const row = new Set(rowArray); 
      rows.push(row);
      for (let i = 0; i < rowArray.length; i++) {
        const number = rowArray[i];
        const col = cols[i];
        col.add(number);
        numberMap.set(number, { row, col });
      }
    },
    // return true iff bingo
    mark: function(number) {
      const numberLocation = numberMap.get(number);
      if (numberLocation === undefined) {
        return false;
      }
      numberMap.delete(number);
      const result = [numberLocation.row, numberLocation.col].some(
        s => s.delete(number) && s.size === 0);
      // conditionally compute winning score = winning number * sum(remaining numbers on board)
      if (result) {
        score = parseInt(number) * 
          Array.from(numberMap.keys()).map(s=>parseInt(s)).reduceRight((a,b)=>a+b);
      }
      return result;
    },
    getScore: function() { return score; }
    ,numberMap,rows,cols // for debugging
  };
}
let testBoard = generateBoard();
testBoard.addRow(" 1  2");
testBoard.addRow("21  3");
console.assert(!testBoard.mark("1"));
console.assert(!testBoard.mark("3"));
console.assert(testBoard.mark("2"));
console.assert(testBoard.getScore() === 42);
/*
After the first five numbers are drawn (7, 4, 9, 5, and 11), there are no winners, but the boards are marked as follows (shown here adjacent to each other to save space):
...
After the next six numbers are drawn (17, 23, 2, 0, 14, and 21), there are still no winners:
...
Finally, 24 is drawn:
...
At this point, the third board wins because it has at least one complete row or column of marked numbers (in this case, the entire top row is marked: 14 21 17 24 4).

The score of the winning board can now be calculated. Start by finding the sum of all unmarked numbers on that board; in this case, the sum is 188. Then, multiply that sum by the number that was just called when the board won, 24, to get the final score, 188 * 24 = 4512.
*/
function playBingo(lines) {
  var sequence, currentBoard;
  var boards = [];
  for (const line of lines) {
    if (sequence === undefined) {
      sequence = line.split(',');
      continue;
    }
    if (line.length === 0) {
      currentBoard = generateBoard();
      boards.push(currentBoard);
      continue;
    }
    currentBoard.addRow(line);
  }
  for (const number of sequence) {
    let winningBoard = boards.find(board => board.mark(number));
    if (winningBoard === undefined) {
      continue;
    }
    return winningBoard.getScore();
  }
}
console.assert(playBingo(testInput) === 4512);
/*
To guarantee victory against the giant squid, figure out which board will win first. What will your final score be if you choose that board?
*/
const dayInput = [
  "59,91,13,82,8,32,74,96,55,51,19,47,46,44,5,21,95,71,48,60,68,81,80,14,23,28,26,78,12,22,49,1,83,88,39,53,84,37,93,24,42,7,56,20,92,90,25,36,34,52,27,50,85,75,89,63,33,4,66,17,98,57,3,9,54,0,94,29,79,61,45,86,16,30,77,76,6,38,70,62,72,43,69,35,18,97,73,41,40,64,67,31,58,11,15,87,65,2,10,99",
"",
"42 47 77 49 67",
"64 82 32 94 78",
"96 62 45 11 43",
"55 92 81 66 88",
"12 95 19 24 71",
"",
"96 40 25 11 89",
"84 33 10 55 16",
"22 90 54 42 86",
"73 13 70 32 56",
"18 78 41 81 50",
"",
"58 48 24  3 40",
"38 61 95 39 36",
"45 21  2 90 57",
"42 41 22 83 67",
"73 77 59  0 85",
"",
" 2 11 17 28 22",
"93  1 27 85 13",
"37 72 54 94 86",
"25 40 57 60 71",
"38 46 83 30 92",
"",
"14 88 34 10 87",
"31 47 46 72 28",
"26  1 50 81 76",
"98  2 17 59 39",
"80 99 84 62 44",
"",
"22 80 28 31 27",
"21 92  5 64 65",
"73 85 35 66 76",
"11 29 75 81 37",
"90 69 53 97 67",
"",
"84 89 93  1 37",
"99 13 17 52 81",
"31  0 28 12 91",
"92 20 41 36 35",
"40 26 23 51 64",
"",
"72 50 20 87 82",
"28 88 15  9 24",
"47 54  3 84 76",
"14 34 33 65 78",
"53 60 23 21 77",
"",
"76 17  7 38 25",
"72 82 96 83  2",
"94 86 56 43 97",
"26 93 59 48 55",
" 3 85 29 19  4",
"",
"58 95 50 21 47",
"85 33 76 97 62",
"39 70 42 25 71",
"53 79 87 41 91",
"45 27  3 92 88",
"",
" 9 38 32 18 56",
"40  5 62 70 41",
" 1 30 39 90 79",
"69 84 74 59 35",
"65 54 21 27 73",
"",
"92 85 69  5 29",
"91 74  1 26 60",
"63 87 37 71 62",
"59 15 56 45 95",
"86 67 39 34 89",
"",
"89 30 39 15  3",
"71 37 38 56 77",
"67 13 41 85 36",
"32  7 12 97 87",
"50 42 21 33 23",
"",
"11 40 38 96  6",
"88 39 64 33 86",
"51 79 63 12  3",
"47  7 69 41 80",
"10 28 91 37 89",
"",
"90 14 52 49 93",
"62  2 35 46 42",
"87  3 85 29 68",
"15 96 72 10 59",
"50 80  5 20 44",
"",
"58 92 96 48 74",
" 2 17 54 93 32",
"39 46 76 91 10",
"26 21 52 11 65",
"23 36 78 77 43",
"",
"79  5 10 41 97",
"80 45 81 32 87",
"18 78 21 92 74",
"14 49 94 59 37",
" 6 62 76 57 35",
"",
"52 59  3 78 89",
" 6 49 90 54 15",
"82 30 64  7 85",
"51 50 73 71 60",
"17 26 18 98 94",
"",
"71 86  8  0 34",
"77 81 47 13 53",
"99 93 29 28 85",
"76 49 51  1  4",
"90 65 88 16 98",
"",
"89 32 50 77 71",
"35 34 66 60 27",
"52 24 57 42 37",
"31  1 70 13 62",
"33 91 61  7 30",
"",
"55 10 86 85 46",
" 2 96 68 40 24",
"44 49  6 13 99",
"93 36 31 52 67",
"84 81 48 14  1",
"",
"84 92 66 24 95",
"70 26 67 25 32",
"52 11 55 76 78",
"82 33 83 93 37",
"21 68 15 94 10",
"",
"95 45 58 25 27",
"15 93 10 76 86",
"59 90 87 99 72",
" 4 71 31  3 37",
"52 35 83 54 33",
"",
"73 39 32 89 84",
" 5 70 47 61 18",
"16 92 78 26  8",
"94 37 14 53 27",
"44 30 68 77 63",
"",
"94 24 54  1 49",
"27 90 84 79 69",
" 6 70 25 36 80",
"14 16 53 92 44",
"61 33 55 89 23",
"",
"85 92 37 64 59",
"70 67 55 60 27",
"69 62 45 48 57",
"30 75 99 18 43",
"82  7 10 19 38",
"",
"78 46 32 95 58",
"67 66 39 77 62",
"50 53 47 55 70",
"23 42 38 22 60",
"30 29 10 40 84",
"",
"27 89 46 75 73",
"84 48  7 12 82",
"34 15 81 98 65",
"24 83 87  4 86",
" 9 55 47  8 36",
"",
"30 70  5 21 82",
"95 11 49 37 48",
"68 74 41 63 85",
"93 35  7  8 80",
"45 31 53 55 26",
"",
"98 75 47  9 18",
"44 97 26 73 64",
"62 99 13 43  0",
"51 37 10 74 94",
"35 68 22 76 83",
"",
"35  9 82 95 40",
"30 10 99  7 47",
"12 77 54 25 34",
"73 97 38 11 17",
"70 41 87 29 57",
"",
"95 50 69 58 93",
"89 52 23 24  8",
"20 53 43 22 84",
"60  4 19 64  6",
"92 21 10 26 85",
"",
"37 48 98 80 77",
"15 76 12 75 52",
"94 41 40 69 63",
"92 28 74 14 17",
" 3 62 86 19 82",
"",
"40  1 33 53 64",
"60  9 76 50 44",
" 0 34 51 98 12",
" 6 84 72 86 15",
"18 80 13  5 23",
"",
"40 86 96 61 34",
"13  0 39 88 32",
"36 91 82 51 97",
"83 87 63 94 26",
"53 30 23 14 45",
"",
"93 20 29  9 66",
"25 72 10 54 30",
"31 51 41 15 47",
"71 61 96 55 81",
" 3 50 36 94 27",
"",
" 8 23 14 30 10",
"91 36 58 40 92",
"74 84 33 44 96",
"86 20 82 57  5",
"87 11 95 46 31",
"",
"95 51 73 41 10",
"31 15 70 56 39",
"83 11 37 38 42",
"13 58 53 77 14",
"79 71  5 29 93",
"",
"21 59 62 60 87",
"92 90 51 15 57",
"38 68 26 78 36",
"31 84 97 81 74",
"12 48 35 70 93",
"",
"13 52 95 80 87",
"71 77 74 35 61",
"37 41 14 73 46",
"62 90 54  0 88",
"67 20 56 22 85",
"",
"95 56 68 49 44",
"34 18 65 13 71",
"52 94 87 90 19",
"36 30 45  3 77",
"84 89 64 20 41",
"",
"17  6 13 27 64",
"14 34 60 32 40",
"51 97  8 57 88",
"44 79 82 31  2",
"15 99 59 62 50",
"",
"86 16 33 27 39",
" 3 34 42 15 48",
"84  2 85 31 87",
"97 41 49 13 23",
"51  6 71 82 10",
"",
"82 25 17 28 48",
"95  7 29 55 81",
"97  3 26 64 11",
"98 75 45 89 96",
"49 70 84 41 57",
"",
" 5 51 65 35 27",
"89 17 18 66 37",
"16 68 56 87 33",
"71 86 52 48 23",
"47 10 53  7 55",
"",
"76 88 50  5 83",
"23 63 13 26 41",
"84 60 36 80 68",
"37 79 47 74  1",
"59 55 58 99 65",
"",
"48 51 12 74  9",
"31 26 67 95 98",
"54 46 56  3 80",
"10 57 17 37 92",
"78 87 28 82 52",
"",
"49 85 57 58 30",
"77 76 92 97  3",
"69 66 14 25 83",
"63 98 47 37 78",
"22 96 89 91 95",
"",
" 5 24 38 66 88",
"32 18 82 26 23",
"41 36 14 91 21",
"56 51 99 83 58",
"28 27 78  3 43",
"",
"55 65 60 13 11",
"10 41  9 39 62",
"75 85 12 61 66",
"35 43 64 94 48",
"44 28  1 92  2",
"",
"19 81 21 33 15",
"48 55 91 95  7",
"34 90 64 50 97",
"23 43 60  3 26",
"16 22 67 58  9",
"",
"83 33 88 16 47",
"13 98 43 24 34",
"45  9 27  2 76",
" 4 57 80 77 87",
"61 11 66 81 50",
"",
"17 62 88 23  5",
"57 25 84 55 65",
"60 85 39 90 99",
"83 79 37 34 46",
"29 54 92 12 51",
"",
"28 59 78 96 55",
"12 77 46 81 23",
"60 54 17 16 45",
"42 89 62 63 47",
"26 98 31 85  7",
"",
"86 91  2 39  0",
"67 73 62 69 38",
" 6 94 25 66  7",
"26 41 81 59 79",
"71 44 33 46 10",
"",
"24 22 21 82 62",
"48 74 83 17 64",
"66 23  4 78 36",
"54 80 38 20 14",
"47 85 96 39 12",
"",
"72 56 75 34 59",
"20 22 90 87 97",
"24 95 61 91 74",
"51 38  7 18 21",
"73 57 89 80 92",
"",
"42 23 22  5 37",
"72 77 88 63  7",
"44 80 62 10 69",
"91  1 60 70 25",
"67 97 75 45 55",
"",
" 3 45 91  4 13",
"14  6 34 49 82",
"31 98 35 23 85",
"10 71 16 40 15",
"11 99  7 32 28",
"",
"42 44 52 27 25",
"31 28 11 86 81",
"35 80 20 65 24",
"17  8 93 49 58",
"16 92 78 63 61",
"",
"57 60 34 95 46",
"78 25 79 42 36",
"65 84 74 82 91",
"33 44  9 47 90",
"53 69 54  0 76",
"",
"67 29  7 82 73",
"87 49 44 10 14",
"40 98 89 41 12",
"58 20 27 13 53",
"51 78 96 59 80",
"",
"75  8 73 47  4",
"46 67 28 78  5",
"29 62 65 19 13",
"48 95 21 81 50",
"80 38 51 96 91",
"",
"45 41 80 64 32",
"14 93 40 76 70",
"15 77 49  0 98",
"19 68 16 18 92",
"81 83 47 36 44",
"",
"56  3 88 97 72",
"60 46 98 11 51",
"52  8 54 89  9",
"67 41 78 17 82",
"99  2  6  7 77",
"",
"66 20 48 64  9",
"19 52 74 56 59",
"42 81 29 93  6",
"72 75 83 15 76",
"99 23 14 44 50",
"",
"77 90 79 49  3",
"51 76  2 41 74",
"86 96 36 84 16",
"85  5 95 18 47",
"73 33 32 45 58",
"",
"82 72 86 18 84",
"59 60  6 22  7",
"31 19 90 47 58",
"65 71  4 67 92",
"17 95 44 35 26",
"",
"14 81 55 51 29",
"44 64 99 41 43",
"82 72 53 33 10",
"95 38 76 68 56",
"57 88 39  0  5",
"",
"15 47  2 78  9",
"13 36 41 29 97",
"86 18 57 69 49",
"79 37 91 88 59",
"21 23 87  1 30",
"",
"39 45 56  8 89",
" 2 42 66  3 70",
"75 80 17 64 97",
"32 35 60 23 88",
"18 51 99  7 38",
"",
"30 54 83 88 74",
"52 15 91 77 86",
" 2 79 12 16 50",
"40 14 97 63 35",
"33 71 25 21 94",
"",
"37 85 35 10 22",
"52 31 77 48 82",
"51  3 49 95 20",
"24 75  0 89 97",
"78 63 14 46 42",
"",
"91 26 28 38 31",
"55 32  0 95 10",
"68 25 45 57 56",
"36 14 69 30 15",
"81  3 37 13 40",
"",
"75 30  8 28 44",
"60 79 59 74  9",
"81 50 66 92 61",
"29  2 88 15 99",
"87 91 26  7 96",
"",
"74 75 81 72 89",
"44  8 94  3 97",
"93 46 37  0 56",
"63 21 29 91 55",
"41  4 31 49 33",
"",
"55  8 57 29 63",
"85 36 58 89 33",
"44 75 67 23 39",
"49 46 32 10 84",
"15  7 59 56 12",
"",
" 1 91 65 67  4",
"31  5 34 30 37",
"93 66 18 79 19",
"28  6  0 47 42",
"21 98 87 89 81",
"",
"79 30 10 21 69",
"56 19 27 90 72",
"77 57 93 92 97",
"15 45  4 18 68",
"59  2 29 26 83",
"",
"21 41 53 30 31",
"85 18 17 52 39",
"49 38  4 57 54",
"63 74 59 16  8",
"66 62 27 10 37",
"",
"28 94 59 97  5",
"91 17 72 84 80",
"21  6 60 77 98",
"50 70 44 85 95",
"92 61 43 16 93",
"",
"10 91 27 84 63",
"69 97  9 83 89",
" 6 47 42 87 77",
"20 94 34  4 64",
" 0 12 38 39 18",
"",
" 4 54 55 76 64",
"39 15 80 42  9",
"57 56 87 61 28",
"70 85 36 25 75",
"38 53 12 71 47",
"",
"83 97 32 29  0",
"60 30 31 92 61",
" 1 42 17 94 67",
"20 39 36 91 10",
"18 69 47 43 76",
"",
"63 74 68 71 92",
"85 94  8 41 35",
"39 32 62 67 87",
"70 95 40 84 51",
"52 30 53 22  1",
"",
"17 39 74 50 55",
"72  7 88  4 68",
"94 91 45 15 77",
"48 53 62 46 67",
"69 12 70 32 35",
"",
"56 89 96 51 14",
"23 77 62  4 22",
"88 87 27  5 94",
" 6 28 40 11 83",
"33 86 99 80 63",
"",
" 2 96 16 33 81",
"18  9 45 39 49",
" 3 21 59 27 58",
"48 31 28 42 77",
"37 83 61 25 71",
"",
"13  1  6 34 23",
"56 40 66 50 99",
"46 28 65 32 27",
"60 67 22 17  0",
"29 43 21  8 59",
"",
"90 86 69 22  5",
"72 96 29 62 59",
"40  1 54 87 55",
"41 78 28 43 33",
"77 49 82 13 61",
"",
"82  8 39 68 51",
"97 13 22  7 92",
"60 88 84 16 30",
"86 54 71 50 87",
"72 24 41 25 48",
"",
" 9 35 43 49 77",
"24 29  1 70 80",
"15  4 93 48  6",
"31 17  0 99 95",
"28 13 56 41 97",
"",
"24 75 16 59 98",
"86  5  7 93 10",
"42 71  6 91 21",
"43 69 78 94 33",
" 3 45 73 11 20",
"",
"19  3 17 58 89",
"11 54 53 34 14",
"66 82 44 46 41",
" 1 22 62 69 25",
"65 98 76 84 13",
"",
"37 93 47 15 20",
"43 46 82 53 75",
"18 90 25 69 92",
"54 42 83 41 17",
"44 14 22 70  4",
"",
"78 72 96 86 89",
"64 61 69 79 85",
"10 59 37 18 46",
" 5 22 31 81  7",
"40 57 53 66 32",
"",
" 8 77 33 81 90",
"27  2 94 24 59",
"79 28 30 97 60",
"32 18 10  1 38",
"58 12  5 87 17",
"",
"68 76  4 63 16",
"75 66 19 50 14",
"73 24 22  6 33",
"99 61 87  1 47",
"35 83 48 39 20",
"",
"42 39 28 87 37",
"89 12 75 82 84",
"17 74 49  3  5",
"56 76 66 92 85",
"27 18 86  8 58",
"",
"71 83 21 29 63",
"46 38 62  3 67",
"56 72 40 96 64",
"95 89 91  4 47",
" 7 92 80 69 61",
  ];
console.log(playBingo(dayInput));
