define(['../util', '../animation_base', '../controls', '../3D'], function(util, animation, controls, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This animation shows the 3D crystal structure of various materials used in microchip manufacturing.";

    var autoRotate = true;
    var rotateSpeed = 3;

    var SPHERE_SIZE = 30;
    var SPHERE_GAP = 60;
    var SIZE = 4;

    var materials = [
        { text: 'Silicon',  value: 'silicon' }
    ];

    var objectsToDraw = [];

    var Grid = {
        Position: ddd.Vector(0, 0, 0),
        Axes: {
            x: ddd.Vector(1, 0, 0),
            y: ddd.Vector(0, 1, 0),
            z: ddd.Vector(0, 0, 1)
        },
        rotate: function(flat, lean) {
            Grid.Axes.x = Grid.Axes.x.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(1);
            Grid.Axes.y = Grid.Axes.y.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(1);
            Grid.Axes.z = Grid.Axes.z.rotate(ddd.Vector(0, 1, 0), flat).rotate(ddd.Vector(1, 0, 0), lean).setLength(1);
        }
    };


    var Sphere = function(x, y, z) {

        var Sphere = {
            Graphics: new PIXI.Graphics(),
            Position: ddd.Vector(x, y, z),
            Color: util.randInt(0xffffff),

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
                Sphere.Graphics.lineStyle(2, 0x000000, 1);
                Sphere.Graphics.drawCircle(projection.x, projection.y, ddd.getProjectedDistance(SPHERE_SIZE, absolutePosition.distanceFromCamera()));
                Sphere.Graphics.endFill();
            }
        };

        Sphere.draw();

        return Sphere;
    }

    var Line = function(from, to) {

        var Line = {
            Graphics: new PIXI.Graphics(),
            From: ddd.Vector(from.x, from.y, from.z),
            To: ddd.Vector(to.x, to.y, to.z),

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
                Line.Graphics.lineStyle(2, 0x000000, 1);
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
        autoRotate = this.data.autoRotate;
        this.dragging = false;
        this.data = null;
    }

    draggableOverlay.interactive = true;
    draggableOverlay.buttonMode = true;
    draggableOverlay.defaultCursor = "pointer";

    draggableOverlay.on('pointerdown', draggableOverlay.onDragStart)
    .on('pointerup', draggableOverlay.onDragEnd)
    .on('pointermove', draggableOverlay.onDragMove);


    animation.onLoad = function() {

        animation.scene.addChild(draggableOverlay);
        animation.loadMaterial(materials[0].value);

    }

    animation.loadMaterial = function(material) {

        // mime-type override needed
        // from: https://stackoverflow.com/a/4234006/1576667

        $.ajax({
            url: './js/conduction/animations/materials/'+material+'.json',
            beforeSend: function(xhr){
                if (xhr.overrideMimeType)
                {
                    xhr.overrideMimeType("application/json");
                }
            },
            dataType: 'json',
            data: null,
            success: function(data) {
                console.log(data);
            }
        });
    }

    var renderStart, renderEnd;

    animation.onRender = function() {

        renderStart = performance.now();

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

        renderEnd = performance.now();
        // console.log(renderEnd - renderStart);
    }

    animation.settings = [
        controls.Text('Material'),
        controls.Select(materials, function(val) { animation.loadMaterial(val); }),
        controls.Text('Rotation'),
        controls.Checkbox('Auto rotation', autoRotate, function(val) {autoRotate = val;}),
        controls.Text('Speed'),
        controls.Range(rotateSpeed, 1, 0.01, 10, function(val) {rotateSpeed=val;}),
        controls.Text('Distance'),
        controls.Range(Grid.Position.z, -100, 1, 500, function(val) {Grid.Position.z=val;})
    ];

    return animation;


});