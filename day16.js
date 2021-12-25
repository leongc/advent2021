/*
https://adventofcode.com/2021/day/16
--- Day 16: Packet Decoder ---
As you leave the cave and reach open waters, you receive a transmission from the Elves back on the ship.

The transmission was sent using the Buoyancy Interchange Transmission System (BITS), a method of packing numeric expressions into a binary sequence. Your submarine's computer has saved the transmission in hexadecimal (your puzzle input).

The first step of decoding the message is to convert the hexadecimal representation into binary. Each character of hexadecimal corresponds to four bits of binary data:

0 = 0000
1 = 0001
2 = 0010
3 = 0011
4 = 0100
5 = 0101
6 = 0110
7 = 0111
8 = 1000
9 = 1001
A = 1010
B = 1011
C = 1100
D = 1101
E = 1110
F = 1111
The BITS transmission contains a single packet at its outermost layer which itself contains many other packets. The hexadecimal representation of this packet might encode a few extra 0 bits at the end; these are not part of the transmission and should be ignored.
*/
function* bitIterator(hexStringInput) {
  for (const c of hexStringInput) {
    for (const b of parseInt(c, 16).toString(2).padStart(4, '0')) {
      yield b === '1';
    }
  }
  return;
}

/*
Every packet begins with a standard header: the first three bits encode the packet version, and the next three bits encode the packet type ID. These two values are numbers; all numbers encoded in any packet are represented as binary with the most significant bit first. For example, a version encoded as the binary sequence 100 represents the number 4.

Packets with type ID 4 represent a literal value. Literal value packets encode a single binary number. To do this, the binary number is padded with leading zeroes until its length is a multiple of four bits, and then it is broken into groups of four bits. Each group is prefixed by a 1 bit except the last group, which is prefixed by a 0 bit. These groups of five bits immediately follow the packet header. For example, the hexadecimal string D2FE28 becomes:

110100101111111000101000
VVVTTTAAAAABBBBBCCCCC
Below each bit is a label indicating its purpose:

The three bits labeled V (110) are the packet version, 6.
The three bits labeled T (100) are the packet type ID, 4, which means the packet is a literal value.
The five bits labeled A (10111) start with a 1 (not the last group, keep reading) and contain the first four bits of the number, 0111.
The five bits labeled B (11110) start with a 1 (not the last group, keep reading) and contain four more bits of the number, 1110.
The five bits labeled C (00101) start with a 0 (last group, end of packet) and contain the last four bits of the number, 0101.
The three unlabeled 0 bits at the end are extra due to the hexadecimal representation and should be ignored.
So, this packet represents a literal value with binary representation 011111100101, which is 2021 in decimal.
*/

function readBits(bits, n) {
  let result = 0;
  for (let i = n; i-->0; ) {
    result *= 2;
    if (bits.next().value) {
      result++;
    }
  }
  return result;
}
// @return [literal, bitsRead]
function readLiteral(bits) {
  let result = 0;
  let bitsRead = 0;
  let more;
  do {
    more = bits.next().value;
    result *= 16;
    result += readBits(bits, 4);
    bitsRead += 5;
  } while (more);
  return [result, bitsRead];
}
const tinyInput = 'D2FE28';
const tinyBits = bitIterator(tinyInput);
console.assert(readBits(tinyBits, 3) === 6, 'failed tiny packet version');
console.assert(readBits(tinyBits, 3) === 4, 'failed tiny packet type');
console.assert(readLiteral(tinyBits).join() === [2021, 15].join(), 'failed tiny literal');  

