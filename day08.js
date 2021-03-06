/*
--- Day 8: Seven Segment Search ---
You barely reach the safety of the cave when the whale smashes into the cave mouth, collapsing it. Sensors indicate another exit to this cave at a much greater depth, so you have no choice but to press on.

As your submarine slowly makes its way through the cave system, you notice that the four-digit seven-segment displays in your submarine are malfunctioning; they must have been damaged during the escape. You'll be in a lot of trouble without them, so you'd better figure out what's wrong.

Each digit of a seven-segment display is rendered by turning on or off any of seven segments named a through g:

  0:      1:      2:      3:      4:
 aaaa    ....    aaaa    aaaa    ....
b    c  .    c  .    c  .    c  b    c
b    c  .    c  .    c  .    c  b    c
 ....    ....    dddd    dddd    dddd
e    f  .    f  e    .  .    f  .    f
e    f  .    f  e    .  .    f  .    f
 gggg    ....    gggg    gggg    ....

  5:      6:      7:      8:      9:
 aaaa    aaaa    aaaa    aaaa    aaaa
b    .  b    .  .    c  b    c  b    c
b    .  b    .  .    c  b    c  b    c
 dddd    dddd    ....    dddd    dddd
.    f  e    f  .    f  e    f  .    f
.    f  e    f  .    f  e    f  .    f
 gggg    gggg    ....    gggg    gggg
So, to render a 1, only segments c and f would be turned on; the rest would be off. To render a 7, only segments a, c, and f would be turned on.

The problem is that the signals which control the segments have been mixed up on each display. The submarine is still trying to display numbers by producing output on signal wires a through g, but those wires are connected to segments randomly. Worse, the wire/segment connections are mixed up separately for each four-digit display! (All of the digits within a display use the same connections, though.)

So, you might know that only signal wires b and g are turned on, but that doesn't mean segments b and g are turned on: the only digit that uses two segments is 1, so it must mean segments c and f are meant to be on. With just that information, you still can't tell which wire (b/g) goes to which segment (c/f). For that, you'll need to collect more information.

For each display, you watch the changing signals for a while, make a note of all ten unique signal patterns you see, and then write down a single four digit output value (your puzzle input). Using the signal patterns, you should be able to work out which pattern corresponds to which digit.

For example, here is what you might see in a single entry in your notes:
*/
const tinyInput = 
"acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab |" +
"cdfeb fcadb cdfeb cdbaf";
/*
(The entry is wrapped here to two lines so it fits; in your notes, it will all be on a single line.)

Each entry consists of ten unique signal patterns, a | delimiter, and finally the four digit output value. Within an entry, the same wire/segment connections are used (but you don't know what the connections actually are). The unique signal patterns correspond to the ten different ways the submarine tries to render a digit using the current wire/segment connections. Because 7 is the only digit that uses three segments, dab in the above example means that to render a 7, signal lines d, a, and b are on. Because 4 is the only digit that uses four segments, eafb means that to render a 4, signal lines e, a, f, and b are on.
*/

// @return alphabetized letters in pattern
function normalize(pattern) {
  return pattern.split('').sort().join('');
}
console.assert(normalize('deaf') === 'adef');

// @return normalized [input, output]
function parseEntry(line) {
  return line.split(/\s\|\s*/).map(s=>s.split(' ').map(normalize));
}
console.assert(parseEntry('dab eafb ab |ba dba').join(';') === [['abd','abef','ab'], ['ab','abd']].join(';'));

// @return object mapping known patterns to values (otherwise undefined)
function getPatternDigits(inputPatterns) {
  let result = {};
  for (const pattern of inputPatterns) {
    switch (pattern.length) {
      case 2: result[pattern] = 1; break;
      case 3: result[pattern] = 7; break;
      case 4: result[pattern] = 4; break;
      case 5: /*noop*/ break;
      case 6: /*noop*/ break;
      case 7: result[pattern] = 8; break;
      default: console.assert(false, 'unexpected pattern length for ', pattern);
    }
  }
  return result;
}
const tinyPatternDigits = getPatternDigits(parseEntry(tinyInput)[0]);
console.assert(tinyPatternDigits[normalize('dab')] === 7, 'three segments was not interpreted as 7');
/*
Using this information, you should be able to work out which combination of signal wires corresponds to each of the ten digits. Then, you can decode the four digit output value. Unfortunately, in the above example, all of the digits in the output value (cdfeb fcadb cdfeb cdbaf) use five segments and are more difficult to deduce.

For now, focus on the easy digits. Consider this larger example:
*/
const testInput = [
"be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb |"+
"fdgacbe cefdb cefbgd gcbe",
"edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec |"+
"fcgedb cgb dgebacf gc",
"fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef |"+
"cg cg fdcagb cbg",
"fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega |"+
"efabcd cedba gadfec cb",
"aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga |"+
"gecf egdcabf bgf bfgea",
"fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf |"+
"gebdcfa ecba ca fadegcb",
"dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf |"+
"cefg dcbef fcge gbcadfe",
"bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd |"+
"ed bcgafe cdgba cbgef",
"egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg |"+
"gbdfcae bgc cg cgb",
"gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc |"+
"fgae cfgab fg bagce",
  ];
