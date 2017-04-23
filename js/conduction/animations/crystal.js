define(['../util', '../animation_base', '../controls', '../3D'], function(util, animation, controls, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This interactive animation shows the crystal structure of various materials used in microchip manufacturing.";

    var Spheres = [];
    animation.autoRotate = true;
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

    var SPHERE_SIZE = 50;
    var SPHERE_GAP = 80;

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

            distanceFromCamera: null,

            computeDistanceFromCamera: function() {
                Sphere.distanceFromCamera = Sphere.getAbsolutePosition().distanceFromCamera();
            },

            draw: function() {
                Sphere.Graphics.clear();

                var absolutePosition = Sphere.getAbsolutePosition();
                var projection = absolutePosition.getProjection();

                Sphere.Graphics.beginFill(Sphere.Color);
                Sphere.Graphics.drawCircle(projection.x, projection.y, ddd.getProjectedDistance(SPHERE_SIZE, absolutePosition.distanceFromCamera() - SPHERE_SIZE / 2));
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

            distanceFromCamera: null,

            computeDistanceFromCamera: function() {
                var absolutePosition = Line.getAbsolutePosition();
                var middle = absolutePosition.From.add(absolutePosition.To).scale(0.5);
                Line.distanceFromCamera = middle.distanceFromCamera();
            },

            draw: function() {
                var absolutePosition = Line.getAbsolutePosition();
                Line.Graphics.clear();
                Line.Graphics.moveTo(absolutePosition.From.getProjection().x, absolutePosition.From.getProjection().y);
                Line.Graphics.lineStyle(1, 0x000000, 1);
                Line.Graphics.lineTo(absolutePosition.To.getProjection().x, absolutePosition.To.getProjection().y);
            }
        };

        Line.draw();

        return Line;

    }

    var draggableOverlay = new PIXI.Graphics();

    animation.onLoad = function() {
        draggableOverlay.beginFill(0xf6f5a4);
        draggableOverlay.drawRect(ddd.Camera.WIDTH / -2, ddd.Camera.HEIGHT / -2, ddd.Camera.WIDTH, ddd.Camera.HEIGHT);
        draggableOverlay.endFill();
        draggableOverlay.interactive = true;
        draggableOverlay.alpha = 0;

        draggableOverlay.onDragStart = function(event) {
            this.data = event.data;
            this.data.autoRotate = animation.autoRotate;
            animation.autoRotate = false;

            this.dragging = true;
            this.dragStartPos = event.data.getLocalPosition(this.parent);

            this.data.previousPosition = {
                x: this.x,
                y: this.y
            }
        }

        draggableOverlay.onDragMove = function() {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.x = newPosition.x - this.dragStartPos.x;
                this.y = newPosition.y - this.dragStartPos.y;

                Grid.rotate((this.data.previousPosition.x - this.x) / 100, (this.data.previousPosition.y - this.y) / 100);

                this.data.previousPosition = {
                    x: this.x,
                    y: this.y
                };
            }
        }

        draggableOverlay.onDragEnd = function() {
            animation.autoRotate = this.data.autoRotate;
            this.dragging = false;
            this.data = null;
            this.x = 0;
            this.y = 0;
        }

        draggableOverlay.on('pointerdown', draggableOverlay.onDragStart)
        .on('pointerup', draggableOverlay.onDragEnd)
        .on('pointermove', draggableOverlay.onDragMove);

        animation.scene.addChild(draggableOverlay);

        var SIZE = 3;
        for (var x = 0; x < SIZE; x++) {
            for (var y = 0; y < SIZE; y++) {
                for (var z = 0; z < SIZE; z++) {
                    var s = Sphere(
                        (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                        (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                        (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                    );
                    objectsToDraw.push(s);
                    animation.scene.addChild(s.Graphics);

                    if (x != SIZE - 1)
                    {
                        var lx = Line(
                            ddd.Vector(
                                (x+1 + ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+2 - ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(lx);
                        animation.scene.addChild(lx.Graphics);
                    }

                    if (y != SIZE - 1)
                    {
                        var ly = Line(
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1 + ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+2 - ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(ly);
                        animation.scene.addChild(ly.Graphics);
                    }

                    if (z != SIZE - 1)
                    {
                        var lz = Line(
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+1 + ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            ),
                            ddd.Vector(
                                (x+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (y+1) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP),
                                (z+2 - ((SPHERE_SIZE/2) / SPHERE_GAP) * 0.9) * SPHERE_GAP - (0.5 * SIZE * SPHERE_GAP) - (0.5 * SPHERE_GAP)
                            )
                        );

                        objectsToDraw.push(lz);
                        animation.scene.addChild(lz.Graphics);
                    }
                }
            }
        }
    }

    var renderStart, renderEnd;

    animation.onRender = function() {

        renderStart = performance.now();

        animation.scene.removeChildren();

        if (animation.autoRotate)
            Grid.rotate(0.003, 0);


        for (var i = objectsToDraw.length - 1; i >= 0; i--) {
            objectsToDraw[i].computeDistanceFromCamera();
        }

        objectsToDraw.sort(function(a, b) {
            return a.distanceFromCamera - b.distanceFromCamera;
        });

        for (var i = objectsToDraw.length - 1; i >= 0; i--) {
            objectsToDraw[i].draw();
            animation.scene.addChild(objectsToDraw[i].Graphics);
        }

        animation.scene.addChild(draggableOverlay);

        renderEnd = performance.now();
        console.log(renderEnd - renderStart);
    }

    animation.settings = [
        controls.Text('Material (does nothing yet)'),
        controls.Select([
            {text: 'Silicon', value: 'silicon'},
            {text: 'Something else', value: 'sth'}
        ], function(val) {}),
        controls.Text('Rotation'),
        controls.Checkbox('Auto rotation', animation.autoRotate, function() {animation.autoRotate = !animation.autoRotate;}),
        controls.Text('Distance'),
        controls.Range(Grid.Position.z, -100, 1, 500, function(val) {Grid.Position.z=val;})
    ];

    return animation;
});