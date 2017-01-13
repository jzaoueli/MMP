var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var processor = {

    /*
     * Do the image processing for one frame
     * Reads frame data from rgb picture ctx1 and shows a diff in ctx2
     */
    computeFrame: function () {
        if (!this.video || this.video.paused || this.video.ended) {
            return;
        }

        // get the context of the canvas 1
        var tmpCtx = this.ctx1;

        // draw current video frame to ctx
        tmpCtx.drawImage(this.video, 0, 0, this.video.width, this.video.height);

        // get frame RGB data bytes from context ctx
        var frame = {};
        try {
            frame = tmpCtx.getImageData(0, 0, this.video.width, this.video.height);
        } catch (e) {
            // catch and display error of getImageData fails
            this.browserError(e);
        }

        if (this.previousFrame) {
            this.ctx1.putImageData(this.previousFrame, 0, 0);
            this.showDiffBetweenFrames(frame, this.previousFrame);
        }

        this.previousFrame = frame;
    },

    showDiffBetweenFrames: function (frame, previousFrame) {
        var diffFrame = previousFrame;
        var length = (frame.data.length) / 4;

        for (var i = 0; i < length; i++) {
            var frameR = frame.data[i * 4];
            var frameG = frame.data[i * 4 + 1];
            var frameB = frame.data[i * 4 + 2];

            var prevFrameR = previousFrame.data[i * 4];
            var prevFrameG = previousFrame.data[i * 4 + 1];
            var prevFrameB = previousFrame.data[i * 4 + 2];

            var diffR = (frameR - prevFrameR + 255) / 2;
            var diffG = (frameG - prevFrameG + 255) / 2;
            var diffB = (frameB - prevFrameB + 255) / 2;

            diffFrame.data[i * 4] = diffR;
            diffFrame.data[i * 4 + 1] = diffG;
            diffFrame.data[i * 4 + 2] = diffB;

        }

        this.ctx2.putImageData(diffFrame, 0, 0);
    },

    timerCallback: function () {
        if (this.error) {
            alert("Error happened - processor stopped.");
            return;
        }

        // call the computeFrame function to do the image processing
        this.computeFrame();

        // call this function again after a certain time
        var self = this;
        setTimeout(function () {
            self.timerCallback();
        }, this.timeoutMilliseconds);
    },


    // doLoad: needs to be called on load
    doLoad: function () {
        this.error = 0;

        // check for a compatible browser
        if (!this.browserChecked) {
            this.browserCheck();
        }

        try {
            // get the html <video> and <canvas> elements
            this.video = document.getElementById("video");

            if (!this.video) {
                alert("No Video Object Found?");
            }

            this.log("Found video: size " + this.video.videoWidth + "x" + this.video.videoHeight);

            // scaling factor for resulting video & canvas
            var factor = 2;
            var w = this.video.videoWidth / factor;
            var h = this.video.videoHeight / factor;

            // scale the video display
            this.video.width = w;
            this.video.height = h;

            this.log("Resized video frame to " + this.video.width + "x" + this.video.height);

            // Setup canvas to receive video content
            this.c1 = document.getElementById("previous_frame");
            this.c2 = document.getElementById("canvas_pixel_diff");
            // get the 2d drawing context of the canvas
            this.ctx1 = this.c1.getContext("2d");
            this.ctx2 = this.c2.getContext("2d");

            this.ctx1.width = w;
            this.ctx1.height = h;
            this.c1.width = w;
            this.c1.height = h;

            this.ctx2.width = w;
            this.ctx2.height = h;
            this.c2.width = w;
            this.c2.height = h;
        } catch (e) {
            // catch and display error
            alert("Error: " + e);
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
    videoWidth: 0,
    videoHeight: 0,
    timeoutMilliseconds: 40, // (40 ms = 1/25 s)
    error: 0
};