var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var processor = {

    /*
     * Do the image processing for one frame
     * Reads frame data from rgb picture ctx1 and shows a diff in ctx2
     */

    videoWidth: 0,
    videoHeight: 0,
    timeoutMilliseconds: 40,
    error: 0,


    getFrame: function () {
        if (!this.video || this.video.paused || this.video.ended) {
            return;
        }

        // kanvascontext
        var tmpCtx = this.ctx1;
        // frame zu kontext
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
            this.GetFrameDifference(frame, this.previousFrame);
        }

        this.previousFrame = frame;
    },

    //funktion für die differenz und die darstellung der differenzwerte
    GetFrameDifference: function (frame, prevFrame) {
        var diffFrame = prevFrame;
        var length = (frame.data.length) / 4;

        //mal 4 um den jeweiligen farbwert zu treffen
        for (var i = 0; i < length; i++) {
            var r = frame.data[i * 4];
            var g = frame.data[i * 4 + 1];
            var b = frame.data[i * 4 + 2];

            var prevFrameR = prevFrame.data[i * 4];
            var prevFrameG = prevFrame.data[i * 4 + 1];
            var prevFrameB = prevFrame.data[i * 4 + 2];

            var differenceR = (r - prevFrameR + 255) / 2;
            var differenceG = (g - prevFrameG + 255) / 2;
            var differenceB = (b - prevFrameB + 255) / 2;


            diffFrame.data[i * 4] = differenceR;
            diffFrame.data[i * 4 + 1] = differenceG;
            diffFrame.data[i * 4 + 2] = differenceB;

        }

        this.ctx2.putImageData(diffFrame, 0, 0);
    },

    timerCallback: function () {
        if (this.error) {
            alert("Error happened - processor stopped.");
            return;
        }

        // call the getFrame function to do the image processing
        this.getFrame();

        // call this function again after a certain time
        var self = this;
        setTimeout(function () {
            self.timerCallback();
        }, this.timeoutMilliseconds);
    },


    // DoCanvases: needs to be called on load
    DoCanvases: function () {
        this.error = 0;

        try {
           this.video = document.getElementById("video");

            if (!this.video) {
                alert("No Video Object Found?");
            }


            var vidWidth = this.video.videoWidth;
            var vidHeight = this.video.videoHeight;

            // scale the video display
            this.video.width = vidWidth;
            this.video.height = vidHeight;


            // Setup canvas to receive video content
            this.elem1 = document.getElementById("previous_frame");
            this.elemdiff = document.getElementById("difference_window");
            // get the 2d drawing context of the canvas
            this.ctx1 = this.elem1.getContext("2d");
            this.ctx2 = this.elemdiff.getContext("2d");


            this.elem1.width = vidWidth;
            this.elem1.height = vidHeight;
            this.elemdiff.width = vidWidth;
            this.elemdiff.height = vidHeight;
        } catch (e) {
            alert("Error: " + e);
            return;
        }

        // start the timer callback to draw frames
        this.timerCallback();
    },

    isCanvasSupported: function () {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    },


    log: function (text) {
        var logArea = document.getElementById("log");
        if (logArea) {
            logArea.innerHTML += text + "<br>";
        }

        if (typeof console != "undefined") {
            console.log(text);
        }
    }


};