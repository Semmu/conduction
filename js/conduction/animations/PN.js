define(['../animation_base', '../controls', '../3D'], function(animation, controls, ddd) {

    // csak debug miatt
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

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
    var DIODE_ELEVATION = 100;

    var Drawable = function() {
        var Drawable = {
            Graphics: new PIXI.Graphics(),
            draw: function() {}
        }

        return Drawable;
    }
    var drawables = [];

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
                    ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 70%, 70%)';
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

    var Bezier = function(p1, p2, p3, p4, color, cacheLOD, drawLOD) {
        var Bezier = Drawable();

        Bezier.p1 = p1;
        Bezier.p2 = p2;
        Bezier.p3 = p3;
        Bezier.p4 = p4;
        Bezier.color = color;

        Bezier.cacheLOD = (cacheLOD ? cacheLOD : 1000);
        Bezier.cache = [];

        Bezier.drawLOD = (drawLOD ? drawLOD : Bezier.cacheLOD);
        if (Bezier.drawLOD > Bezier.cacheLOD)
            Bezier.drawLOD = Bezier.cacheLOD;

        Bezier.getPointAtT = function(t) {
            return Bezier.cache[Math.floor(t * Bezier.cacheLOD)];
        }

        Bezier.calculatePointAtT = function(t) {
            return Bezier.p1.scale(Math.pow(1-t, 3)).add(
                   Bezier.p2.scale(3*Math.pow(1-t, 2)*t).add(
                   Bezier.p3.scale(3*(1-t)*Math.pow(t, 2)).add(
                   Bezier.p4.scale(Math.pow(t, 3)))));
        }

        Bezier.draw = function() {
            Bezier.Graphics.clear();
            Bezier.Graphics.lineStyle(1, Bezier.color, 1);

            Bezier.calculateCache();
            for (var i = 0; i < Bezier.drawLOD; i++) {
                var from = Bezier.getPointAtT(1.0 * i / Bezier.drawLOD);
                var to = Bezier.getPointAtT(1.0 * (i+1) / Bezier.drawLOD);
                Bezier.Graphics.moveTo(from.x, from.y);
                Bezier.Graphics.lineTo(to.x, to.y);
            }
        }

        Bezier.calculateCache = function() {
            Bezier.cache = [];

            for (var i = 0; i < Bezier.cacheLOD; i++) {
                Bezier.cache.push(Bezier.calculatePointAtT(1.0*i/Bezier.cacheLOD));
            }
            Bezier.cache.push(Bezier.calculatePointAtT(1.0));
        }

        Bezier.calculateCache();

        return Bezier;
    }

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
    var diodeLines = DiodeLines();

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
    var diodeRects = DiodeRects();

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
    var ground = Ground();

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
    var aclogo = AClogo();

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

    var Field = {
        POSITION: ddd.Vector(0, 50, 0),
        WIDTH: 300,
        HEIGHT: 200,
        CENTER_HEIGHT: 0.7,
        SLOPE_HEIGHT: 0.7,

        getPositionAt: function(x, y) {
            return ddd.Vector(x/2 * Field.WIDTH, -y/2 * Field.HEIGHT).add(Field.POSITION);
        },

        getKeyPositionAt: function(x, y) {
            var X, Y;

            if (x == 0) {
                X = -1;
            } else if (x == 1) {
                X = -1 + settings.voltage;
            } else if (x == 2) {
                X = 0;
            } else if (x == 3) {
                X = 1 - settings.voltage;
            } else {
                X = 1;
            }

            if (y == 0) {
                Y = 1;
            } else if (y == 1) {
                Y = Field.CENTER_HEIGHT / 2 + Field.SLOPE_HEIGHT / 2;
            } else if (y == 2) {
                Y = Field.CENTER_HEIGHT / 2;
            } else if (y == 3) {
                Y = Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2;
            } else if (y == 4) {
                Y = Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2 - (1 - Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2);
            } else if (y == 5) {
                Y = 0;
            } else if (y == 6) {
                Y = -1 * (Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2 - (1 - Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2));
            } else if (y == 7) {
                Y = -Field.CENTER_HEIGHT / 2 + Field.SLOPE_HEIGHT / 2;
            } else if (y == 8) {
                Y = -Field.CENTER_HEIGHT / 2;
            } else if (y == 9) {
                Y = -Field.CENTER_HEIGHT / 2 - Field.SLOPE_HEIGHT / 2;
            } else {
                Y = -1;
            }

            return Field.getPositionAt(X, Y);
        }
    }

    var FieldLines = function() {
        var FieldLines = Drawable();

        FieldLines.draw = function() {
            FieldLines.Graphics.clear();

            FieldLines.Graphics.lineStyle(1, 0x000000, 1);
            FieldLines.Graphics.moveTo(0, Field.getKeyPositionAt(0, 2).y);
            FieldLines.Graphics.lineTo(0, Field.getKeyPositionAt(0, 8).y);

            var topLeftLineFrom = Field.getKeyPositionAt(0, 1);
            var topLeftLineTo = Field.getKeyPositionAt(1, 1);
            FieldLines.Graphics.moveTo(topLeftLineFrom.x, topLeftLineFrom.y);
            FieldLines.Graphics.lineTo(topLeftLineTo.x, topLeftLineTo.y);

            var topRightLineFrom = Field.getKeyPositionAt(3, 3);
            var topRightLineTo = Field.getKeyPositionAt(4, 3);
            FieldLines.Graphics.moveTo(topRightLineFrom.x, topRightLineFrom.y);
            FieldLines.Graphics.lineTo(topRightLineTo.x, topRightLineTo.y);

            var bottomRightLineFrom = Field.getKeyPositionAt(0, 7);
            var bottomRightLineTo = Field.getKeyPositionAt(1, 7);
            FieldLines.Graphics.moveTo(bottomRightLineFrom.x, bottomRightLineFrom.y);
            FieldLines.Graphics.lineTo(bottomRightLineTo.x, bottomRightLineTo.y);

            var bottomLeftLineFrom = Field.getKeyPositionAt(3, 9);
            var bottomLeftLineTo = Field.getKeyPositionAt(4, 9);
            FieldLines.Graphics.moveTo(bottomLeftLineFrom.x, bottomLeftLineFrom.y);
            FieldLines.Graphics.lineTo(bottomLeftLineTo.x, bottomLeftLineTo.y);
        }

        return FieldLines;
    }
    var fieldLines = FieldLines();

    var FieldTopSlope = function() {
        var FieldTopSlope = Bezier(Field.getKeyPositionAt(1, 1),
                                   Field.getKeyPositionAt(2, 1),
                                   Field.getKeyPositionAt(2, 3),
                                   Field.getKeyPositionAt(3, 3),
                                   0x000000, 1000, 30);

        FieldTopSlope.updateCPs = function() {
            FieldTopSlope.p1 = Field.getKeyPositionAt(1, 1);
            FieldTopSlope.p4 = Field.getKeyPositionAt(3, 3);
        }

        return FieldTopSlope;
    }
    var fieldTopSlope = FieldTopSlope();

    var FieldBottomSlope = function() {
        var FieldBottomSlope = Bezier(Field.getKeyPositionAt(1, 7),
                                   Field.getKeyPositionAt(2, 7),
                                   Field.getKeyPositionAt(2, 9),
                                   Field.getKeyPositionAt(3, 9),
                                   0x000000, 1000, 30);

        FieldBottomSlope.updateCPs = function() {
            FieldBottomSlope.p1 = Field.getKeyPositionAt(1, 7);
            FieldBottomSlope.p4 = Field.getKeyPositionAt(3, 9);
        }

        return FieldBottomSlope;
    }
    var fieldBottomSlope = FieldBottomSlope();

    var CanvasRect = function() {
        var CanvasRect = Drawable();

        CanvasRect.draw = function() {
            CanvasRect.Graphics.clear();

            CanvasRect.Graphics.beginFill(0xddffff);
            CanvasRect.Graphics.drawRect(Field.getPositionAt(-1, 1).x,
                                         Field.getPositionAt(-1, 1).y,
                                         Field.WIDTH, Field.HEIGHT);
            CanvasRect.Graphics.endFill();
        }

        return CanvasRect;
    }
    var canvasRect = CanvasRect();

    var TopLeftCanvas = function() {
        var TopLeftCanvas = CanvasTexture();

        TopLeftCanvas.createCanvas(10, 10);
        TopLeftCanvas.drawOnCanvas();

        TopLeftCanvas.updateMetrics = function() {
            TopLeftCanvas.setPosition(Field.getKeyPositionAt(0, 0).x,
                                      Field.getKeyPositionAt(0, 0).y,
                                      Field.getKeyPositionAt(1, 1).x - Field.getKeyPositionAt(0, 0).x,
                                      Field.getKeyPositionAt(1, 1).y - Field.getKeyPositionAt(0, 0).y);
        }
        TopLeftCanvas.updateMetrics();

        return TopLeftCanvas;
    }
    var topLeftCanvas = TopLeftCanvas();

    var TopRightCanvas = function() {
        var TopRightCanvas = CanvasTexture();

        TopRightCanvas.createCanvas(10, 10);
        TopRightCanvas.drawOnCanvas();

        TopRightCanvas.updateMetrics = function() {
            TopRightCanvas.setPosition(Field.getKeyPositionAt(3, 0).x,
                                       Field.getKeyPositionAt(3, 0).y,
                                       Field.getKeyPositionAt(4, 3).x - Field.getKeyPositionAt(3, 0).x,
                                       Field.getKeyPositionAt(4, 3).y - Field.getKeyPositionAt(3, 0).y);
        }
        TopRightCanvas.updateMetrics();

        return TopRightCanvas;
    }
    var topRightCanvas = TopRightCanvas();

    var BottomLeftCanvas = function() {
        var BottomLeftCanvas = CanvasTexture();

        BottomLeftCanvas.createCanvas(10, 10);
        BottomLeftCanvas.drawOnCanvas();

        BottomLeftCanvas.updateMetrics = function() {
            BottomLeftCanvas.setPosition(Field.getKeyPositionAt(0, 7).x,
                                      Field.getKeyPositionAt(0, 7).y,
                                      Field.getKeyPositionAt(1, 10).x - Field.getKeyPositionAt(0, 7).x,
                                      Field.getKeyPositionAt(1, 10).y - Field.getKeyPositionAt(0, 7).y);
        }
        BottomLeftCanvas.updateMetrics();

        return BottomLeftCanvas;
    }
    var bottomLeftCanvas = BottomLeftCanvas();

    var BottomRightCanvas = function() {
        var BottomRightCanvas = CanvasTexture();

        BottomRightCanvas.createCanvas(10, 10);
        BottomRightCanvas.drawOnCanvas();

        BottomRightCanvas.updateMetrics = function() {
            BottomRightCanvas.setPosition(Field.getKeyPositionAt(3, 9).x,
                                       Field.getKeyPositionAt(3, 9).y,
                                       Field.getKeyPositionAt(4, 10).x - Field.getKeyPositionAt(3, 9).x,
                                       Field.getKeyPositionAt(4, 10).y - Field.getKeyPositionAt(3, 9).y);
        }
        BottomRightCanvas.updateMetrics();

        return BottomRightCanvas;
    }
    var bottomRightCanvas = BottomRightCanvas();

    var electronTextureCanvas = document.createElement('canvas');
    electronTextureCanvas.width = 10;
    electronTextureCanvas.height = 10;
    var ctx = electronTextureCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(5, 5, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#00aaff';
    ctx.fill();

    var holeTextureCanvas = document.createElement('canvas');
    holeTextureCanvas.width = 10;
    holeTextureCanvas.height = 10;
    var ctx = holeTextureCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(5, 5, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#ff3333';
    ctx.fill();

    var ParticleFromCanvas = function(canvas) {
        var Particle = Drawable();
        Particle.Graphics = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
        Particle.Graphics.width = 1;
        Particle.Graphics.height = 1;
        return Particle;
    }

    var ParticleInField = function(ParticleConstructor, offset) {
        var ParticleInField = ParticleConstructor();

        ParticleInField.offset = offset;
        ParticleInField.distance = 0;

        ParticleInField.setGraphicsPosition = function(x, y) {
            ParticleInField.Graphics.x = x;
            ParticleInField.Graphics.y = y;
        }

        return ParticleInField;
    }

    var Electron = function() {
        return ParticleFromCanvas(electronTextureCanvas);
    }

    var Hole = function() {
        return ParticleFromCanvas(holeTextureCanvas);
    }

    var ElectronInField = function(offset) {
        return ParticleInField(Electron, offset);
    }

    var HoleInField = function(offset) {
        return ParticleInField(Hole, offset);
    }

    var ParticleField = function(trajectory) {
        var ParticleField = {
            count: 0,
            trajectory: trajectory,
            elements: [],

            speed: 0.001,

            spawn: function() {
                console.error('missing ParticleField::spawn implementation');
            },

            populate: function(count) {
                if (ParticleField.count > 0) {
                    for (var i = 0; i < ParticleField.elements.length; i++) {
                        animation.scene.removeChild(ParticleField.elements[i].Graphics);
                    }
                    ParticleField.elements = [];
                }

                ParticleField.count = count;
                for (var i = 0; i < count; i++) {
                    var anelem = ParticleField.spawn();
                    anelem.distance = Math.random();
                    ParticleField.elements.push(anelem);
                    animation.scene.addChild(anelem.Graphics);
                }
            },

            tick: function() {
                for (var i = 0; i < ParticleField.elements.length; i++) {
                    var el = ParticleField.elements[i];
                    el.distance += ParticleField.speed;
                    if (el.distance > 1)
                        el.distance--;

                    var trajectoryPosition = ParticleField.trajectory.getPointAtT(el.distance);
                    var trajectoryPositionWithOffset = el.offset.add(trajectoryPosition);
                    el.setGraphicsPosition(trajectoryPositionWithOffset.x, trajectoryPositionWithOffset.y);
                }
            }
        };

        return ParticleField;
    }

    var VariableParticleField = function() {
        var VariableParticleField = ParticleField();

        VariableParticleField.updateTrajectory = function() {
            console.error('missing VariableParticleField::updateTrajectory implementation');
        }

        return VariableParticleField;
    }

    var TopLeakage = function() {
        var TopLeakage = ParticleField(fieldTopSlope);

        TopLeakage.spawn = function() {
            return ElectronInField(ddd.Vector(0, (Field.getKeyPositionAt(0, 0).y - Field.getKeyPositionAt(0, 1).y) * Math.pow(Math.random(), 2.5), 0));
        }

        return TopLeakage;
    }
    var topLeakage = TopLeakage();

    var BottomLeakage = function() {
        var BottomLeakage = ParticleField(fieldBottomSlope);

        BottomLeakage.spawn = function() {
            return HoleInField(ddd.Vector(0, -1 * (Field.getKeyPositionAt(0, 9).y - Field.getKeyPositionAt(0, 10).y) * Math.pow(Math.random(), 2.5), 0));
        }

        return BottomLeakage;
    }
    var bottomLeakage = BottomLeakage();

    var callbacks = {
        setVoltage: function(val) {
            settings.voltage = val;
            diodeRects.draw();
            fieldLines.draw();
            fieldTopSlope.updateCPs();
            fieldTopSlope.draw();
            fieldBottomSlope.updateCPs();
            fieldBottomSlope.draw();
            topLeftCanvas.updateMetrics();
            topLeftCanvas.draw();
            topRightCanvas.updateMetrics();
            topRightCanvas.draw();
            bottomLeftCanvas.updateMetrics();
            bottomLeftCanvas.draw();
            bottomRightCanvas.updateMetrics();
            bottomRightCanvas.draw();
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

        drawables.push(canvasRect);
        drawables.push(diodeRects);
        drawables.push(diodeLines);
        drawables.push(ground);
        drawables.push(aclogo);
        drawables.push(otherLines);
        drawables.push(fieldLines);
        drawables.push(fieldTopSlope);
        drawables.push(fieldBottomSlope);
        drawables.push(topLeftCanvas);
        drawables.push(topRightCanvas);
        drawables.push(bottomLeftCanvas);
        drawables.push(bottomRightCanvas);

        for (var i = 0; i < drawables.length; i++) {
            drawables[i].draw();
            animation.scene.addChild(drawables[i].Graphics);
        }

        topLeakage.populate(1000);
        bottomLeakage.populate(1000);
    }

    animation.onRender = function() {
        topLeakage.tick();
        bottomLeakage.tick();
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