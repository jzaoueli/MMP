var isFirefox = /Firefox/.test(navigator.userAgent);
var isChrome = /Chrome/.test(navigator.userAgent);

var selectionFilter;

var processor = {

    selection: function (id) {
        selectionFilter = id;
        this.descriptionTxt(id);
    },

    //Dokumentiere die Implementierung und Ergebnisse.
    //Wie unterscheiden sich die Filter voneinander und wofür werden sie verwendet?
    //Welchen Einfluss hat die Größe der Filtermaske?
    descriptionTxt: function (id) {
        switch (id) {
            case 'blur':
                //TODO: adjust text
                //this.information("Der Mittelwertfilter gehört zu den Tiefpassfiltern und hat die Aufgabe das Bild zu glätten.<BR>Somit können Pixelfehler bzw. Rauschen eleminiert werden aber die Kanten werden verwaschen/unscharf. Je größer die Matrix desto unschärfer wird das Bild.");
                break;
            case 'gauss':
                //TODO: adjust text
                //this.information("Auch der Gaussfilter gehört zu den Tiefpassfiltern. Gaußfilter gewichtet nach zweidimensionaler Gaußverteilung und somit ist der Unterschied zum Mittelwertfilter kaum zu erkennen mit dem Auge. Auch hier ist die Hautpaufgabe des Tiefpassfilters, Rauschen zu eleminieren mit dem Effekt,dass das Bild unschärfert wird. Je größer die Matrix desto unschärfer wird das Bild.");
                break;
            case 'prewitt':
                //TODO: adjust text
                //this.information("Der Prewittfilter wird für die Kantendedektion benutzt. Grauwerte in der aktuellen Bildzeile bzw. -spalte nicht zusätzlich gewichte (0) anders als bei den anderen Filtern werden hier Kantenänderungen in horizontaler und vertikaler Richtung betrachtet. Bei größerem Filter werden die kleinere Kanten(details) miteinbezogen und ausgewertet.");
                break;
            default:
                break;
        }

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

            // get the 2d drawing context of the canvas
            this.canvas = document.getElementById("canvas");
            this.ctxCanvas = this.canvas.getContext("2d");

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
            this.canvas.width = w;
            this.canvas.height = h;

            this.width = w;
            this.height = h;

        } catch (e) {
            alert("Erro: " + e);
            return;
        }

        // start the timer callback to draw frames
        this.timerCallback();

    },

    // timerCallback function
    timerCallback: function () {
        if (this.error) {
            alert("Error happened - processor stopped.");
            return;
        }

        // call the computeFrame function to do the image processing
        this.computeFrame();

        // call this function again after a certain time
        // (40 ms = 1/25 s)
        var timeoutMilliseconds = 50;
        var self = this;
        setTimeout(function () {
            self.timerCallback();
        }, timeoutMilliseconds);
    },

    computeFrame: function () {

        //get the context of the canvas 1
        var ctx = this.ctxCanvas;

        //draw current video frame to ctx
        ctx.drawImage(this.video, 0, 0, this.width - 1, this.height);

        //Source Pixels
        var pixels = {};
        pixels = ctx.getImageData(0, 0, this.width, this.height);

        //width and height for the matrix
        var Width = this.width;
        var Height = this.height;

        //do the selected filter
        var pixelData = {};

        switch (selectionFilter) {
            case 'blur':
                this.blur(ctx, pixels, Width, Height);
                break;
            case "gauss":
                this.gauss(ctx, pixels, Width, Height);
                break;
            case 'prewitt':
                this.prewitt(ctx, pixels, Width, Height);
                break;
            default:
                break;
        }
    },

    blur: function (ctx, pixels, Width, Height) {

        var weights = [
            1 / 25, 1 / 25, 1 / 15, 1 / 25, 1 / 25,
            1 / 25, 1 / 25, 1 / 15, 1 / 25, 1 / 25,
            1 / 25, 1 / 25, 1 / 15, 1 / 25, 1 / 25,
            1 / 25, 1 / 25, 1 / 15, 1 / 25, 1 / 25,
            1 / 25, 1 / 25, 1 / 15, 1 / 25, 1 / 25];

        pixelData = this.convolute(pixels, weights);

        //zwischenspeicher
        var idData = ctx.createImageData(Width, Height);

        //zwischenspeicher mit erhaltenen Daten füllen
        for (var i = 0; i < idData.data.length; i += 4) {
            var r = pixelData.data[i];
            var g = pixelData.data[i + 1];
            var b = pixelData.data[i + 2];

            idData.data[i] = r;
            idData.data[i + 1] = g;
            idData.data[i + 2] = b;
            idData.data[i + 3] = 255;
        }

        this.ctxCanvas.putImageData(idData, 0, 0);
    },

    gauss: function (ctx, pixels, Width, Height) {

        var weights = [
            1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273,
            4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273,
            7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273,
            4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273,
            1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273];

        pixelData = this.convolute(pixels, weights);

        var idData = ctx.createImageData(Width, Height);

        for (var i = 0; i < idData.data.length; i += 4) {
            var r = pixelData.data[i];
            var g = pixelData.data[i + 1];
            var b = pixelData.data[i + 2];

            idData.data[i] = r;
            idData.data[i + 1] = g;
            idData.data[i + 2] = b;
            idData.data[i + 3] = 255;
        }
        this.ctxCanvas.putImageData(idData, 0, 0);
    },

    prewitt: function (ctx, pixels, Width, Height) {


        var vertical = this.convolute(pixels,
            [-2, -1, 0, 1, 2,
                -2, -1, 0, 1, 2,
                -2, -1, 0, 1, 2,
                -2, -1, 0, 1, 2,
                -2, -1, 0, 1, 2]);

        var horizontal = this.convolute(pixels,
            [-2, -2, -2, -2, -2,
                -1, -1, -1, -1, -1,
                0, 0, 0, 0, 0,
                1, 1, 1, 1, 1,
                2, 2, 2, 2, 2]);

        var idData = ctx.createImageData(Width, Height);

        for (var i = 0; i < idData.data.length; i += 4) {
            var valueVertical = vertical.data[i] * vertical.data[i];
            var valueHorizontal = horizontal.data[i] * horizontal.data[i];
            var rgb = Math.sqrt(valueVertical + valueHorizontal);

            idData.data[i] = rgb;
            idData.data[i + 1] = rgb;
            idData.data[i + 2] = rgb;
            idData.data[i + 3] = 255;

        }

        this.ctxCanvas.putImageData(idData, 0, 0);
    },

    convolute: function (pixels, weights, opaque) {

        //Weights can be any size 3x3 or 5x5 because we check it on runtime
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);

        //"s" for source
        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;

        var w = sw;
        var h = sh;

        //temporary pixelData as floated array
        var pixelData = {
            width: w,
            height: h,
            data: new Float32Array(w * h * 4)
        };
        var dst = pixelData.data;

        //no need for this if we set alphaFac in the filter functions equals 255
        var alphaFac = opaque ? 1 : 0;

        //go for the rows
        for (var y = 0; y < h; y++) {
            //go for the columns
            for (var x = 0; x < w; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y * w + x) * 4;
                var r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                //side depends on the input matrix (e.g. 3x3)
                //take each side width and height and look at the pixels
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                        var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                        var srcOff = (scy * sw + scx) * 4;
                        var wt = weights[cy * side + cx]; //apply matrix
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                        a += src[srcOff + 3] * wt;
                    }
                }
                //store it in the temp. destination array
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return pixelData;
    },


    // helper function: isCanvasSupported()
    // check if HTML5 canvas is available
    isCanvasSupported: function () {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    },

    // information(text)
    // display text in log area or console
    information: function (text) {
        var logArea = document.getElementById("information");
        if (logArea) {
            logArea.innerHTML = text;
        }
        if (typeof console != "undefined") {
            console.log(text);
        }
    },

    // log(text)
    // display text in log area or console
    log: function (text) {
        var logArea = document.getElementById("log");
        if (logArea) {
            logArea.innerHTML += text + "";
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