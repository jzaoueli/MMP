//HTML5 Example: Chroma Key Filter 
//(c) 2011-13 
// J�rgen Lohr, lohr@beuth-hochschule.de
// Oliver Lietz, lietz@nanocosmos.de
//v1.4, May.2013

var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var processor = {

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


        // do the color key:
        // do the image processing
        // read in pixel data to r,g,b, key, write back
        for (var i = 0; i < length; i++) {
            var r = frame.data[i * 4 + 0];
            var g = frame.data[i * 4 + 1];
            var b = frame.data[i * 4 + 2];

			// do the chroma key:

            // veränderung der grenzwerte für rgb um nur blau durchzulassen. Rot und grün sind nur in geringen anteilen vorhanden,
            //Blau in höheren.
            if (g < 95 && r < 95 && b > 105) {
				// set "alpha" value to (0)
                frame.data[i * 4 + 3] = 0;
            }
        }
        // write back to 3 canvas objects
        this.ctx1.putImageData(frame, 0, 0);
        this.ctx2.putImageData(frame, 0, 0);
        this.ctx3.putImageData(frame, 0, 0);
        return;
    },

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

        // check for a compatible browser
        if (!this.browserChecked)
            this.browserCheck();

        try {

            // get the html <video> and <canvas> elements 
            this.video = document.getElementById("video");

            this.c1 = document.getElementById("c1");
            // get the 2d drawing context of the canvas
            this.ctx1 = this.c1.getContext("2d");
            this.c2 = document.getElementById("c2");
            this.ctx2 = this.c2.getContext("2d");
            this.c3 = document.getElementById("c3");
            this.ctx3 = this.c3.getContext("2d");

            // show video width and height to log
            this.log("Found video: size " + this.video.videoWidth + "x" + this.video.videoHeight);

            // scale the video display 
            this.video.width = this.video.videoWidth / 2;
            this.video.height = this.video.videoWidth / 2;

            // scaling factor for resulting canvas
            var factor = 2;
            w = this.video.videoWidth / factor;
            h = this.video.videoHeight / factor;

            if (!w || !this.video) {
                alert("No Video Object Found?");
            }
            this.ctx1.width = w;
            this.ctx1.height = h;
            this.c1.width = w + 1;
            this.c1.height = h;
            this.c2.width = w;
            this.c2.height = h;
            this.c3.width = w;
            this.c3.height = h;
            this.width = w;
            this.height = h;

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
