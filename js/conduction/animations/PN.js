define(['../animation_base', '../controls', '../3D'], function(animation, controls, ddd) {

    // csak debug miatt
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

    animation.name = 'PN junction diode under bias';
    animation.description = 'This interactive animation shows a band diagram for a PN junction diode under bias.';

    var EnergyField = function() {
        var EnergyField = {
            HEIGHT: 200,
            limits: [2, -2],

            getHeightForValue: function(value) {
                return (value - EnergyField.limits[1]) / (EnergyField.limits[0] - EnergyField.limits[2]) * EnergyField.HEIGHT;
            }
        }
    }
    energyField = EnergyField();

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
    var DIODE_ELEVATION = 100;

    var Drawable = function() {
        var Drawable = {
            Graphics: new PIXI.Graphics(),
            draw: function() {}
        }

        return Drawable;
    }

    var CanvasTexture = function() {
        var CanvasTexture = Drawable();
        CanvasTexture.Graphics = new PIXI.Sprite();

        CanvasTexture.canvas = null;

        CanvasTexture.x = null;
        CanvasTexture.y = null;
        CanvasTexture.width = null;
        CanvasTexture.height = null;

        CanvasTexture.createCanvas = function(width, height) {
            CanvasTexture.canvas = document.createElement('canvas');
            CanvasTexture.canvas.width = width;
            CanvasTexture.canvas.height = height;
            CanvasTexture.Graphics.setTexture(PIXI.Texture.fromCanvas(CanvasTexture.canvas));
        }

        CanvasTexture.drawOnCanvas = function() {
            var ctx = CanvasTexture.canvas.getContext('2d');
            ctx.clearRect(0, 0, CanvasTexture.canvas.width, CanvasTexture.canvas.height);

            for (var x = 0; x < CanvasTexture.canvas.width; x++) {
                for (var y = 0; y < CanvasTexture.canvas.height; y++) {
                    ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        CanvasTexture.setPosition = function(x, y, width, height) {
            CanvasTexture.x = x;
            CanvasTexture.y = y;
            CanvasTexture.width = width;
            CanvasTexture.height = height;
        }

        CanvasTexture.draw = function() {
            CanvasTexture.drawOnCanvas();
            CanvasTexture.Graphics.texture.update(); // we force it to recreate the texture, otherwise it would cache it and not update
            CanvasTexture.Graphics.width = CanvasTexture.width;
            CanvasTexture.Graphics.height = CanvasTexture.height;
            CanvasTexture.Graphics.x = CanvasTexture.x;
            CanvasTexture.Graphics.y = CanvasTexture.y;
        }

        return CanvasTexture;
    }

    var Bezier = function(p1, p2, p3, p4, color, LOD) {
        var Bezier = Drawable();

        Bezier.p1 = p1;
        Bezier.p2 = p2;
        Bezier.p3 = p3;
        Bezier.p4 = p4;
        Bezier.color = color;

        Bezier.LOD = (LOD ? LOD : 30);

        Bezier.getPointAtT = function(t) {
            return Bezier.p1.scale(Math.pow(1-t, 3)).add(
                   Bezier.p2.scale(3*Math.pow(1-t, 2)*t).add(
                   Bezier.p3.scale(3*(1-t)*Math.pow(t, 2)).add(
                   Bezier.p4.scale(Math.pow(t, 3)))));
        }

        Bezier.draw = function() {
            Bezier.Graphics.clear();
            Bezier.Graphics.lineStyle(1, Bezier.color, 1);

            for (var i = 0; i < Bezier.LOD; i++) {
                var from = Bezier.getPointAtT(1.0 * i / Bezier.LOD);
                var to = Bezier.getPointAtT(1.0 * (i+1) / Bezier.LOD);
                Bezier.Graphics.moveTo(from.x, from.y);
                Bezier.Graphics.lineTo(to.x, to.y);
            }
        }

        return Bezier;
    }

    var CanvasRect = function() {
        var CanvasRect = Drawable();

        CanvasRect.draw = function() {
            CanvasRect.Graphics.clear();

            CanvasRect.Graphics.beginFill(0xddffff);
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
            DiodeLines.Graphics.moveTo(0, -DIODE_HEIGHT/2 - DIODE_ELEVATION);
            DiodeLines.Graphics.lineTo(0, DIODE_HEIGHT/2 - DIODE_ELEVATION);
            DiodeLines.Graphics.drawRect(-DIODE_WIDTH/2, - DIODE_HEIGHT/2 - DIODE_ELEVATION, DIODE_WIDTH, DIODE_HEIGHT);
        }
        return DiodeLines;
    }
    diodeLines = DiodeLines();

    var DiodeRects = function() {
        var DiodeRects = Drawable();

        DiodeRects.draw = function() {
            DiodeRects.Graphics.clear();

            DiodeRects.Graphics.beginFill(0xff0000);
            DiodeRects.Graphics.drawRect(-DIODE_WIDTH/2, -DIODE_HEIGHT/2 - DIODE_ELEVATION, DIODE_WIDTH/2*settings.voltage, DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();

            DiodeRects.Graphics.beginFill(0x0000ff);
            DiodeRects.Graphics.drawRect(DIODE_WIDTH/2*(1-settings.voltage), -DIODE_HEIGHT/2 - DIODE_ELEVATION, (DIODE_WIDTH/2) - DIODE_WIDTH/2*(1-settings.voltage), DIODE_HEIGHT);
            DiodeRects.Graphics.endFill();
        }

        return DiodeRects;
    }
    diodeRects = DiodeRects();

    var Ground = function() {
        var Ground = Drawable();

        Ground.POSITION = {
            x: 180.0,
            y: 40.0 - DIODE_ELEVATION
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
            y: 0.0 - DIODE_ELEVATION
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

            OtherLines.Graphics.moveTo(DIODE_WIDTH/2, -DIODE_ELEVATION);
            OtherLines.Graphics.lineTo(ground.POSITION.x, -DIODE_ELEVATION);
            OtherLines.Graphics.lineTo(ground.POSITION.x, ground.POSITION.y - ground.HEIGHT / 2);

            OtherLines.Graphics.moveTo(-DIODE_WIDTH/2, -DIODE_ELEVATION);
            OtherLines.Graphics.lineTo(aclogo.POSITION.x + aclogo.RADIUS, -DIODE_ELEVATION);
        }

        return OtherLines;
    }
    var otherLines = OtherLines();

    var FIELDLINES_HEIGHT = 40;
    var FIELDLINES_SFKLJS = 10;

    var FieldLines = function() {
        var FieldLines = Drawable();

        FieldLines.draw = function() {
            FieldLines.Graphics.clear();

            FieldLines.Graphics.lineStyle(1, 0x000000, 1);
            FieldLines.Graphics.moveTo(0, FIELDLINES_HEIGHT / 2);
            FieldLines.Graphics.lineTo(0, -FIELDLINES_HEIGHT / 2);

            FieldLines.Graphics.moveTo(-DIODE_WIDTH / 2, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS);
            FieldLines.Graphics.lineTo(-DIODE_WIDTH / 2 + DIODE_WIDTH/2*settings.voltage, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS);

            FieldLines.Graphics.moveTo(DIODE_WIDTH / 2, -FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS);
            FieldLines.Graphics.lineTo(DIODE_WIDTH / 2 - DIODE_WIDTH/2*settings.voltage, -FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS);

            FieldLines.Graphics.moveTo(-DIODE_WIDTH / 2, FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS);
            FieldLines.Graphics.lineTo(-DIODE_WIDTH / 2 + DIODE_WIDTH/2*settings.voltage, FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS);

            FieldLines.Graphics.moveTo(DIODE_WIDTH / 2, FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS);
            FieldLines.Graphics.lineTo(DIODE_WIDTH / 2 - DIODE_WIDTH/2*settings.voltage, FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS);
        }

        return FieldLines;
    }
    var fieldLines = FieldLines();

    var topBezier = Bezier(ddd.Vector(-DIODE_WIDTH / 2 + DIODE_WIDTH / 2 * settings.voltage, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0),
                           ddd.Vector(0, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0),
                           ddd.Vector(0, -FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0),
                           ddd.Vector(DIODE_WIDTH / 2 - DIODE_WIDTH / 2 * settings.voltage, -FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0),
                           0x000000);

    var bottomBezier = Bezier(ddd.Vector(-DIODE_WIDTH / 2 + DIODE_WIDTH / 2 * settings.voltage, FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0),
                              ddd.Vector(0, FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0),
                              ddd.Vector(0, FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0),
                              ddd.Vector(DIODE_WIDTH / 2 - DIODE_WIDTH / 2 * settings.voltage, FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0),
                              0x000000);

    var textureTopLeft = CanvasTexture();
    textureTopLeft.createCanvas(10, 10);
    textureTopLeft.setPosition(-DIODE_WIDTH/2, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS*4, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
    textureTopLeft.draw();

    var textureTopRight = CanvasTexture();
    textureTopRight.createCanvas(10, 10);
    textureTopRight.setPosition(DIODE_WIDTH/2 - DIODE_WIDTH/2*settings.voltage, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS*2, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
    textureTopRight.draw();

    var textureBottomLeft = CanvasTexture();
    textureBottomLeft.createCanvas(10, 10);
    textureBottomLeft.setPosition(-DIODE_WIDTH/2, +FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
    textureBottomLeft.draw();

    var textureBottomRight = CanvasTexture();
    textureBottomRight.createCanvas(10, 10);
    textureBottomRight.setPosition(DIODE_WIDTH/2 - DIODE_WIDTH/2*settings.voltage, +FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
    textureBottomRight.draw();



    var callbacks = {
        setVoltage: function(val) {
            settings.voltage = val;
            diodeRects.draw();
            fieldLines.draw();

            topBezier.p1 = ddd.Vector(-DIODE_WIDTH / 2 + DIODE_WIDTH / 2 * settings.voltage, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0);
            topBezier.p4 = ddd.Vector(DIODE_WIDTH / 2 - DIODE_WIDTH / 2 * settings.voltage, -FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0);
            topBezier.draw();

            bottomBezier.p1 = ddd.Vector(-DIODE_WIDTH / 2 + DIODE_WIDTH / 2 * settings.voltage, FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, 0);
            bottomBezier.p4 = ddd.Vector(DIODE_WIDTH / 2 - DIODE_WIDTH / 2 * settings.voltage, FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, 0);
            bottomBezier.draw();

            textureTopRight.setPosition(DIODE_WIDTH/2 - DIODE_WIDTH/2*settings.voltage, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS*2, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
            textureTopRight.draw();

            textureTopLeft.setPosition(-DIODE_WIDTH/2, -FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS*4, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
            textureTopLeft.draw();

            textureBottomRight.setPosition(DIODE_WIDTH/2 - DIODE_WIDTH/2*settings.voltage, +FIELDLINES_HEIGHT / 2 + FIELDLINES_SFKLJS, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
            textureBottomRight.draw();

            textureBottomLeft.setPosition(-DIODE_WIDTH/2, +FIELDLINES_HEIGHT / 2 - FIELDLINES_SFKLJS, DIODE_WIDTH/2*settings.voltage, FIELDLINES_SFKLJS * 3);
            textureBottomLeft.draw();
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
        fieldLines.draw();
        topBezier.draw();
        bottomBezier.draw();

        animation.scene.addChild(canvasRect.Graphics);
        animation.scene.addChild(diodeRects.Graphics);
        animation.scene.addChild(diodeLines.Graphics);
        animation.scene.addChild(ground.Graphics);
        animation.scene.addChild(aclogo.Graphics);
        animation.scene.addChild(otherLines.Graphics);
        animation.scene.addChild(fieldLines.Graphics);
        animation.scene.addChild(topBezier.Graphics);
        animation.scene.addChild(bottomBezier.Graphics);

        animation.scene.addChild(textureTopLeft.Graphics);
        animation.scene.addChild(textureTopRight.Graphics);
        animation.scene.addChild(textureBottomLeft.Graphics);
        animation.scene.addChild(textureBottomRight.Graphics);
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