/*
Because the digits 1, 4, 7, and 8 each use a unique number of segments, you should be able to tell which combinations of signals correspond to those digits. Counting only digits in the output values (the part after | on each line), in the above example, there are 26 instances of digits that use a unique number of segments (highlighted above).
*/
function easyCount(lines) {
  let count = 0;
  for (const line of lines) {
    let [input, output] = parseEntry(line);
    let patternDigits = getPatternDigits(input);
    for (const pattern of output) {
      if (patternDigits[normalize(pattern)] !== undefined) {
        count++;
      }
    }
  }
  return count;
}
const testEasyCount = easyCount(testInput);
console.assert(testEasyCount === 26, 'expected 26, but was ', testEasyCount);
/*
In the output values, how many times do digits 1, 4, 7, or 8 appear?
*/
const dayInput = [
  'abdfce bedag acdefgb cg febcga fbdac fcdg cabdg bcg bgacdf | fdcab adbcf gcb acdebf',
'bgeacdf dgebca gbc fbgd fceba fecdg bcgef cfgbde gb fegacd | dbfg abecf dfgb gaecdf',
'dfega bedag af agf fdagcb cbaedgf feac dfecg dcegfa gcfdbe | fag edcgf fga bfgcad',
'ca afc bdafe bgface afdebc dcab cgedf fcaed cdebfga fabged | fcdea abdc fdcbea fdbcega',
'gabde beacg cgafe gcfeab gebdcf fedagc edfgcba bc acfb bcg | fagedc bgc bgace cbg',
'df cfd geabfc ebgadcf dfae dcgfe decgb agdcfb aecdfg cgfae | fd fd ecfgd gfbcea',
'fcebdga cf faebgd fecgbd bcdfg egbdf cgadfe bgadc gcf cefb | fcg gfc fgc dfcega',
'abedcg afdcgb ae fcgad fbcge gea dfae deafgc efgca cagebfd | gea fgcbade ea ega',
'dc egcbf dgbce abdge acdg dbfeac dbeagf gecfbda dec cgdabe | agebcdf cadg agbfed cd',
'bag ecgfb beagf ga edbaf aegc bfgdac bedcgfa gabcfe fdebgc | debacfg bga degcfb bacgfde',
'gebcfa efbcgda fbgdae egcdb aecbg dfegac eagbf fbca ac aec | gaebdf cabf aegbdf fegba',
'bedg abcdg dcagef gd cfgba fdaebc cdg badgec bcaed egcadbf | gabced gd bcdag ebgd',
'gbdfca agedfc acedg fcgeb dbacfeg ab cba cbadeg daeb gbace | adbfgc ecfdbga ebfcg ab',
'bfdag cbegafd dfabeg bge ge bdcae gabfdc faeg gefdbc gdeba | dbega dgecbfa adbce fecbadg',
'edbf efcabg edfbgc gdcbf ecgdf egdacf cbf bf cbegfda gadcb | dfbe gfdbc fcb bf',
'gcefa egdb gcfeb fdgbace dfbcg be bgfdca caedfb bec cbfgde | bec dgeb ceagf egfcbda',
'eabcd ceagfb bdgcea cgdeb bgcfde gadc fabde abc ac dfgebca | agfcbe bcadge abc cab',
'agfedc edabfcg bf fgcdab ecabd dfb dfagc afbegd cbfg cfabd | fbcg cfadg geafbd deabc',
'afdeg ce eafbcdg bgcfa fedagb dcgbfe aedc gcaedf fcage cge | dfcbgae ec fecga caed',
'bec cbgedf fagbcd abdec agbed feacdb fdcab acfe dgbcafe ce | cgfbad abdge bec badcfe',
'begac ade egcadb dfceagb acdg degfb eafcbg da bedacf dageb | debga faedcb acgeb fgdeb',
'ecdga gfab adcgb cgdebaf edcbfa ab bfcdg fcegdb acbdfg bda | dcaeg egdfabc dagbfc dgabcf',
'agb cbgea bafcdg edbgfca egacfd edbac gacef bg gefb fbaecg | aegcbf decfga gb aecgf',
'bfdec fegacd cfdbeag dba fadcb bdfgae cagdfb ab acbg dcgfa | efcdag cabg geadbf ab',
'dfegcab cba facdbe agdcf egadb aebdgf cb cbdga gceb bedacg | bac cgeb cb cfaedb',
'dfbeg cdgabf efgbad cgfbdae dbfag eg beg fdebc gbacde efag | gbe eg bgfde gafe',
'dafce ba fbeagcd acdfb abce dab cedgaf fcedab cdbgf efgabd | bcgafed beac abd caeb',
'efadg ebfag cbaf bga bfecgd ab gcebda becgf eagfcbd aegcbf | dcfegb fbgea cagdebf cefdbg',
'fgae fcgdab dacgbef gdfba eba ae bdcfe befda gdabef ecbdag | afdgecb efadb daegfbc gdfba',
'edbfac begcfd acedbg decbf ead ae cfedbag ebfad bdfag afec | cfae dbcef ade debcgf',
'bgf gcaef fgceb fgcebad fedbc gb dcegfa abcfgd geab bcgafe | fdcabge abeg fbcagd gb',
'fgbcea bdf bdcae gdef fd ecfdb agfbdc fbdaecg fgdbce bcefg | cbgfe gefd fedg fbecg',
'edcabfg fbagce ac dcagb agc gbecd gdfab fbdecg dbcgea dace | fdagb deac adec cga',
'eafcbg dbage egbcdf eagbfdc gf edbfc gfb cafbde fdgeb gdcf | ebdga fbegd fg fbg',
'ebgaf bdegacf cbgf dcfeab fbe bgaecf cegaf egbad bf eadfcg | fb bf bcfg gcfea',
'cagfde eag gbcde acfebgd bcefad cafg aedcf fbdega ga gcaed | cfeda cagf ag dfcea',
'bdaegf bfdgac feb defa abdgcef abgfd gbfed gfbcea ef dbceg | edfbg ef dbfge fe',
'cefgb cegdafb begcda agb fdacg ba agbcf gdefcb agcfeb ebaf | cfegb ab gfadcbe dgbcfe',
'feabd fc eafdcbg gcaeb efagdb cbaef dcbagf ebfcad fca dcfe | cfaedb cbgae afc cdebfa',
'degfcba cga bafgce eabgd dgcba bgdcf afdc ac gfbdca fegdbc | bgcafd ca cag ac',
'bcdefa gf fdeabg bgf bagce gabfe dgef dfcgab fdbea cfgdeab | gf egdbaf afegb egfd',
'fbed gefadc dfeabc bcdae adb db dfeac gbdcfa cgeba cfegabd | cgfead dcaef dba edfb',
'dfcbe gd dbafec cfgedb aecdfg cgafb cfebagd gdc egdb gcdbf | dg dg gd dgc',
'gcef gdbac cbadfe aedfgb ecfda ge bcdfaeg gae acedg ecgafd | aeg cedfagb bacfged eagdc',
'de ebcdfg acgebd abegc becafg edb abged afdgbce deac gbadf | ecfagbd gabec gebda ed',
'gadebc gcfdaeb abefg ebgcdf eagfc ab gfbed eab fbda baegdf | edcbga abe baecfgd dbaf',
'bfced fe bfdac fgadbe fed cdgbe fcea adgfcb dfebagc adbfce | feac adcegfb gbfdae edgafbc',
'fgcbda abfdge dbe acfbe gdcebfa dgef ed gadfb gecdab eabdf | dbgace febda fdgbac dgebac',
'fabgce fceda faebdgc bfecd gbdfea degbfc bcdg bfd bd bcfeg | egbcf dfb gcefabd degcbf',
'bfdga agdbef cafdg dacgbfe afb aebd bcefga fdgeb ab decgbf | fdecbga ab bfa fbegd',
'cbg cfdb fabecgd acbged acefg gdbfae cb dfbegc cfegb egbdf | gdacbe gbfed cb dfbc',
'cabfeg ebdcfag cb dagfbc cgfda fbcd gcb ebgda dfcega gcabd | cdgafb dabeg fdgcab adcfg',
'gfdba fcabd ca bac fbecag abdecf cead acgebfd bedcgf cebdf | dcafb gbedcf facgedb acb',
'gecfbda febda fg cgdf ebacfg gbfde cdeagb gebdcf gecbd efg | egfdbc gcefba dgbfe adcgefb',
'egbdf ged aefgb dgfbec abfgdec cbgdf de gcadef dfgacb edbc | dfecag de gaecfdb gcefda',
'gacfe fbdegca gdfb edg baecfd befad aedfg bdgcae gd befgda | bafegd dgfb bdafe daebgf',
'becgda gd gbed bdefgac agfbce cbage dcfbga edfac agedc dgc | cgbea dgc gfabedc cdg',
'dgfec gaf efca gcadbf faedg efdbagc af ecfbdg gacfde abged | ecfbgd cfegd fa bgdefc',
'ecbadgf efbg egcdbf edf dcgfb ecdag ecfbda agbcfd dgcfe ef | gcefbd efacdbg acfegbd ebgf',
'dacfbg aegfdc fcgeabd dcgaf fdae fe bgeac dbfegc aegcf ecf | fe afceg fe gecdfb',
'bfdeg feagbd aebd gab fdcgeb begaf ba cdeafgb ecafg dbfacg | cgfbda agcef afgbe egcdfb',
'bafgc cgefa bdgfa gbdacf bc agefdb gbc gcfdeba bfdegc bcad | dafbg dfbcge dagfbc fcega',
'dbfge defbga gbeadfc bgdcfe bc gceda bcg cbdge gcaefb dbfc | cb bgc egfdcb abegcf',
'fda fadce da ebcaf adcb feacdb gedfc cbadgfe egabdf beafgc | egfbda bfcgade ad feabgcd',
'dcegf eafdcg afgc fgbeacd debcf abgedf gec eadgcb cg dgeaf | fcged afcgde dgcafe gdbecfa',
'becafd dafcgbe feb fgab fdebg bf abdefg gefacd gafed bedgc | faebdc fdagbe dgebf bgfa',
'cfgbeda ba fgacd bfca ecgfad bga gdacbf bdgac bdgfea cgbde | adfcge gfadce ab bga',
'dcbgafe defga edabcg cadefg dbegf facge fbaceg ead da fcda | begfd gfbcae dae eda',
'acebg bac dfbgca dcega cefabg ba fgdcbe aebf fcbdage fbcge | cdagfeb efba abc ab',
'acfge gde gecfbd ecgabf dg daceg acdegf gfda cadbe eacfdbg | dacfge fgabec gde fecgdab',
'edagf cfdge adf bdacfe ecdgfb cagd ad fdeacgb egfba gcfeda | fdaeg efgab ceagfd efbga',
'fgabd efbdg gfcde ecfadg dfcegb gecbad be efcb deb acefdgb | ecfgd bcef deb dbgaf',
'abgcf dgebaf eg gfbadc ega cadfe fgaec gdceafb egbc fbagce | bgafce afecdbg fcdae egcb',
'dbaecgf abdcgf dgbfce gdbef gcf dabegf ecfb dfcge caedg cf | gdefc cgedfab gdcbaf efcb',
'gcdeab acgbfd cefdg fbcgd aefbgdc bcafg fcabeg db bcd dbaf | cfedgab bdfa cbd cdgbea',
'gb fedbga gbdaf fbcda bdcgea gbd facdge gdceabf agefd gfeb | bgecfda gbefda gbd gcfabed',
'dga defcbg eabg dbcgfa ag ebcfagd gbecad fecad cegdb cegda | acbdfg cedagb ga gdeca',
'gcefba dabgf dcgaefb cafgd aedcg dcef cbgade dgaefc cf afc | cedf gbaced fc dfgecab',
'egcfa fbgce cbdfgea fgadce cbdagf edafg cade ac beagfd cag | fgbce febdgca adbgfce gac',
'gfdce eabdcfg ag gcadf agd cdfbge acge bdafc gefabd cedagf | gad gace gfeadb afdgeb',
'dfbgea bdcea cgd bcfg gc cafdge bfdga bagcfd gbdac abdgecf | cgdab dbfage fbcg dgc',
'cabdf bac cdgfa cdeb eabdf fedabc adfbecg dgefab ceafgb bc | fcabde bc bdcfa abedcf',
'fedacbg gb bgf bdag fecbda dacbf cbgfa agfce bcfadg dfcgeb | gbf dbfcea gb cbfad',
'fbdcea bcafe fac cfdbe cfbdeg adgbefc fgdcab af feda bgcea | cfa bfcaed cebdaf cafdeb',
'agf cdefg gcaebf cgbdea af begadf badf agfed dagebfc bdeag | fcegbad gbecda begda fegbad',
'fbdec gfbace egdfb acbfe dcba dcf gfdbcae decfag aecfdb dc | dgfcbea cd acfegb cdefab',
'ecfbag ba gab afbc cgabe bdecagf fecag facdeg bafged cebgd | fegadb gba cfage ba',
'abfeg bdgfe fbecda cbfdage egcbd gfcd efd gfcdbe df eabdcg | gfdbe dgecfb bdgeca eafgdcb',
'fc debfa cfb ebgcfa fgcbde acfbe dbgeac gaceb egabfcd facg | cgbae fc cgbaed cbf',
'ac egbfcda gfbec gecbfa dgfceb fcba dcbaeg faegc gac fdeag | gcbfae ceabfdg eadgcfb ca',
'bga cefbgda gfebc eafgbd edgacf cdba fcadg bagcf ab adcfgb | bgcafd gdbfac dbcgaf dcab',
'bdecfa gbcfa bec fbaed cbeagd cabef ec egcfbad aegbdf dcfe | edgabf cabegdf ec bdcagef',
'gcfaedb bfgec ceagb cbdfeg eabdcf fg fbcde gef gcdf bgafed | egf fgdc dcgaefb gfceadb',
'edag dab fbdag da gdcfb edacbf efagb abdecgf agebdf bagecf | deag fgdba bfeagdc efacgb',
'dgfc fgcbde edbacf abgef fdgbe fd dbf egcdb fbcdage aegdcb | cbdeg bcegd cbdage bdf',
'bcgfda dcbef facgeb gadcef bfg afdgc adgb gdfcb eacdbfg gb | cbdfaeg abgcedf egacbf becdfga',
'gafdbc gcefa egacb gaedbc fga fa faebcdg befa ecdgf gecbfa | egcab facdbg edgfc af',
'fagcde gef eagdf gfdba cdgfeb fadgbec eg badcef dfcea geca | gdabf fge adegcbf aebdgfc',
'bedgaf cb fcabdeg dcebfa bacgde cba gcafe dabef cbeaf fcbd | cb bdfc dafebc gceadfb',
'dafbe gf abdfg dfbeagc bgacd ebfg dbcefa dafgce gdf beadfg | gcdba cfegad cdfabe fgbe',
'dfabg cfbedg dgcbafe dceba fdagbc aedgbf fgca gc dcbag bgc | dfgceb cgb cbaedgf cgefbad',
'bdfegca dcegb fadc fegadb df cfbed bfd cbegaf fecba afbedc | gfacbde efbagd egcdb fbegdca',
'bcfgea eacgf cbdeaf fbedgac gbcfa gcadef baf gbcfd bgea ab | gaecbfd dgfbc afb dfaebc',
'bafdgce cbgd facde bgcaf dbacf db acgfdb aecgbf abd ebdgfa | fadce abd feacd bdcg',
'fgcdab efcadg gfdaebc aebfc bdefgc cefgb eg dgbe cgbfd feg | eg cegfbd dabfgc eafcb',
'acge bedgafc edafgc dfgbac ca bfdega cdeaf acf fdceb fdeag | facde fac ca ecfadgb',
'dbagf fbdeag cgbfad dbc gcfb gbdca bc ecdbaf egacd fedcbag | cb cdbfega dbc fbcg',
'dceab egfdacb bfc gfba fcagd bdcagf aefdcg cdafb decgfb fb | cbedfg acgdf bacfd fbc',
'fea bgcfe af fceag gbfdea fcagbed dgafec cfad dabgce aedgc | fea gceda edcagf fabdge',
'dfbga abfdce fdb bdeg adebfg gcafb daegfbc bd gcadef adfge | efdagb afgecbd fdgab bged',
'aebfgd gedfa bf afb ecfgda fgbe aegfcbd agdbf abdefc bcdga | gcbfaed fadeg bf cfdeab',
'cgaebd cg faecgbd fbagd bfecad aceg gefbdc bcdea cdg bcdga | gcabd cdg dabgc gbfad',
'deb cfgdeb acfebd fgbce fbdgcea bdfg cdgae dbgec bd fbaegc | ecbfg gabefc fgecbad deb',
'fca dfeab bacfgd gfdec ac debcfa caeb abfedg efadc bacedfg | fadce bdaefg dbfgca dfgbaec',
'cegfb egabd df adfcgbe efd bfedga feagdc bfad acbgde bfdeg | daegb fd efdgb bafd',
'agcedb egbacdf defgcb aefcgb gecab cfg acbfg bfcda gfea gf | adgcfbe cdeabfg fg fgae',
'fedcb caedf fgdacb dgefb cbf bc gefabd gfcaedb edgfbc bcge | cbf fcaed fbc fcebd',
'decaf bgfe dfage abgcdfe bfagd gde ge becagd bfgade bcdgaf | ged edg fegadb gedaf',
'ecgbf fabedc ebdcf fgc gc gfdbcae cbdfag dcbefg cegd ebgfa | cbadfeg fgabe feagb cfg',
'gfdca cgdfe gdecfa acg deag befadcg agefcb ag dbafc ecbdfg | gac agc edgfc acgdf',
'adfcbe fdaec agbefc gcfed cg cge fgeadc bfdge gcbefda gadc | facged cg acfde cge',
'edcf cbfged cbadg bfegcda eadbfg gfc bfgdc cf dfgeb ecbgfa | fc caegbdf abedfg aebgfc',
'edbafgc fegdba gadeb cdbega bfa afbcge bdfe fdagc fb fagbd | dcgbeaf agdceb bfecag bedf',
'bdefgc bcadg dfgba bedgafc edcbga cd gcd acfgbe baceg dcea | gcbadef daec bdgac ebgac',
'cbdag dbeg dbgafec gd cgd gabdec fcebad gbcaf eadgcf bacde | dg gdbe dbgace cgd',
'dfaebg dacgb bgfda egdbc gca aecbfg dcgfba ca dafc becfdga | bdcag ca ceadbgf dfac',
'edagc adbefg dgfae befcda gef dfcgeb bedfa afgdbce gf afgb | afdbe bfdgcae afbg gbfa',
'dgecba fegd begafc egfca agd fdgac aecfdg decfgba fdbca gd | abcfd gad afcbeg gd',
'ceabgf fbeg bacge fcedag adcbg eg gfecadb gce fbcae fcebda | defagbc cge ecagfb ge',
'aed fbcde aefbgcd beac gdfba ae beadf fbcaed cefadg fbcegd | ae dbefcga efbad ade',
'dbeagcf cdgae abfedg gfbdca cgb gdcbfe cdagb fbdag bc bacf | bc abcf cgb bcg',
'afbegc dabfec cega dbfag acfeb facgb gbc bgefdc efbacdg gc | egcbdf bgc edcfba bgc',
'bcfe cdegf bgedcf bdfga ebgcadf bfged cgedba eb egacdf dbe | febc cebf bacedgf fbgedc',
'fgaeb cbg bafcdg gc afgdeb eafdcbg bceda egcf acbgef cgbea | gbc gcef cbg fadgbc',
'cadbge dacfeg bfdage dgcab abfdc edgac gcbe bg gecadbf dbg | bg beadgfc cbge gb',
'geadfbc aegcdb cfdgb ebcgd ecdf fdgecb fbc dbafg geafcb cf | decf cf fc cf',
'cfagdb fbgac cgeaf dgfaebc faebgd ab bcad baf fgbcd bfcged | cgdfb fgcbd ab dbca',
'fcedg dbgcfea bg bgdf fagedc efdbgc bge aecbd bcgeaf dbegc | geb dfbg bfdg cdbea',
'defag bfcgde ea abfceg efbdg abde fae eagbdf aebdgfc cfgda | fea cdbfge gdcefba fdgbe',
'abef af gaf begfd dbfgec egcad aedfg bdaefgc bfcagd dfegab | agebfd cfabdg ebaf afeb',
'dfecab bcdae eabfg gc gdcfba agbce cbaged gedc cgb ebdafgc | cdeg cdegab dbeca gaceb',
'dbeg fecdg dcgafe abfec fdbec cfgdeb db bcgfad dbc dfgaebc | efdbc gfdacb bdc ecfba',
'dfecbg gdb gcde bfdce fgbeda gcdabfe dg gfcbd gcfba acefbd | gd efcagdb gacbf dbefac',
'fgedac dbaec febadc ag egbfc age agedbc dbag gfbcaed beacg | gae ga bgad adbfec',
'agfedc bdcefg fcdag gfc fbagd fdace agce cebdfa fcdegab cg | decfa fedca efadcb fcg',
'edcag ae gdecf ecba gaebdfc cdfbag daebfg eag gecbad abgcd | dcafebg ae egdabfc ae',
'fbdeag daebc dgbfac fabeg aecbgf dgfe fd daf bdecgaf adefb | dbaec edfg gfed aegbf',
'efacdg geb be gefdba eabf gcdeafb agbecd gedbf bgfdc daefg | efba gbe bfgcd degaf',
'decagfb gcfbe abdge adbgfc defagb gbdaec fdae fbgea abf fa | beadgf aedf bgade efda',
'aedf bagdfce cagfdb dfgac ecfgbd fe fec geabc cgeaf gafced | dcagf fgebcd cef bcefadg',
'dc dagbec fgbadce cde dacf dfecb fbgde afcgeb fbcdae fbeca | bcfde cd dc befdg',
'ebac ebfacgd cfe ec agbfe egcfab fgdcb cefgda egafbd ebfcg | cdgfb gdcafe bfgce acfedg',
'febdgc cge fcdgea dbgcefa bcdeg egadb dgacfb bdfgc ec ebfc | dfbgc adbfgc cefdga ce',
'cbd afgcedb gefdc cbgde aecdbg afcdbe bd gabce gadb gafceb | bcega ecgdb ceabfgd gebdc',
'dfabc agcfb gaf gf cebdfa adfbge gcafdeb cdfg bgcea cbfgda | gabcf ecbdaf dcfg fg',
'adebcf baefd dbegfc gedbacf fdbce fda fgbcad af afec gabed | feac ebfdgc ecgbfd gdeba',
'cgebad ad fcdbag dfca fbdge cabfg fgabd dag acfgbe eacfbdg | da dag fgcba ad',
'bface cfbgaed abegdc gdecbf aed dfeba da dgfa bdegf bafgde | dgfa ead fgad dbfgec',
'afgbdce ebacf abde ed ced cadfg gcdfbe ecdbaf faecd fegabc | ed bade de afdceb',
'aeg cdbaeg cabdfe fgceb cafgde ga adgb efdagbc eacbd cbaeg | cdaefb defgbac gae dagb',
'ebgf bcdef bgdca ebafdc dfegcb gf dgbcf cfg cdebgaf caefgd | cbeadgf fg fg cgf',
'aeg afcde cagbfe gcbdfa bafgc edbcgaf bfge acgfe ecdbag ge | ge ecadbg ecabgd ega',
'gfdca fabcg eafcbdg efdgc fead egacfd bdaecg da cefbdg dga | feda agd cdgabe bcafdge',
'gb fgbedc fegba efagbc bgca fbdea cegfa fbcadge aedcfg fbg | fcgbde bfage cgfea fbecgd',
'gbf acgdef dfabceg ebfadg bgde gfead cgeafb fabgd dcabf bg | fdcgaeb bg gbfcea afbgd',
'begcf baec cafgb fedcgba bag ba fadcg dfabeg afgbce fdbecg | bcadfeg gcfeb daegfb caeb',
'badgfc fdagecb bgefa egcab agbfed fa eafd dbfge dcbgfe fag | agf fa faed fga',
'cdabgf decbg gceabf dfeabg gfeab adb dafe bedga cadfbge da | gebdfa aefgb deaf cbedg',
'dfaceg fabecdg gedf gbecaf de fcaeg dec cabfd adbecg fdeac | ed cbfda de cbfeag',
'cgbeaf afbdc bega gbfec cea dcfgbe ae dbaegfc ebacf cegfad | gbae cefba aec gfbec',
'gb fgdeac efcbgda eacbd agefd gab edbag ebfgac dgfb edabgf | bfgd egdaf gb bag',
'fdeabcg gabdfc gedfca dabce cfge edbagf geacd dafgc ge ega | gfce ega dfcbga gfedacb',
'ad dca cefgba abfcdg dcbaeg dbea ecabg gdcea egfcd gafbcde | egfdcab gcdfe bgeca adc',
'efag eba ea abfecd cedafgb gabfec fgbdac gcdeb acfbg gceab | bae ecgab cbfga gfae',
'bafcged cfb dfgba afbdec cf daebc bcgfde dagbec dfcba caef | cf agbdf caefdbg fegdcb',
'cgfadbe dceabg adebg fgaedc gcba dca ca aedbc geafdb dbfce | cdabe gbdea eacfgd adc',
'eabfdg cfbdag eb bfdeca feb dfcbgae ecgfa aebfc dfcba edbc | ecfba cafge be be',
'ea agbde cfbdea egdbfa abdgfc ead bfdga cbged agfe begcfad | baecdf adgeb ade cbfadeg',
'dabfe fgceab adfec aegdb dacegb fgdb bef fb dafbeg bedfcga | abdge abgfde gfdb eagfdb',
'badcf egabdc gb efdgac gedafb gab fecadgb bgfe gefda abgdf | bag cbedag agdfceb dfcba',
'aedgcf eacdbg ea gae efcgd gcfab gcebdf facebgd gfaec faed | afde eafd ceadgb cdbage',
'gbeadc fgdac ecagf ebfg abdfce cgfeab ge dcgbafe aefcb ecg | ebdgca gec ecbdaf dbafec',
'cdfbe adcfeb acf efgbcad ac dbca befgcd gabef geadcf febac | ac eacbdf caf ecdgbf',
'aebcfd cdabe abfeg defbagc bfgced fd gbcdea edf fbdae dacf | dcaeb cfad dfe fcad',
'bdcg fecdba bd cagbef dgeab dbgcfae ebd gedcab eafdg gcaeb | cgbd aecgb bgcea ebd',
'bcgfe dbecgf fgdbae afgce bedcf dbeafc bg cgdb cadgefb beg | ecdfgb daegfb bfegc ecfbg',
'ebgcd bdecgfa gdabfe gedfc dgf fg edabcf gcaf eafcdg cfeda | dbaecf efgcd fgedab fgdeac',
'gefcdb gfadb ea efgab gcefb gea cefa ecgfabd bcafge egcbda | egacdbf gebfc ae ega',
'cgedfa afd febagdc fadeg dgcabe cabgfd acef febgd cadge fa | afedg fa abgced gacbdf',
'dbcfea dc dbgae egdafb bcd debgc cgad egbdafc gcebad befgc | cd dcb dgca decbg',
'ecfad aegcbf fedcbg edcbf gaedcb fb cgeadfb gfdb edgbc cbf | becafg bgdf fcb gecdbf',
'ce dgecbfa bgdac gdbfae dce egdac acdebf cfeadg adgfe fgce | gaefbcd degca fcge dbcfeag',
'fd eafcgb cdf dcfgeb fabce gecda dbfa beagcfd deacf abfcde | defca fecab cdaeg ecafb',
'cagdbf ca gacfd cgbeafd dcfge gac gafdb dacb bfgaed becgaf | gcdfa cdab dcab bcfeagd',
'gadef aedgc afg gcadbf ecdfag fg gfbdeac adfeb cfge bgaedc | gf bdcgfa dgafe bgcdaf',
'agdc gefdbc dbgfa ad cfbaed dba cbdfg ecfdagb egfba dgcabf | ecdgbf ad bgcdef abgef',
'cadgfb bcgfae fedac efbca cagfb eb bae ecdgabf begc agbedf | gedafb acbdegf aeb eb',
'cdega efbg fbdegac ef daebcf badefg efagd efd fbgdca dbfga | fadecbg bgfe ef agdbf',
'fbedca fbcgaed dabcg fgdbce cgfadb gb bdafc afbg dgcae dbg | bdacgf adfbc bg gedca',
'befcg edb bgadfc dfaecb cdfegab egda agcdbe ed dcabg debgc | geda aegd gcdafb dcefab',
  ];
