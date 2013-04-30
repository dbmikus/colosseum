///////////////////////////////////////////////////////////////
// Building static source directory using Mustache templates //
///////////////////////////////////////////////////////////////

// The mustache view file.
// This is used to get key-value pairs that match variables in the template
// files to what those variables should be replaced with.
var vw = require('./mustacheView.js');

var fs = require('fs');
var path = require('path');
var util = require('util');
var mustache = require('mustache');
var ncp = require('ncp').ncp;
var wrench = require('wrench');
var walk = require('walk');

// Limits how far we can go recursively
ncp.limit = 16;

// Recursively creates renders of all templates in templateDir within the
// buildDir.
// This will not destroy the template directory.
function renderTemplates(templateDir, buildDir) {
    // Check if build directory exists. If so, remove it to prevent issues with
    // copying
    if (path.existsSync(buildDir)) {
        wrench.rmdirSyncRecursive(buildDir, function (err) {
            console.log("Error recursively deleting dir " + buildDir);
        });
    }

    // We must first copy all of the template files to build directory
    ncp(templateDir, buildDir, function (err) {
        if (err) {
            return console.error(err);
        } else {
            // Now we must recurse through the whole build directory
            var walker = walk.walk(buildDir, { followLinks: false });

            // If a file and not a directory
            walker.on('file', function(root, stat, next) {
                var filename = root + '/' + stat.name;
                fs.readFile(filename, function (err, data) {
                    // I think this will catch any issues with binary files
                    if (err) {
                        next();
                    } else {
                        // Render the file using our view
                        renderFile(vw.view, data, filename);
                        // reads the next file
                        next();
                    }
                });
            });
        }
    });

    console.log("Done rendering templates from "
                + templateDir + " to " + buildDir);
}

// Renders and individual file and overwrites it with the results
function renderFile(view, fileData, fileName) {
    var render_filetypes = ['html', 'css', 'js'];

    if (render_filetypes.indexOf(getExtension(fileName)) >= 0) {
        var data = fileData.toString();
        var output = mustache.render(data, view);

        fs.writeFileSync(fileName, output);
    }
}

function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

module.exports.renderTemplates = renderTemplates;
module.exports.getExtension = getExtension;
