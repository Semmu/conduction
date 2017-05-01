define(['../animation_base', '../controls'], function(animation, controls) {

    animation.name = 'PN junction diode under bias';
    animation.description = 'This interactive animation shows a band diagram for a PN junction diode under bias.';

    var settings = {
        voltage: 0.0,
        fillRatio: 0.6,

        leakage: true,
        injection: true,
        recombination: true,

        electrons: true,
        holes: true
    };

    var callbacks = {
        setVoltage: function(val) {
            console.log('voltage changed to ' + val);
        },

        setLeakage: function(val) {
            console.log('leakage set to ' + val);
        },

        setInjection: function(val) {
            console.log('injection set to ' + val);
        },

        setRecombination: function(val) {
            console.log('recombination set to ' + val);
        },

        setElectrons: function(val) {
            console.log('electrons set to ' + val);
        },

        setHoles: function(val) {
            console.log('holes set to ' + val);
        }
    };

    var DIODE_WIDTH = 300;
    var DIODE_HEIGHT = 30;
    var CANVAS_WIDTH = 400;
    var CANVAS_HEIGHT = 300;
    var CANVAS_ELEVATION = 20;

    var Drawable = function() {
        var Drawable = {
            Graphics: new PIXI.Graphics(),
            draw: function() {}
        }

        return Drawable;
    }

    var CanvasRect = function() {
        var CanvasRect = Drawable();

        CanvasRect.draw = function() {
            CanvasRect.Graphics.clear();

            CanvasRect.Graphics.beginFill(0x00cc44);
            CanvasRect.Graphics.drawRect(-CANVAS_WIDTH/2,-CANVAS_HEIGHT/2 - CANVAS_ELEVATION,CANVAS_WIDTH,CANVAS_HEIGHT);
            CanvasRect.Graphics.endFill();
        }

        return CanvasRect;
    }
    canvasRect = CanvasRect();

    var DiodeLines = function() {
        var DiodeLines = Drawable();

        DiodeLines.draw = function() {
            DiodeLines.Graphics.clear();
            DiodeLines.Graphics.lineStyle(1, 0x000000, 1);
            DiodeLines.Graphics.moveTo(0, -DIODE_HEIGHT/2);
            DiodeLines.Graphics.lineTo(0, DIODE_HEIGHT/2);
            DiodeLines.Graphics.drawRect(-DIODE_WIDTH/2, -DIODE_HEIGHT/2, DIODE_WIDTH, DIODE_HEIGHT);
        }
        return DiodeLines;
    }
    diodeLines = DiodeLines();

    var DiodeRects = function() {
        var DiodeRects = Drawable();

        DiodeRects.draw = function() {
            DiodeRects.Graphics.clear();

            DiodeRects.Graphics.beginFill(0xff0000);
            DiodeRects.Graphics.drawRect(-DIODE_WIDTH/2, -DIODE_HEIGHT/2, DIODE_WIDTH/2*settings.fillRatio, DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();

            DiodeRects.Graphics.beginFill(0x0000ff);
            DiodeRects.Graphics.drawRect(DIODE_WIDTH/2*(1-settings.fillRatio), -DIODE_HEIGHT/2, (DIODE_WIDTH/2) - DIODE_WIDTH/2*(1-settings.fillRatio), DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();
        }

        return DiodeRects;
    }
    diodeRects = DiodeRects();

    var Ground = function() {
        var POSITION = {
            x: 180.0,
            y: 40.0
        }
        var WIDTH = 20.0;
        var HEIGHT = 10.0;
        var LINES = 4;

        var Ground = Drawable();

        Ground.draw = function() {
            Ground.Graphics.clear();
            Ground.Graphics.lineStyle(1, 0x000000, 1);

            for (var i = 0; i < LINES; i++) {
                var y = POSITION.y + HEIGHT / LINES * i - HEIGHT / 2;
                var diff = WIDTH / 2.0 / LINES * i;

                Ground.Graphics.moveTo(POSITION.x + diff - WIDTH / 2, y);
                Ground.Graphics.lineTo(POSITION.x + WIDTH / 2 - diff, y);
            }
        }

        return Ground;
    }
    ground = Ground();

    animation.onLoad = function() {

        canvasRect.draw();
        diodeLines.draw();
        diodeRects.draw();
        ground.draw();

        animation.scene.addChild(canvasRect.Graphics);
        animation.scene.addChild(diodeRects.Graphics);
        animation.scene.addChild(diodeLines.Graphics);
        animation.scene.addChild(ground.Graphics);
    }

    animation.onRender = function() {

    }


    animation.settings = [
        controls.Text('Voltage'),
        controls.Range(settings.voltage, -5, 0.1, 5, callbacks.setVoltage),
        controls.Text('Particle types'),
        controls.Checkbox('Electrons', settings.electrons, callbacks.setElectrons),
        controls.Checkbox('Holes', settings.holes, callbacks.setHoles),
        controls.Text('Change types'),
        controls.Checkbox('Injections', settings.injection, callbacks.setInjection),
        controls.Checkbox('Leakages', settings.leakage, callbacks.setLeakage),
        controls.Checkbox('Recombinations', settings.recombination, callbacks.setRecombination)
    ];

    return animation;
});