/*
Every other type of packet (any packet with a type ID other than 4) represent an operator that performs some calculation on one or more sub-packets contained within. Right now, the specific operations aren't important; focus on parsing the hierarchy of sub-packets.

An operator packet contains one or more packets. To indicate which subsequent binary data represents its sub-packets, an operator packet can use one of two modes indicated by the bit immediately after the packet header; this is called the length type ID:

If the length type ID is 0, then the next 15 bits are a number that represents the total length in bits of the sub-packets contained by this packet.
If the length type ID is 1, then the next 11 bits are a number that represents the number of sub-packets immediately contained by this packet.
Finally, after the length type ID bit and the 15-bit or 11-bit field, the sub-packets appear.

For example, here is an operator packet (hexadecimal string 38006F45291200) with length type ID 0 that contains two sub-packets:

00111000000000000110111101000101001010010001001000000000
VVVTTTILLLLLLLLLLLLLLLAAAAAAAAAAABBBBBBBBBBBBBBBB
The three bits labeled V (001) are the packet version, 1.
The three bits labeled T (110) are the packet type ID, 6, which means the packet is an operator.
The bit labeled I (0) is the length type ID, which indicates that the length is a 15-bit number representing the number of bits in the sub-packets.
The 15 bits labeled L (000000000011011) contain the length of the sub-packets in bits, 27.
The 11 bits labeled A contain the first sub-packet, a literal value representing the number 10.
The 16 bits labeled B contain the second sub-packet, a literal value representing the number 20.
After reading 11 and 16 bits of sub-packet data, the total length indicated in L (27) is reached, and so parsing of this packet stops.
*/
// @return object with version, type, bitsRead, literal or subPackets[], versionSum
function readPacket(bits) {
  let bitsRead = 0;
  let version = readBits(bits, 3);
  bitsRead += 3;
  let type = readBits(bits, 3);
  bitsRead += 3;
  if (type === 4) { // literal packet
    let [literal, literalBits] = readLiteral(bits);
    bitsRead += literalBits;
    return { version, type, bitsRead, literal, versionSum: version };
  } // else operator packet
  let subPacketQuantityType = bits.next().value;
  bitsRead++;
  let subPackets = [];
  if (subPacketQuantityType) {
    let subPacketCount = readBits(bits, 11);
    bitsRead += 11;
    for (;subPacketCount-->0;) {
      let subPacket = readPacket(bits);
      bitsRead += subPacket.bitsRead;
      subPackets.push(subPacket);
    }
  } else { // subPacketBitsType
    let subPacketBits = readBits(bits, 15);
    bitsRead += 15;
    while (subPacketBits > 0) {
      let subPacket = readPacket(bits);
      bitsRead += subPacket.bitsRead;
      subPackets.push(subPacket);
      subPacketBits -= subPacket.bitsRead;
    }
  }
  let versionSum = version + subPackets.map(p => p.versionSum).reduce((a,c) => a+c);
  return { version, type, bitsRead, subPackets, versionSum };
}

const testBitPacketInput = '38006F45291200';
const testBPBits = bitIterator(testBitPacketInput);
const testBitPacket = readPacket(testBPBits);
console.assert(testBitPacket.version === 1, 'bit packet version. Expected: 1, Actual: ', testBitPacket.version);
console.assert(testBitPacket.type === 6, 'bit packet type. Expected: 6, Actual: ', testBitPacket.type);
console.assert(testBitPacket.bitsRead === 3+3+1+15+11+16, 'bit packet bitsRead. Expected: 49, Actual: ', testBitPacket.bitsRead);
console.assert(testBitPacket.subPackets.length === 2, 'bit packet subPackets quantity. Expected: 2, Actual: ', testBitPacket.subPackets.length);
console.assert(testBitPacket.subPackets[0].literal === 10, 'bit packet subPackets[0].literal. Expected: 10, Actual: ', testBitPacket.subPackets[0].literal);
console.assert(testBitPacket.subPackets[1].literal === 20, 'bit packet subPackets[1].literal. Expected: 20, Actual: ', testBitPacket.subPackets[1].literal);

/*
As another example, here is an operator packet (hexadecimal string EE00D40C823060) with length type ID 1 that contains three sub-packets:

11101110000000001101010000001100100000100011000001100000
VVVTTTILLLLLLLLLLLAAAAAAAAAAABBBBBBBBBBBCCCCCCCCCCC
The three bits labeled V (111) are the packet version, 7.
The three bits labeled T (011) are the packet type ID, 3, which means the packet is an operator.
The bit labeled I (1) is the length type ID, which indicates that the length is a 11-bit number representing the number of sub-packets.
The 11 bits labeled L (00000000011) contain the number of sub-packets, 3.
The 11 bits labeled A contain the first sub-packet, a literal value representing the number 1.
The 11 bits labeled B contain the second sub-packet, a literal value representing the number 2.
The 11 bits labeled C contain the third sub-packet, a literal value representing the number 3.
After reading 3 complete sub-packets, the number of sub-packets indicated in L (3) is reached, and so parsing of this packet stops.
*/
const testQuantityPacket = readPacket(bitIterator('EE00D40C823060'));
console.assert(testQuantityPacket.version === 7, 'quantity packet version. Expected: 1, Actual: ', testQuantityPacket.version);
console.assert(testQuantityPacket.type === 3, 'quantity packet type. Expected: 3, Actual: ', testQuantityPacket.type);
console.assert(testQuantityPacket.bitsRead === 3+3+1+11+11+11+11, 'quantity packet bitsRead. Expected: 53, Actual: ', testQuantityPacket.bitsRead);
console.assert(testQuantityPacket.subPackets.length === 3, 'quantity packet subPackets quantity. Expected: 3, Actual: ', testQuantityPacket.subPackets.length);
console.assert(testQuantityPacket.subPackets[0].literal === 1, 'quantity packet subPackets[0].literal. Expected: 1, Actual: ', testQuantityPacket.subPackets[0].literal);
console.assert(testQuantityPacket.subPackets[1].literal === 2, 'quantity packet subPackets[1].literal. Expected: 2, Actual: ', testQuantityPacket.subPackets[1].literal);
console.assert(testQuantityPacket.subPackets[2].literal === 3, 'quantity packet subPackets[2].literal. Expected: 3, Actual: ', testQuantityPacket.subPackets[2].literal);

