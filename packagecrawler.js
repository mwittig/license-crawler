Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');

function crawlPackages(inputfolder, map, splitregex) {
    const pkgjs = 'package.json';
    var parent = inputfolder + '/node_modules/';
    var infos = [];

    if(!fs.existsSync(parent))
        console.error('No node_modules folder found.');
    else {

        for(var i = 0; i < map.length; i++) {

            var child = map[i].split(splitregex)[0];
            var currentPath;

            if(fs.existsSync(parent + child)) {
                currentPath = parent + child;

                if(fs.existsSync(currentPath + '/' + pkgjs)) {
                    currentPath = parent + child + '/' + pkgjs;

                    var json = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
                    var desc = json['description'];
                        desc = (desc !== undefined && desc !== "" ? desc : 'Not found.');
                    var homepg = json['homepage'];
                        homepg = (homepg !== undefined && homepg !== "" ? homepg : 'Not found.');
                    var repoURL = json['repository'];
                        repoURL = (repoURL !== undefined && repoURL !== "" ? repoURL : 'Not found.');

                        infos[i] = { name: child, description: desc, homepage: homepg, repo: repoURL };
                }
                else {
                    console.warn('Couldn\'t find ' + pkgjs + ' for ' + child);
                    infos[i] = { name: child, description: -1, homepage: -1, repo: -1 };
                }
            }
            else {
                console.warn('Couldn\'t find folder for ' + child);
                infos[i] = { name: child, description: -1, homepage: -1, repo: -1 };
            }
        }
    }
    return infos;
}
exports.crawlPackages = crawlPackages;