define(['../../util', '../../animation_base', '../../controls', '../../3D'], function(util, animation, controls, ddd) {

    animation.name = "Cube Grid";
    animation.description = "This techdemo shows a simple cubegrid created with spheres and lines connecting them.\n\nThe object can be freely rotated by dragging it.\n\nYou can toggle the auto rotation and change the viewing distance of the cube with the controls below.\n\nThe 3D->2D projection is written by hand, so this does not depend on any other external drawing library.";

    var autoRotate = true;
    var rotateSpeed = 3;

    var SPHERE_SIZE = 30;
    var SPHERE_GAP = 60;
    var SIZE = 4;

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

        for (var x = 0; x < SIZE; x++) {
            for (var y = 0; y < SIZE; y++) {
                for (var z = 0; z < SIZE; z++) {
                    var s = Sphere(
                        (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                        (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                        (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                    );
                    objectsToDraw.push(s);

                    if (x != SIZE - 1)
                    {
                        var lx = Line(
                            ddd.Vector(
                                (x+1 + (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+2 - (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(lx);
                    }

                    if (y != SIZE - 1)
                    {
                        var ly = Line(
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1 + (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+2 - (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(ly);
                    }

                    if (z != SIZE - 1)
                    {
                        var lz = Line(
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1 + (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+2 - (SPHERE_SIZE/2) / SPHERE_GAP) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(lz);
                    }
                }
            }
        }
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
        controls.Divider(),
        controls.Text('Rotation'),
        controls.Checkbox('Auto rotation', autoRotate, function(val) {autoRotate = val;}),
        controls.Text('Speed'),
        controls.Range(rotateSpeed, 1, 0.01, 10, function(val) {rotateSpeed=val;}, true),
        controls.Text('Distance'),
        controls.Range(Grid.Position.z, -100, 1, 500, function(val) {Grid.Position.z=val;}, true)
    ];

    return animation;
});