/*
For now, parse the hierarchy of the packets throughout the transmission and add up all of the version numbers.

Here are a few more examples of hexadecimal-encoded transmissions:

8A004A801A8002F478 represents an operator packet (version 4) which contains an operator packet (version 1) which contains an operator packet (version 5) which contains a literal value (version 6); this packet has a version sum of 16.
620080001611562C8802118E34 represents an operator packet (version 3) which contains two sub-packets; each sub-packet is an operator packet that contains two literal values. This packet has a version sum of 12.
C0015000016115A2E0802F182340 has the same structure as the previous example, but the outermost packet uses a different length type ID. This packet has a version sum of 23.
A0016C880162017C3686B18A3D4780 is an operator packet that contains an operator packet that contains an operator packet that contains five literal values; it has a version sum of 31.
*/
const testVersionSumPacket1 = readPacket(bitIterator('8A004A801A8002F478'));
console.assert(testVersionSumPacket1.versionSum === 4+1+5+6, 'test version sum 1. Expected: 16, Actual: ', testVersionSumPacket1.versionSum);
const testVersionSumPacket2 = readPacket(bitIterator('620080001611562C8802118E34'));
console.assert(testVersionSumPacket2.versionSum === 12, 'test version sum 2. Expected: 12, Actual: ', testVersionSumPacket2.versionSum);
const testVersionSumPacket3 = readPacket(bitIterator('C0015000016115A2E0802F182340'));
console.assert(testVersionSumPacket3.versionSum === 23, 'test version sum 3. Expected: 23, Actual: ', testVersionSumPacket3.versionSum);
const testVersionSumPacket4 = readPacket(bitIterator('A0016C880162017C3686B18A3D4780'));
console.assert(testVersionSumPacket4.versionSum === 31, 'test version sum 3. Expected: 31, Actual: ', testVersionSumPacket4.versionSum);

/*
Decode the structure of your hexadecimal-encoded BITS transmission; what do you get if you add up the version numbers in all packets?
*/
const dayInput = '620D7800996600E43184312CC01A88913E1E180310FA324649CD5B9DA6BFD107003A4FDE9C718593003A5978C00A7003C400A70025400D60259D400B3002880792201B89400E601694804F1201119400C600C144008100340013440021279A5801AE93CA84C10CF3D100875401374F67F6119CA46769D8664E76FC9E4C01597748704011E4D54D7C0179B0A96431003A48ECC015C0068670FA7EF1BC5166CE440239EFC226F228129E8C1D6633596716E7D4840129C4C8CA8017FCFB943699B794210CAC23A612012EB40151006E2D4678A4200EC548CF12E4FDE9BD4A5227C600F80021D08219C1A00043A27C558AA200F4788C91A1002C893AB24F722C129BDF5121FA8011335868F1802AE82537709999796A7176254A72F8E9B9005BD600A4FD372109FA6E42D1725EDDFB64FFBD5B8D1802323DC7E0D1600B4BCDF6649252B0974AE48D4C0159392DE0034B356D626A130E44015BD80213183A93F609A7628537EB87980292A0D800F94B66546896CCA8D440109F80233ABB3ABF3CB84026B5802C00084C168291080010C87B16227CB6E454401946802735CA144BA74CFF71ADDC080282C00546722A1391549318201233003361006A1E419866200DC758330525A0C86009CC6E7F2BA00A4E7EF7AD6E873F7BD6B741300578021B94309ABE374CF7AE7327220154C3C4BD395C7E3EB756A72AC10665C08C010D0046458E72C9B372EAB280372DFE1BCA3ECC1690046513E5D5E79C235498B9002BD132451A5C78401B99AFDFE7C9A770D8A0094EDAC65031C0178AB3D8EEF8E729F2C200D26579BEDF277400A9C8FE43D3030E010C6C9A078853A431C0C0169A5CB00400010F8C9052098002191022143D30047C011100763DC71824200D4368391CA651CC0219C51974892338D0';
console.log(readPacket(bitIterator(dayInput)).versionSum);

