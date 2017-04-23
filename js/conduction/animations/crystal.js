define(['../util', '../animation_base', '../controls', '../3D'], function(util, animation, controls, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This interactive animation shows the crystal structure of various materials used in microchip manufacturing.";

    /*animation.atomGraphics = new PIXI.Container();
    animation.atoms = [];
    animation.lines = [];*/

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

    var SPHERE_SIZE = 30;

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

            distanceFromCamera: function() {
                return Sphere.getAbsolutePosition().distanceFromCamera();
            },

            draw: function() {
                Sphere.Graphics.clear();

                var absolutePosition = Sphere.getAbsolutePosition();
                var projection = absolutePosition.getProjection();

                Sphere.Graphics.beginFill(Sphere.Color);
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
            From: ddd.Vector(from[0], from[1], from[2]),
            To: ddd.Vector(to[0], to[1], to[2]),

            draw: function() {

                var absoluteFrom = Grid.Position.add(
                    Line.From.transform(
                        Grid.Axes.x,
                        Grid.Axes.y,
                        Grid.Axes.z
                ));
                var absoluteTo = Grid.Position.add(
                    Line.To.transform(
                        Grid.Axes.x,
                        Grid.Axes.y,
                        Grid.Axes.z
                ));

                Line.Graphics.clear();
                Line.Graphics.moveTo(absoluteFrom.getProjection().x, absoluteFrom.getProjection().y);
                Line.Graphics.lineStyle(1, 0x000000, 1);
                Line.Graphics.lineTo(absoluteTo.getProjection().x, absoluteTo.getProjection().y);
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
                        (x+1) * SPHERE_SIZE - (0.5 * SIZE * SPHERE_SIZE) - (0.5 * SPHERE_SIZE),
                        (y+1) * SPHERE_SIZE - (0.5 * SIZE * SPHERE_SIZE) - (0.5 * SPHERE_SIZE),
                        (z+1) * SPHERE_SIZE - (0.5 * SIZE * SPHERE_SIZE) - (0.5 * SPHERE_SIZE)
                    );
                    objectsToDraw.push(s);
                    animation.scene.addChild(s.Graphics);
                }
            }
        }

        /*var poss = [
            [-100, -100, -100],
            [-100, 100, -100],
            [100, 100, -100],
            [100, -100, -100],
            [-100, -100, 100],
            [-100, 100, 100],
            [100, 100, 100],
            [100, -100, 100]
        ];

        for (var i = 0; i < poss.length; i++) {
            var anSphere = Sphere(poss[i][0], poss[i][1], poss[i][2]);
            objectsToDraw.push(anSphere);
            animation.scene.addChild(anSphere.Graphics);
        }/*

        var connections = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],
            [4, 5],
            [5, 6],
            [6, 7],
            [7, 4],
            [4, 0],
            [5, 1],
            [6, 2],
            [7, 3]
        ];

        for (var i = 0; i < connections.length; i++) {
            var aline = Line(poss[connections[i][0]], poss[connections[i][1]]);
            animation.lines.push(aline);
            animation.scene.addChild(aline.Graphics);
        }

        animation.scene.addChild(draggableOverlay);
        animation.scene.addChild(animation.SphereGraphics);*/
    }

    animation.onRender = function() {

        animation.scene.removeChildren();

        if (animation.autoRotate)
            Grid.rotate(0.003, 0);

        objectsToDraw.sort(function(a, b) {
            return a.distanceFromCamera() - b.distanceFromCamera();
        });

        for (var i = objectsToDraw.length - 1; i >= 0; i--) {
            objectsToDraw[i].draw();
            animation.scene.addChild(objectsToDraw[i].Graphics);
        }

        animation.scene.addChild(draggableOverlay);


        /*for (var i = 0; i < animation.Spheres.length; i++) {
            animation.Spheres[i].draw();
        }

        for (var i = 0; i < animation.lines.length; i++) {
            animation.lines[i].draw();
        }*/
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