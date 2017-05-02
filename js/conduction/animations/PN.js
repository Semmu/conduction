define(['../animation_base', '../controls'], function(animation, controls) {

    animation.name = 'PN junction diode under bias';
    animation.description = 'This interactive animation shows a band diagram for a PN junction diode under bias.';

    var settings = {
        voltage: 0.6,

        leakage: true,
        injection: true,
        recombination: true,

        electrons: true,
        holes: true
    };

    var DIODE_WIDTH = 300;
    var DIODE_HEIGHT = 30;
    var CANVAS_WIDTH = 400;
    var CANVAS_HEIGHT = 300;
    var CANVAS_ELEVATION = 0;

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
            DiodeRects.Graphics.drawRect(-DIODE_WIDTH/2, -DIODE_HEIGHT/2, DIODE_WIDTH/2*settings.voltage, DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();

            DiodeRects.Graphics.beginFill(0x0000ff);
            DiodeRects.Graphics.drawRect(DIODE_WIDTH/2*(1-settings.voltage), -DIODE_HEIGHT/2, (DIODE_WIDTH/2) - DIODE_WIDTH/2*(1-settings.voltage), DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();
        }

        return DiodeRects;
    }
    diodeRects = DiodeRects();

    var Ground = function() {
        var Ground = Drawable();

        Ground.POSITION = {
            x: 180.0,
            y: 40.0
        }
        Ground.WIDTH = 20.0;
        Ground.HEIGHT = 10.0;
        Ground.LINES = 4;


        Ground.draw = function() {
            Ground.Graphics.clear();
            Ground.Graphics.lineStyle(1, 0x000000, 1);

            for (var i = 0; i < Ground.LINES; i++) {
                var y = Ground.POSITION.y + Ground.HEIGHT / Ground.LINES * i - Ground.HEIGHT / 2;
                var diff = Ground.WIDTH / 2.0 / Ground.LINES * i;

                Ground.Graphics.moveTo(Ground.POSITION.x + diff - Ground.WIDTH / 2, y);
                Ground.Graphics.lineTo(Ground.POSITION.x + Ground.WIDTH / 2 - diff, y);
            }
        }

        return Ground;
    }
    ground = Ground();

    var AClogo = function() {
        var AClogo = Drawable();

        AClogo.POSITION = {
            x: -180.0,
            y: 0.0
        }
        AClogo.RADIUS = 10.0;


        AClogo.draw = function() {
            AClogo.Graphics.clear();

            AClogo.Graphics.lineStyle(1, 0x000000, 1);
            AClogo.Graphics.drawCircle(AClogo.POSITION.x, AClogo.POSITION.y, AClogo.RADIUS);
            AClogo.Graphics.arc(AClogo.POSITION.x + AClogo.RADIUS/3, AClogo.POSITION.y, AClogo.RADIUS/3, 0, Math.PI);
            AClogo.Graphics.arc(AClogo.POSITION.x - AClogo.RADIUS/3, AClogo.POSITION.y, AClogo.RADIUS/3, 0, Math.PI, true);
        }

        return AClogo;
    }
    aclogo = AClogo();

    var OtherLines = function() {
        var OtherLines = Drawable();

        OtherLines.draw = function() {
            OtherLines.Graphics.clear();

            OtherLines.Graphics.lineStyle(1, 0x000000, 1);

            OtherLines.Graphics.moveTo(DIODE_WIDTH/2, 0);
            OtherLines.Graphics.lineTo(ground.POSITION.x, 0);
            OtherLines.Graphics.lineTo(ground.POSITION.x, ground.POSITION.y - ground.HEIGHT / 2);

            OtherLines.Graphics.moveTo(-DIODE_WIDTH/2, 0);
            OtherLines.Graphics.lineTo(aclogo.POSITION.x + aclogo.RADIUS, 0);
        }

        return OtherLines;
    }
    var otherLines = OtherLines();

    var callbacks = {
        setVoltage: function(val) {
            console.log('voltage changed to ' + val);
            settings.voltage = val;
            diodeRects.draw();
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
    animation.onLoad = function() {

        canvasRect.draw();
        diodeLines.draw();
        diodeRects.draw();
        ground.draw();
        aclogo.draw();
        otherLines.draw();

        animation.scene.addChild(canvasRect.Graphics);
        animation.scene.addChild(diodeRects.Graphics);
        animation.scene.addChild(diodeLines.Graphics);
        animation.scene.addChild(ground.Graphics);
        animation.scene.addChild(aclogo.Graphics);
        animation.scene.addChild(otherLines.Graphics);
    }

    animation.onRender = function() {

    }


    animation.settings = [
        controls.Text('Voltage'),
        controls.Range(settings.voltage, 0, 0.01, 1, callbacks.setVoltage),
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