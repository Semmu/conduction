define(['../util', '../animation_base', '../controls', '../3D'], function(util, animation, controls, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This animation shows the 3D crystal structure of various materials used in microchip manufacturing.";

    var autoRotate = true;
    var rotateSpeed = 3;

    var materials = [
        { text: 'Silicon'                                   , value: 'silicon' },
        { text: '[techdemo] Multiple atoms and connections' , value: 'demo' }
    ];

    var objectsToDraw = [];

    var Grid = {
        Scale: 1,
        Position: ddd.Vector(0, 0, 0),
        Axes: {
            x: ddd.Vector(1, 0, 0),
            y: ddd.Vector(0, 1, 0),
            z: ddd.Vector(0, 0, 1)
        },
        rotate: function(flat, lean) {
            Grid.Axes.x = Grid.Axes.x.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(Grid.Scale);
            Grid.Axes.y = Grid.Axes.y.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(Grid.Scale);
            Grid.Axes.z = Grid.Axes.z.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(Grid.Scale);
        },
        scale: function(s) {
            Grid.Scale = s;
            Grid.rotate(0, 0);
        }
    };

    var Text = function(text, settings) {

        var Text = {
            Graphics: new PIXI.Text(text, settings),
            zDistance: 0,
            computeZDistance: function() {},
            draw: function() {}
        };

        Text.Graphics.x = Text.Graphics.width / -2;
        Text.Graphics.y = Text.Graphics.height / -2;

        return Text;
    }

    var Sphere = function(pos, size, color, lineWidth, lineColor) {

        var Sphere = {
            Position: pos,
            Size: size,
            Color: parseInt(color),
            LineWidth: lineWidth,
            LineColor: parseInt(lineColor),

            Graphics: new PIXI.Graphics(),

            getAbsolutePosition: function() {
                return Grid.Position.add(
                    Sphere.Position.transform(
                        Grid.Axes.x,
                        Grid.Axes.y,
                        Grid.Axes.z
                ));
            },

            zDistance: null,

            computeZDistance: function() {
                Sphere.zDistance = Sphere.getAbsolutePosition().z;
            },

            draw: function() {
                Sphere.Graphics.clear();

                var absolutePosition = Sphere.getAbsolutePosition();
                var projection = absolutePosition.getProjection();

                Sphere.Graphics.beginFill(Sphere.Color);
                Sphere.Graphics.lineStyle(Sphere.LineWidth * Grid.Scale, Sphere.LineColor, 1);
                Sphere.Graphics.drawCircle(projection.x, projection.y, ddd.getProjectedDistance(Sphere.Size * Grid.Scale, absolutePosition.distanceFromCamera()));
                Sphere.Graphics.endFill();
            }
        };

        Sphere.draw();

        return Sphere;
    }

    var Line = function(from, to, width, color) {

        var Line = {
            From: ddd.Vector(from.x, from.y, from.z),
            To: ddd.Vector(to.x, to.y, to.z),

            Color: parseInt(color),
            Width: width,

            Graphics: new PIXI.Graphics(),

            getAbsolutePosition: function() {
                return {
                    From: Grid.Position.add(Line.From.transform(Grid.Axes.x, Grid.Axes.y, Grid.Axes.z)),
                    To: Grid.Position.add(Line.To.transform(Grid.Axes.x, Grid.Axes.y, Grid.Axes.z))
                };
            },

            zDistance: null,

            computeZDistance: function() {
                var absolutePosition = Line.getAbsolutePosition();
                Line.zDistance = (absolutePosition.From.z + absolutePosition.To.z) / 2;
            },

            draw: function() {
                var absolutePosition = Line.getAbsolutePosition();
                Line.Graphics.clear();
                Line.Graphics.moveTo(absolutePosition.From.getProjection().x, absolutePosition.From.getProjection().y);
                Line.Graphics.lineStyle(Line.Width * Grid.Scale, Line.Color, 1);
                Line.Graphics.lineTo(absolutePosition.To.getProjection().x, absolutePosition.To.getProjection().y);
            }
        };

        Line.draw();

        return Line;

    }

    var draggableOverlay = new PIXI.Graphics();

    draggableOverlay.beginFill(0xffffff);
    draggableOverlay.lineStyle(1, 0x0, 1);
    draggableOverlay.drawRect(ddd.Camera.WIDTH / -2, ddd.Camera.HEIGHT / -2, ddd.Camera.WIDTH, ddd.Camera.HEIGHT);
    draggableOverlay.endFill();
    draggableOverlay.alpha = 0;

    draggableOverlay.onDragStart = function(event) {
        if (!this.dragging) {
            this.data = event.data;
            this.dragging = true;
            this.data.autoRotate = autoRotate;
            autoRotate = false;

            var dragStartPos = event.data.getLocalPosition(this.parent);
            this.data.previousPosition = {
                x: dragStartPos.x,
                y: dragStartPos.y
            }
        }
    }

    draggableOverlay.onDragMove = function() {
        if (this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);
            Grid.rotate((this.data.previousPosition.x - newPosition.x) / 100, (this.data.previousPosition.y - newPosition.y) / 100);
            this.data.previousPosition = {
                x: newPosition.x,
                y: newPosition.y
            };
        }
    }

    draggableOverlay.onDragEnd = function() {
        if (this.dragging) {
            autoRotate = this.data.autoRotate;
            this.dragging = false;
            this.data = null;
        }
    }

    draggableOverlay.interactive = true;
    draggableOverlay.buttonMode = true;
    draggableOverlay.defaultCursor = "pointer";

    draggableOverlay.on('pointerdown', draggableOverlay.onDragStart)
    .on('pointerupoutside', draggableOverlay.onDragEnd)
    .on('pointerup', draggableOverlay.onDragEnd)
    .on('pointermove', draggableOverlay.onDragMove);


    animation.onLoad = function() {

        animation.scene.addChild(draggableOverlay);
        animation.loadMaterial(materials[0].value);

    }

    animation.loadMaterial = function(material) {

        objectsToDraw = [];
        Grid.scale(1);
        Grid.Axes = {
            x: ddd.Vector(1, 0, 0),
            y: ddd.Vector(0, 1, 0),
            z: ddd.Vector(0, 0, 1)
        };

        $.ajax({
            url: './js/conduction/animations/materials/'+material+'.json',
            beforeSend: function(xhr){
                if (xhr.overrideMimeType)
                {
                    // mime-type override needed
                    // from: https://stackoverflow.com/a/4234006/1576667
                    xhr.overrideMimeType("application/json");
                }
            },
            dataType: 'json',
            data: null,
            success: function(data) {

                Grid.scale(data.scale);
                var translation = ddd.Vector(data.center[0], data.center[1], data.center[2]).scale(-1);

                for (var i = 0; i < data.atoms.length; i++) {
                    var position = data.atoms[i].position;
                    var typeDetails = data.types[data.atoms[i].type];
                    var posVector = ddd.Vector(position[0], position[1], position[2]);

                    objectsToDraw.push(Sphere(translation.add(posVector), typeDetails.size, typeDetails.color, typeDetails.lineWidth, typeDetails.lineColor));
                }

                for (var i = 0; i < data.connections.length; i++) {
                    var c = data.connections[i];
                    var details = data.connectionTypes[c.type];

                    var fromCenter = ddd.Vector(data.atoms[c.from].position[0], data.atoms[c.from].position[1], data.atoms[c.from].position[2]);
                    var toCenter = ddd.Vector(data.atoms[c.to].position[0], data.atoms[c.to].position[1], data.atoms[c.to].position[2]);

                    var fromRadius = data.types[data.atoms[c.from].type].size / 2;
                    var toRadius = data.types[data.atoms[c.to].type].size / 2;

                    var direction = toCenter.add(fromCenter.scale(-1));

                    var fromTouching = fromCenter.add(direction.setLength(fromRadius));
                    var toTouching = toCenter.add(direction.scale(-1).setLength(toRadius));

                    objectsToDraw.push(Line(translation.add(fromTouching), translation.add(toTouching), details.width, details.color));
                }
            },
            error: function() {
                objectsToDraw.push(Text('Could not load material file!\n('+material+'.json)', new PIXI.TextStyle({
                    fill: '#aa0000',
                    align: 'center'
                })));
            }
        });
    }

    var renderStart, renderEnd;

    animation.onRender = function() {
        animation.scene.removeChildren();

        if (autoRotate)
            Grid.rotate(rotateSpeed / 1000, 0);

        for (var i = objectsToDraw.length - 1; i >= 0; i--) {
            objectsToDraw[i].computeZDistance();
        }

        objectsToDraw.sort(function(a, b) {
            return a.zDistance - b.zDistance;
        });

        for (var i = objectsToDraw.length - 1; i >= 0; i--) {
            objectsToDraw[i].draw();
            animation.scene.addChild(objectsToDraw[i].Graphics);
        }

        animation.scene.addChild(draggableOverlay);
    }

    animation.settings = [
        controls.Text('Material'),
        controls.Select(materials, function(val) { animation.loadMaterial(val); }),
        controls.Text('Rotation'),
        controls.Checkbox('Auto rotation', autoRotate, function(val) {autoRotate = val;}),
        controls.Text('Speed'),
        controls.Range(rotateSpeed, 1, 0.01, 10, function(val) {rotateSpeed=val;}, true),
        controls.Text('Distance'),
        controls.Range(Grid.Position.z, -100, 1, 500, function(val) {Grid.Position.z=val;}, true)
    ];

    return animation;


});