var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var config = {
    r_threshold: 0,
    g_threshold: 0,
    b_threshold: 0,
    diff_percentage: 0
};

var processor = {
    change_channel_threshold: function () {
        // get color config value
        config.r_threshold = document.getElementById("threshold_r").value;
        config.g_threshold = document.getElementById("threshold_g").value;
        config.b_threshold = document.getElementById("threshold_b").value;
        config.diff_percentage = document.getElementById("diff_percentage").value;


        this.log("R: " + config.r_threshold + " | G: " + config.g_threshold + " | B: " + config.b_threshold + " | % Diff: " + config.diff_percentage);
    },

    /*
     * Do the image processing for one frame
     * Reads frame data from rgb picture ctx1 and shows a diff in ctx2
     */
    computeFrame: function () {
        if (!this.video || this.video.paused || this.video.ended) {
            return;
        }

        // get the context of the canvas 1
        var tmpCanvas = document.getElementById("tmp_frame");
        var tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.width = this.video.width;
        tmpCtx.height = this.video.height;
        tmpCanvas.width = this.video.width;
        tmpCanvas.height = this.video.height;

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
            if (this.isCuttingScene(frame, this.previousFrame)) {
                this.log("Cut detected at position: " + this.video.currentTime);
            }
        }

        this.previousFrame = frame;

        return;
    },

    isCuttingScene: function (frame, previousFrame) {
        var diffFrame = previousFrame;
        var length = (frame.data.length) / 4;
        var numOfPixelsForCut = frame.height * frame.width * (config.diff_percentage / 100);
        var numOfPixelsAboveThreshold = 0;

        for (var i = 0; i < length; i++) {
            var frameR = frame.data[i * 4 + 0];
            var frameG = frame.data[i * 4 + 1];
            var frameB = frame.data[i * 4 + 2];

            var prevFrameR = previousFrame.data[i * 4 + 0];
            var prevFrameG = previousFrame.data[i * 4 + 1];
            var prevFrameB = previousFrame.data[i * 4 + 2];

            var diffR = Math.abs(frameR - prevFrameR);
            var diffG = Math.abs(frameG - prevFrameG);
            var diffB = Math.abs(frameB - prevFrameB);

            // Do not show pixel if any RGB value changed
            if ((diffR > config.r_threshold)
                && (diffG > config.g_threshold)
                && (diffB > config.b_threshold)) {
                numOfPixelsAboveThreshold++;
            }
        }

        if (numOfPixelsAboveThreshold > numOfPixelsForCut) {
            this.log("------------------------------------");
            this.log("Number of pixels above threshold: " + numOfPixelsAboveThreshold);


            document.getElementById('video').pause();

            return true;
        }

        return false;
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

            config.r_threshold = document.getElementById("threshold_r").value;
            config.g_threshold = document.getElementById("threshold_g").value;
            config.b_threshold = document.getElementById("threshold_b").value;
            config.diff_percentage = document.getElementById("diff_percentage").value;

            this.log("------------------------------------");
            this.log("Threshold R: " + config.r_threshold)
            this.log("Threshold G: " + config.g_threshold)
            this.log("Threshold B: " + config.b_threshold)
            this.log("Percent Pixel Difference: " + config.diff_percentage)
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