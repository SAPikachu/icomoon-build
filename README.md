icomoon-build
=============

Build IcoMoon project in Node.

Why this?
---------

We use IcoMoon with customized SCSS stylesheets in our project, it's annoying to copy new icon declarations from IcoMoon-generated stylesheet to our SCSS stylesheet every time I need to add new icons. So I created this package to make the process a little easier.

Installation
------------

Simply install using [npm](http://npmjs.org):

    npm install icomoon-build

Usage
-----

First, create a project on [IcoMoon](http://icomoon.io/app/), and save the project file locally (Menu -> Manage Projects -> Download).

Then run the script like this:

    node_modules/.bin/icomoon-build -p path/to/your/project.json --scss path/to/output.scss --fonts path/to/fonts/
    
    # Or if icomoon-build is installed globally:
    icomoon-build -p path/to/your/project.json --scss path/to/output.scss --fonts path/to/fonts/

As of version 0.1.0, LESS stylesheet can also be generated. Simply change `--scss` to `--less` to specify LESS output.
    
Note
----

SCSS/LESS output is supposed to be imported to another SCSS/LESS file, it only contains individual icon definitions. Here is an example of generated SCSS file:

    // Script-generated file, do not modify by hand
    
    $icon-export-content: "\e600";
    
    @mixin icon-classes {
        .icon-export:before { content: $icon-export-content; }
    }

You can use the file like this:

    @font-face {
        font-family: "icons";
        src: url("../fonts/icons.eot");
        src: url("../fonts/icons.eot?#iefix") format("embedded-opentype"),
        	 url("../fonts/icons.woff") format("woff"),
        	 url("../fonts/icons.ttf") format("truetype"),
        	 url("../fonts/icons.svg#icons") format("svg");
        font-weight: normal;
        font-style: normal;
    }
    
    .icon:before {
        display: inline-block;
        position: relative;
        font-family: "icons";
        font-style: normal;
        font-weight: normal;
        speak: none;
        text-decoration: inherit;
        line-height: 99%;
        text-align: center;
        vertical-align: baseline;
        
        // better font rendering
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    @import "path/to/generated.scss";
    
    @include icon-classes;

Change log
----------

### 0.2.8

* Missing one place in last change, oops.

### 0.2.7

* Support multiple class names. Thanks @Shoplifter for reporting this.

### 0.2.6

* 0.2.5 was actually broken by updated phantomjs, Fixed.

### 0.2.5

* Upgrade phantomjs to fix https://nodesecurity.io/advisories/130

### 0.2.4

* Fix for latest IcoMoon app

### 0.2.3

* Forgot to prepend library path when reading presets.json
* Fix `QUOTA_EXCEEDED_ERR`

### 0.2.2

* Fix script error on page.

### 0.2.1

* Works again for latest IcoMoon website. Fix #6

### 0.2.0

* Support item map output for SCSS (--scss-with-map option). Implement #5
* Add callback argument to lib/cli.js. (Idea stolen from @nanymor)

### 0.1.2

* IcoMoon no longer supports SSLv3, specify --ssl-protocol=any to let PhantomJS choose newer version. Fix #4

### 0.1.1

* Relax stdout buffer limit. Fix #3. (reported by @yairEO, thanks!)

### 0.1.0

* Support LESS output

### 0.0.3

* Disable disk cache as it breaks after server code is updated

### 0.0.2

* Fix freezing in some cases

### 0.0.1

* Initial release
