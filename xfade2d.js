define(['./domUtils'], function(du) {
  
    var pluginConf = {
        name: "Canvas 2d X-fader",
        osc: false,
        audioOut: 1,
        audioIn: 2,
        version: '0.0.1',
        hyaId: 'exxfade2dcanvas',
        ui: {
            type: 'canvas',
            width: 280,
            height: 280
        }

    };
  
    var initPlugin = function(args) {

        // CANVAS-RELATED CODE

        this.canvas = args.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.strokeStyle = "#efefef";
        
        this.handleMouseOver = function(e) {
            this.isMouseInside = true;
            this.isMouseDown = false;
        }.bind(this);

        this.handleMouseDown = function(e) {
            console.log ("mouse down");
            this.isMouseDown = true;
            this.handleMouseMove(e);
        }.bind(this);

        this.handleMouseUp = function(e) {
            this.isMouseDown = false;
        }.bind(this);

        this.handleMouseOut = function(e) {
            this.isMouseInside = false;
        }.bind(this);

        this.handleMouseMove = function(e) {
            if (this.isMouseInside && this.isMouseDown) {
                // Update the position.
                var p = du.getEventPosition (e, this.canvas);
                // Update the state
                this.pluginState.position = {left: p.x, top: p.y};
                // Re-render the canvas.
                this.render();
            }
        }.bind(this);

        this.canvas.addEventListener('mouseover', this.handleMouseOver);
        this.canvas.addEventListener('mouseout', this.handleMouseOut);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        this.render = function () {

            var pos = this.pluginState.position, w = this.canvas.width, h = this.canvas.height;

            // First, change audio params
            this.changeAudioParams();

            if (!pos) {
                return;
            }

            var xcomp = pos.left / w;
            var xleft = 1 - xcomp;
            var ycomp = (h - pos.top) / h;
            var xColorComp = Math.round(xcomp * ycomp * 255);
            var xLeftComp = Math.round(xleft * ycomp * 255);

            var colorString = 'rgba(' + xColorComp + ',0,' + xLeftComp + ',0.6)';
            
            this.ctx.fillStyle = colorString;

            // Reset the canvas
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.beginPath();

            // Vertical line
            this.ctx.moveTo(pos.left, pos.top - 12);
            this.ctx.lineTo(pos.left, pos.top + 12);

            //Horizontal line
            this.ctx.moveTo(pos.left - 12 , pos.top);
            this.ctx.lineTo(pos.left + 12 , pos.top);

            // Draw the cross
            this.ctx.stroke();

        };
        // END OF CANVAS-RELATED CODE


        // AUDIO-RELATED CODE

        this.changeAudioParams = function () {

            var pos = this.pluginState.position, w = this.canvas.width, h = this.canvas.height;

            var xfade = pos.left / w;
            var gain = (h - pos.top) / h;

            // Calculate equal power crossfade
            var gainA = Math.cos(xfade * 0.5 * Math.PI);
            var gainB = Math.cos((1.0 - xfade) * 0.5 * Math.PI);

            this.gainNodeA.gain.value = gainA;
            this.gainNodeB.gain.value = gainB;
            this.gainNode.gain.value = gain;

        };

        this.ac = args.audioContext;
        this.audioSourceA = args.audioSources[0];
        this.audioSourceB = args.audioSources[1];
        this.audioDestination = args.audioDestinations[0];
        this.gainNodeA = this.ac.createGain();
        this.gainNodeB = this.ac.createGain();
        this.gainNode = this.ac.createGain();
        this.audioSourceA.connect(this.gainNodeA);
        this.audioSourceB.connect(this.gainNodeB);
        this.gainNodeA.connect(this.gainNode);
        this.gainNodeB.connect(this.gainNode);
        this.gainNode.connect(this.audioDestination);

        // Destructor function
        args.hostInterface.setDestructor (function () {
            this.gainNode.disconnect();
            this.gainNodeA.disconnect();
            this.gainNodeB.disconnect();
            this.audioSourceA.disconnect();
            this.audioSourceB.disconnect();
            this.canvas.removeEventListener('mouseover', this.handleMouseOver);
            this.canvas.removeEventListener('mouseout', this.handleMouseOut);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }.bind(this));

        // END OF AUDIO-RELATED CODE        

        // Plugin state initialization
        if (args.initialState && args.initialState.data) {
            // Use initial data
            this.pluginState = args.initialState.data;
        }
        else {
            // Use default data
            this.pluginState = {
                position: {top: 0, left: 0}
            };
        }
        this.render();

        // The save function
        var saveState = function () {
            return { data: this.pluginState };
        };
        args.hostInterface.setSaveState (saveState.bind(this));

        // Initialization made it so far: plugin is ready.
        args.hostInterface.setInstanceStatus ('ready');
    };
        
    return {
        initPlugin: initPlugin,
        pluginConf: pluginConf
    };
});
