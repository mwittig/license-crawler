// Import license-crawler
var crawler = require('license-crawler');
var fs = require('fs');
var minimist = require('minimist');

// argument options
var args = minimist(process.argv.slice(2), {
  string: [ 'input', 'htmlfile' ],     
  boolean: [ 'showpackagepath' ],
  '--': true,
  default: { input: './', htmlfile: 'licenses.html', 'showpackagepath': false },
  alias: { i: 'input', h: 'htmlfile', spp: 'showpackagepath' },
  unknown: function() {
    console.log('\nInvalid argument passed. Running with defaults...\n');
  }
});

// setting options
var options = {
  input: args.input,                      // input folder which contains package.json
  out: './result/reportLicenses.json',    // output file
  production: true,                       // if true don't check devDependencies
  statistics: false,                       // generate statistics
  exclude: [],
  sorted: 'license',                      // 'license' or 'package'
  format: 'json',                         // 'json' or 'txt'
  htmlFile: './result/' + args.htmlfile,  // output HTML file
  showPackagePath: args.showpackagepath,  // 
};

// Setup

if(!fs.existsSync('result')) fs.mkdirSync('result');

var createStream = fs.createWriteStream(options.out);
createStream.end();

fs.appendFileSync(options.out, '{}', function(err) {
  if(err) return console.log(err);
});
//

console.log('\n--------');
console.log('Input path: ' + options.input);
console.log('Output (JSON): ' + options.out);
console.log('Output (HTML): ' + options.htmlFile);
console.log('Show package path: ' + (options.showPackagePath ? 'Yes' : 'No'));
console.log('--------\n');
console.log('Reading input files...\n');

// Start crawling
crawler.crawlLicenses(options);

// Execute generation
create();

// Parse the output file and write it to a html file
function create() {

  const SPLITREGEX = '##SPLIT##';

  function writeFile(file, msg) {
    fs.appendFileSync(file, msg, function(err) {
      if(err) return console.log(err);
    }); 
  }

  function compareVersions(a, b) {
    var i, diff;
    var regExStrip0 = /(\.0+)+$/;
    var segmentsA = a.replace(regExStrip0, '').split('.');
    var segmentsB = b.replace(regExStrip0, '').split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff)
            return diff;
    }
    return segmentsA.length - segmentsB.length;
  }

  function countArray(searchname) {
    var count = [];
    for(var i = 0; i < map.length; i++) {
      if(map[i].split(SPLITREGEX)[0] == searchname) {
        count.push(map[i]);
      }
    }
    return count;
  }

  function isValid(version) {
    console.log(version);

    if (version.match(/[a-zA-Z||]/)) {
      return false;
    }
    return true;
  }

  function getVersionsFromMap(map) {
    var versions = [];
    for(var i = 0; i < map.length; i++) {
      var version = map[i].split(SPLITREGEX)[1];
      versions.push(version);
    }
    return versions;
  }

  function processVersions() {
    console.log('Processing versions...');
    for(var i = 0; i < map.length; i++) {
      var sContent = map[i].split(SPLITREGEX);
      var name = sContent[0];
      var version = sContent[1];

      if(isValid(version)) {
        var items = countArray(name);
        if(items.length > 1) {
          var versions = getVersionsFromMap(items);
          var highestVer = versions.sort(compareVersions)[versions.length - 1];

          for(var k = 0; k < items.length; k++) {
            if(items[k].split(SPLITREGEX)[1] == highestVer) {
              var index = items.indexOf(items[k]);
              if (index > -1) items.splice(index, 1);
            }
          }

          for(var j = 0; j < items.length; j++) {
            var index = map.indexOf(items[j]);
            if (index > -1) {
              map.splice(index, 1);
            }
          }
        }
      }
    }
  }

  function writeLicenses() {
    console.log('Writing to ' + options.htmlFile + '...');
    for(var i = 0; i < map.length; i++) {
      var sItem = map[i].split(SPLITREGEX);
      var name = sItem[0];
      var version = sItem[1];
      var path = sItem[2];
      writeFile(options.htmlFile, '<br><br>&emsp; Name: ' + name + '<br>&emsp; Version: ' + version + (options.showPackagePath ? '<br>&emsp; Path: ' + path + '<br>' : ''));
    }
    console.log('');
  }

  var map = [];

  if(fs.existsSync(options.htmlFile)) fs.unlinkSync(options.htmlFile);

  var jobj = JSON.parse(fs.readFileSync(options.out, 'utf8'));
  writeFile(options.htmlFile, '<html><head><meta charset="UTF-8"></head><body><h1>Licenses</h1>');

  for(var type in jobj) {
    console.log('Current license: ' + type);

    writeFile(options.htmlFile, '<b>' + type + '</b><a>');

    for(var pkg in jobj[type]['packages']) {
      var info = jobj[type]['packages'][pkg]['name'].split('@');
      var name = (jobj[type]['packages'][pkg]['name'].startsWith('@') ? '@' + info[1] : info[0]);
      var version = info[info.length - 1];
      var path = jobj[type]['packages'][pkg]['path'];

      map.push(name + SPLITREGEX + version + (options.showPackagePath ? SPLITREGEX + path : ''));
    }
    processVersions();
    writeLicenses();
    writeFile(options.htmlFile, '<br><br>' + '</a>');
    map = [];
    sleep(200);
  }

  writeFile(options.htmlFile, '</body></html>');

  console.log('Done.');
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}