console.log(easyCount(dayInput));

/*
--- Part Two ---
Through a little deduction, you should now be able to determine the remaining digits. Consider again the first example above:

acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab |
cdfeb fcadb cdfeb cdbaf
After some careful analysis, the mapping between signal wires and segments only make sense in the following configuration:

 dddd
e    a
e    a
 ffff
g    b
g    b
 cccc
So, the unique signal patterns would correspond to the following digits:

acedgfb: 8
cdfbe: 5
gcdfa: 2
fbcad: 3
dab: 7
cefabd: 9
cdfgeb: 6
eafb: 4
cagedb: 0
ab: 1
*/
// @returns the remainder after subtraction or false if impossible
function subtract(minuend, subtrahend) {
  let minuendSet = new Set(minuend.split(''));
  for (const c of subtrahend.split('')) {
    if (!minuendSet.delete(c)) {
      return false; // tried to subtract non-existent segment
    }
  }
  return Array.from(minuendSet).sort().join('');
}
console.assert(subtract('fade', 'da') === 'ef');
console.assert(subtract('g', 'i') === false);

// @return object mapping known patterns to values (otherwise undefined)
function getPatternAllDigits(inputPatterns) {
  let result = {};
  let digitPatterns = {};
  let fives = []; // 2,3,5
  let sixes = []; // 0,6,9
  for (const pattern of inputPatterns) {
    switch (pattern.length) {
      case 2: result[pattern] = 1; digitPatterns[1] = pattern; break;
      case 3: result[pattern] = 7; break;
      case 4: result[pattern] = 4; break;
      case 5: fives.push(pattern); break;
      case 6: sixes.push(pattern); break;
      case 7: result[pattern] = 8; break;
      default: console.assert(false, 'unexpected pattern length for ', pattern);
    }
  }
  // out of the fives, only the 3 contains both segments from 1
  let threePattern = fives.find(p => subtract(p, digitPatterns[1]));
  console.assert(threePattern, 'unable to find threePattern containing ', digitPatterns[1], ' in fives: ', ...fives);
  result[threePattern] = 3; digitPatterns[3] = threePattern;
  
  // out of the sixes, only the 9 contains all the segments from 3 plus the upper-left segment
  let ninePattern = sixes.find(p => subtract(p, digitPatterns[3]));
  console.assert(ninePattern, 'unable to find ninePattern containing ', digitPatterns[3], ' in sixes: ', ...sixes);
  result[ninePattern] = 9; digitPatterns[9] = ninePattern;
  let upperLeft = subtract(ninePattern, digitPatterns[3]);
  
  // out of the fives, only the 5 contains the upper-left segment
  let fivePattern = fives.find(p => subtract(p, upperLeft));
  console.assert(fivePattern, 'unable to find fivePattern containing ', upperLeft, ' in fives: ', ...fives);
  result[fivePattern] = 5; digitPatterns[5] = fivePattern;
  
  // out of the fives, the 2 is neither 3 nor 5
  let twoPattern = fives.find(p => p !== threePattern && p !== fivePattern);
  console.assert(twoPattern, 'unable to find twoPattern that is neither: ', threePattern, ' nor ', fivePattern, ' in fives: ', ...fives);
  result[twoPattern] = 2; digitPatterns[2] = twoPattern;
  
  // out of the sixes, the 6 is not 9 and contains all the segments from 5
  let sixPattern = sixes.find(p => p !== ninePattern && subtract(p, fivePattern));
  console.assert(sixPattern, 'unable to find sixPattern that is not ', ninePattern, ' containing ', fivePattern, ' in sixes: ', ...sixes);
  result[sixPattern] = 6; digitPatterns[6] = sixPattern;
  
  // out of the sixes, the 0 is neither 6 nor 9
  let zeroPattern = sixes.find(p => p !== sixPattern && p !== ninePattern);
  console.assert(zeroPattern, 'unable to find zeroPattern that is neither: ', sixPattern, ' nor ', ninePattern, ' in sixes: ', ...sixes);
  result[zeroPattern] = 0; digitPatterns[0] = zeroPattern;
  
  return result;
}

