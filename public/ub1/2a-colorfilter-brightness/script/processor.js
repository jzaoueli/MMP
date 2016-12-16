//HTML5 Example: Color Filter 
//(c) 2011-13 
// J�rgen Lohr, lohr@beuth-hochschule.de
// Oliver Lietz, lietz@nanocosmos.de
//v1.4, May.2013

var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

//Diese werte werden verändert wenn sich die entsprechende checkbox verändert (könnte man auch in var config machen, aber
//bei den bools hat es nicht funktioniert. Daher habe ich sie ausserhalb von config festgelegt.
var isGreaScale = false;
var isSepia = false;


var config = {
    color_offset: 0,
    color_offset_R: 0,
    color_offset_G: 0,
    color_offset_B: 0,
    //IsGreyScale: false

};

var processor = {

    // "brightness" effect: change_color_offset: handled by html <input id="color_offset" ...
    change_color_offset: function () {
        // get color config value
        config.color_offset = document.getElementById("color_offset").value;
        this.log("color offset = " + config.color_offset);
    },

    // "brightness" effect: change_color_offset: handled by html <input id="color_offset" ...
    change_color_R: function () {
        config.color_offset_R = document.getElementById("color_offset_R").value;
        this.log("R Offset = " + config.color_offset_R);
    },
    change_color_G: function () {
        config.color_offset_G = document.getElementById("color_offset_G").value;
        this.log("B Offset = " + config.color_offset_G);
    },
    change_color_B: function () {
        config.color_offset_B = document.getElementById("color_offset_B").value;
        this.log("G Offset = " + config.color_offset_B);
    },
    switch_greyscale: function () {
        isGreaScale = document.getElementById("greyscale_Y").checked;
        this.log("Grauwert = " + isGreaScale);
    },

    switch_sepia: function () {
        isSepia = document.getElementById("sepia").checked;
        this.log("Sepiafilter = " + isSepia);
    },

    // computeFrame
    // do the image processing for one frame
    // reads frame data from rgb picture ctx
    // writes chroma key pictures to ctx1..3
    computeFrame: function () {

        // get the context of the canvas 1
        var ctx = this.ctx1;

        // draw current video frame to ctx
        ctx.drawImage(this.video, 0, 0, this.width - 1, this.height);

        // get frame RGB data bytes from context ctx
        var frame = {};
        var length = 0;
        try {
            frame = ctx.getImageData(0, 0, this.width, this.height);
            length = (frame.data.length) / 4;
        } catch (e) {
            // catch and display error of getImageData fails
            this.browserError(e);
        }


        // color offset for "brightness" effect
        offset = parseInt(config.color_offset);
        offsetR = parseInt(config.color_offset_R);
        offsetG = parseInt(config.color_offset_G);
        offsetB = parseInt(config.color_offset_B);


        //IsGreyScale = isGreaScale1;


        //offset = 100;
        //console.log("Using offset " + config.color_offset);

        // do the image processing
        // read in pixel data to r,g,b, key, write back
        for (var i = 0; i < length; i++) {
            var r = frame.data[i * 4 + 0];
            var g = frame.data[i * 4 + 1];
            var b = frame.data[i * 4 + 2];

            //Grauton (y) des pixels wird aus den einzelnen farben bestimmt
            var y = r * 0.30 + g * 0.59 + b * 0.11;

            //fuer den Grauwet. wenn rgb den gleichen wert haben ist es ein Grauton
            if (isGreaScale == true) {
                r = y;
                g = y;
                b = y;
            }

            //Abfrage für den Sepia filter.
            if (isSepia == true) {
                r = r * 0.39 + g * 0.77 + b * 0.19;
                g = r * 0.35 + g * 0.69 + b * 0.17;
                b = r * 0.27 + g * 0.53 + b * 0.13;
            }

            // do the filter processing
            // "brightness": add color offset
            r = r + offset + offsetR;
            g = g + offset + offsetG;
            b = b + offset + offsetB;

            frame.data[i * 4 + 0] = r;
            frame.data[i * 4 + 1] = g;
            frame.data[i * 4 + 2] = b;

        }
        // write frame back to context of canvas object
        this.ctx1.putImageData(frame, 0, 0);
        return;
    },

    getTimestamp: function () {
        return new Date().getTime();
    },

    // timerCallback function - is called every couple of milliseconds to do the calculation
    timerCallback: function () {
        if (this.error) {
            alert("Error happened - processor stopped.");
            return;
        }

        // call the computeFrame function to do the image processing
        this.computeFrame();

        // call this function again after a certain time
        // (40 ms = 1/25 s)
        var timeoutMilliseconds = 40;
        var self = this;
        setTimeout(function () {
            self.timerCallback();
        }, timeoutMilliseconds);
    },

    // doLoad: needs to be called on load
    doLoad: function () {

        this.error = 0;

        // init high precision timer if available
        if (window.performance.now) {
            console.log("Using high performance timer");
            getTimestamp = function () {
                return window.performance.now();
            };
        } else {
            if (window.performance.webkitNow) {
                console.log("Using webkit high performance timer");
                getTimestamp = function () {
                    return window.performance.webkitNow();
                };
            }
        }

        // check for a compatible browser
        if (!this.browserChecked)
            this.browserCheck();

        try {

            // get the html <video> and <canvas> elements
            this.video = document.getElementById("video");
            this.c1 = document.getElementById("c1");
            // get the 2d drawing context of the canvas
            this.ctx1 = this.c1.getContext("2d");

            // show video width and height to log
            this.log("Found video: size " + this.video.videoWidth + "x" + this.video.videoHeight);

            // scale the video display
            this.video.width = this.video.videoWidth / 2;
            this.video.height = this.video.videoWidth / 2;

            // scaling factor for resulting canvas
            var factor = 1;

            // set width and height of canvas object
            this.width = this.video.width / factor;
            this.height = this.video.height / factor;

            this.ctx1.width = this.width;
            this.ctx1.height = this.height;
            this.c1.width = this.width + 1;
            this.c1.height = this.height;

        } catch (e) {
            // catch and display error
            alert("Erro: " + e);
            return;
        }

        // start the timer callback to draw frames
        this.timerCallback();

    },

    // helper function: isCanvasSupported()
    // check if HTML5 canvas is available
    isCanvasSupported: function () {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    },

    // log(text)
    // display text in log area or console
    log: function (text) {
        var logArea = document.getElementById("log");
        if (logArea) {
            logArea.innerHTML += text + "<br>";
        }
        if (typeof console != "undefined") {
            console.log(text);
        }
    },

    // helper function: browserError()
    // displays an error message for incorrect browser settings
    browserError: function (e) {

        this.error = 1;

        //chrome security for local file operations
        if (isChrome)
            alert("Security Error\r\n - Call chrome with --allow-file-access-from-files\r\n\r\n" + e);
        else if (isFirefox)
            alert("Security Error\r\n - Open Firefox config (about: config) and set the value\r\nsecurity.fileuri.strict_origin_policy = false ");
        else
            alert("Error in getImageData " + e);
    },

    //helper function to check for browser compatibility
    browserCheck: function () {
        if (!this.isCanvasSupported()) {
            alert("No HTML5 canvas - use a newer browser please.");
            return false;
        }
        // check for local file access
        //if(location.host.length>1)
        //    return;           
        this.browserChecked = true;
        return true;
    },
    browserChecked: false,
    error: 0
};
