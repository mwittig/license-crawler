# License Crawler & List Generator

This license crawler crawls your packages, searches for their licenses and generates
a HTML file.

## Installation

Just clone the project and cd into the cloned folder. Type `npm start` to start the program. It will run with the default settings. To set parameters use the options below:

## Options

* `--input [ --i ]`: path to the directory the license search should start from. 
    If not specified, the program will start to crawl it's own dependencies. You have to type `npm install` (If you haven't done that yet) in your project first to install all dependencies. Otherwise this program will not be able to find any licenses.

* `--htmlfile [ --h ]`: file name to which the generated HTML code should be written.

* `--showpackagepath [ --spp ]`: enable or disable the path to each license.

### Example

    npm start -- --input="C:/Users/%USERNAME%/usn-app" --htmlfile="licenses.html" --showpackagepath false