const tinyPatternAllDigits = getPatternAllDigits(parseEntry(tinyInput)[0]);
for (const [k,v] of Object.entries({
  acedgfb: 8,
  cdfbe: 5,
  gcdfa: 2,
  fbcad: 3,
  dab: 7,
  cefabd: 9,
  cdfgeb: 6,
  eafb: 4,
  cagedb: 0,
  ab: 1,
})) {
  console.assert(tinyPatternAllDigits[normalize(k)] === v, 'unexpected digit for ', k, ' expected: ', v, ' actual: ', tinyPatternAllDigits[normalize(k)]);
}
/*
Then, the four digits of the output value can be decoded:

cdfeb: 5
fcadb: 3
cdfeb: 5
cdbaf: 3
Therefore, the output value for this entry is 5353.
*/
function decode(outputPatterns, patternDigits) {
  let result = 0;
  for (const pattern of outputPatterns) {
    let digit = patternDigits[normalize(pattern)];
    console.assert(digit !== undefined, 'unable to decode ', pattern);
    result = result * 10 + digit;
  }
  return result;
}
const tinyOutputDecoded = decode(parseEntry(tinyInput)[1], tinyPatternAllDigits);
console.assert(tinyOutputDecoded === 5353, 'incorrect decode. expected: 5353, actual: ', tinyOutputDecoded);
/*
Following this same process for each entry in the second, larger example above, the output value of each entry can be determined:

fdgacbe cefdb cefbgd gcbe: 8394
fcgedb cgb dgebacf gc: 9781
cg cg fdcagb cbg: 1197
efabcd cedba gadfec cb: 9361
gecf egdcabf bgf bfgea: 4873
gebdcfa ecba ca fadegcb: 8418
cefg dcbef fcge gbcadfe: 4548
ed bcgafe cdgba cbgef: 1625
gbdfcae bgc cg cgb: 8717
fgae cfgab fg bagce: 4315
Adding all of the output values in this larger example produces 61229.

For each entry, determine all of the wire/segment connections and decode the four-digit output values. What do you get if you add up all of the output values?
*/
function decodeEntry(line) {
  let [input, output] = parseEntry(line);
  return decode(output, getPatternAllDigits(input));
}
function sumOutputs(lines) {
  return lines.reduceRight((sum, line) => sum + decodeEntry(line), 0);
}
const testSum = sumOutputs(testInput);
console.assert(testSum === 61229, 'incorrect sum. expected: 61229, actual: ', testSum);
console.log(sumOutputs(dayInput));