/*
--- Part Two ---
Now that you have the structure of your transmission decoded, you can calculate the value of the expression it represents.

Literal values (type ID 4) represent a single number as described above. The remaining type IDs are more interesting:

Packets with type ID 0 are sum packets - their value is the sum of the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
Packets with type ID 1 are product packets - their value is the result of multiplying together the values of their sub-packets. If they only have a single sub-packet, their value is the value of the sub-packet.
Packets with type ID 2 are minimum packets - their value is the minimum of the values of their sub-packets.
Packets with type ID 3 are maximum packets - their value is the maximum of the values of their sub-packets.
Packets with type ID 5 are greater than packets - their value is 1 if the value of the first sub-packet is greater than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
Packets with type ID 6 are less than packets - their value is 1 if the value of the first sub-packet is less than the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
Packets with type ID 7 are equal to packets - their value is 1 if the value of the first sub-packet is equal to the value of the second sub-packet; otherwise, their value is 0. These packets always have exactly two sub-packets.
Using these rules, you can now work out the value of the outermost packet in your BITS transmission.
*/

// @return object with value, bitsRead
function readPacket2(bits) {
  let bitsRead = 0;
  let version = readBits(bits, 3);
  bitsRead += 3;
  let type = readBits(bits, 3);
  bitsRead += 3;
  let value;
  if (type === 4) { // literal packet
    let [literal, literalBits] = readLiteral(bits);
    bitsRead += literalBits;
    value = literal;
  } else { // operator packet
    let subPacketQuantityType = bits.next().value;
    bitsRead++;
    let subPackets = [];
    if (subPacketQuantityType) {
      let subPacketCount = readBits(bits, 11);
      bitsRead += 11;
      for (;subPacketCount-->0;) {
        let subPacket = readPacket2(bits);
        bitsRead += subPacket.bitsRead;
        subPackets.push(subPacket);
      }
    } else { // subPacketBitsType
      let subPacketBits = readBits(bits, 15);
      bitsRead += 15;
      while (subPacketBits > 0) {
        let subPacket = readPacket2(bits);
        bitsRead += subPacket.bitsRead;
        subPackets.push(subPacket);
        subPacketBits -= subPacket.bitsRead;
      }
    } // fi subPacketQuantityType
    let op;
    switch (type) {
      case 0: value = subPackets.map(p => p.value).reduce((a,c) => a+c, 0); op = 'sum'; break;
      case 1: value = subPackets.map(p => p.value).reduce((a,c) => a*c, 1); op = 'prod'; break;
      case 2: value = Math.min(...Array.from(subPackets.map(p => p.value))); op = 'min'; break;
      case 3: value = Math.max(...Array.from(subPackets.map(p => p.value))); op = 'max'; break;
      case 5: value = subPackets[0].value > subPackets[1].value ? 1 : 0; op = 'gt'; break;
      case 6: value = subPackets[0].value < subPackets[1].value ? 1 : 0; op = 'lt'; break;
      case 7: value = subPackets[0].value === subPackets[1].value ? 1 : 0; op = 'eq'; break;
      default: console.error('unexpected packet type: ', type);
    } // type
    return { value, bitsRead, op, subPackets };
  } // fi literal or operator packet  
  return { value, bitsRead };
}
/*
For example:

C200B40A82 finds the sum of 1 and 2, resulting in the value 3.
04005AC33890 finds the product of 6 and 9, resulting in the value 54.
880086C3E88112 finds the minimum of 7, 8, and 9, resulting in the value 7.
CE00C43D881120 finds the maximum of 7, 8, and 9, resulting in the value 9.
D8005AC2A8F0 produces 1, because 5 is less than 15.
F600BC2D8F produces 0, because 5 is not greater than 15.
9C005AC2F8F0 produces 0, because 5 is not equal to 15.
9C0141080250320F1802104A08 produces 1, because 1 + 3 = 2 * 2.
What do you get if you evaluate the expression represented by your hexadecimal-encoded BITS transmission?
*/
console.assert(readPacket2(bitIterator('C200B40A82')).value === 3, 'sum failed');
console.assert(readPacket2(bitIterator('04005AC33890')).value === 54, 'product failed');
console.assert(readPacket2(bitIterator('880086C3E88112')).value === 7, 'min failed');
console.assert(readPacket2(bitIterator('CE00C43D881120')).value === 9, 'max failed');
console.assert(readPacket2(bitIterator('D8005AC2A8F0')).value === 1, 'less failed');
console.assert(readPacket2(bitIterator('F600BC2D8F')).value === 0, 'greater failed');
console.assert(readPacket2(bitIterator('9C005AC2F8F0')).value === 0, 'equal failed');
console.assert(readPacket2(bitIterator('9C0141080250320F1802104A08')).value === 1, 'sum eq prod failed');

console.log(readPacket2(bitIterator(dayInput)).value);
