var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var config = {
    red_threshold: 0,
    green_threshold: 0,
    blue_threshold: 0,
    diff_percentage: 0
};

var processor = {
    change_channel_threshold: function () {
        //  color config value
        config.red_threshold = document.getElementById("threshold_r").value;
        config.green_threshold = document.getElementById("threshold_g").value;
        config.blue_threshold = document.getElementById("threshold_b").value;
        config.diff_percentage = document.getElementById("diff_percentage").value;


        this.log("RED: " + config.red_threshold +
            " | GREEN: " + config.green_threshold +
            " | BLUE: " + config.blue_threshold +
            " | % Diff: " + config.diff_percentage);
    },

  
    computeFrame: function () {
        if (!this.video || this.video.paused || this.video.ended) {
            return;
        }

        // content of canvs 1
        var tmpCanvas = document.getElementById("tmp_frame");
        var tmpCtx = tmpCanvas.getContext("2d");
        tmpCtx.width = this.video.width;
        tmpCtx.height = this.video.height;
        tmpCanvas.width = this.video.width;
        tmpCanvas.height = this.video.height;

        // draw current video frame 
        tmpCtx.drawImage(this.video, 0, 0, this.video.width, this.video.height);

       
        var frame = {};
        try {
            frame = tmpCtx.getImageData(0, 0, this.video.width, this.video.height);
        } catch (e) {
			
         // error handling
            this.browserError(e);
        }

        if (this.prevFrame) {
            if (this.isCuttingScene(frame, this.prevFrame)) {
                this.log("Cut at position: " + this.video.currentTime);
            }
        }

       this.prevFrame = frame;
    },

    isCuttingScene: function (frame, prevFrame) {
        var dFrame = prevFrame;
        var length = (frame.data.length) / 4;
        var numOfPixelsForCut = frame.height * frame.width * (config.diff_percentage / 100);
        var numOfPixelsAboveThreshold = 0;

        for (var i = 0; i < length; i++) {
            var Rframe = frame.data[i * 4];
            var Gframe = frame.data[i * 4 + 1];
            var BFrame = frame.data[i * 4 + 2];

            var prevRframe = prevFrame.data[i * 4];
            var prevGframe = prevFrame.data[i * 4 + 1];
            var prevBFrame = prevFrame.data[i * 4 + 2];

            var diffR = Math.abs(Rframe - prevRframe);
            var diffG = Math.abs(Gframe - prevGframe);
            var diffB = Math.abs(BFrame - prevBFrame);

            // check threshold
            if ((diffR > config.red_threshold)
                && (diffG > config.green_threshold)
                && (diffB > config.blue_threshold)) {
                numOfPixelsAboveThreshold++;
            }
        }

        if (numOfPixelsAboveThreshold > numOfPixelsForCut) {
            this.log("                  ");
            this.log("Number of pixels above threshold: " + numOfPixelsAboveThreshold);

            return true;
        }

        return false;
    },

    timerCallback: function () {
        if (this.error) {
            alert("Error happened - processor stopped.");
            return;
        }

        
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

            config.red_threshold = document.getElementById("threshold_r").value;
            config.green_threshold = document.getElementById("threshold_g").value;
            config.blue_threshold = document.getElementById("threshold_b").value;
            config.diff_percentage = document.getElementById("diff_percentage").value;

            this.log(" ");
            this.log("Threshold RED: " + config.red_threshold)
            this.log("Threshold GREEN: " + config.green_threshold)
            this.log("Threshold BLUE: " + config.blue_threshold)
            this.log("Difference between Pixel (%): " + config.diff_percentage)
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

    // check browser
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

        this.browserChecked = true;
        return true;
    },

	
	
    browserChecked: false,
    videoWidth: 0,
    videoHeight: 0,
    timeoutMilliseconds: 40, 
    error: 0
};