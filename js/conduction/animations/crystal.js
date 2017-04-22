define(['../util', '../animation_base', '../controls', '../3D'], function(util, animation, controls, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This interactive animation shows the crystal structure of various materials used in microchip manufacturing.";

    animation.atomGraphics = new PIXI.Container();
    animation.atoms = [];
    animation.lines = [];

    animation.autoRotate = true;

    var Grid = {
        Position: ddd.Vector(0, 0, 40),
        Axes: {
            x: ddd.Vector(1, 0, 0),
            y: ddd.Vector(0, 1, 0),
            z: ddd.Vector(0, 0, 1)
        },
        Rotation: {
            flat: 0.0,
            lean: 0.0
        }
    };

    var Atom = function(x, y, z) {

        var Atom = {
            Graphics: new PIXI.Graphics(),
            Object: ddd.Object(x, y, z),
            Color: util.randInt(0xffffff),

            draw: function() {

                Atom.Graphics.clear();

                var absolutePosition = Grid.Position.add(
                    Atom.Object.Position.transform(
                        Grid.Axes.x,
                        Grid.Axes.y,
                        Grid.Axes.z
                ));

                Atom.Graphics.beginFill(Atom.Color);
                Atom.Graphics.drawCircle(absolutePosition.getProjection().x, absolutePosition.getProjection().y, ddd.getProjectedDistance(10, absolutePosition.z));
                Atom.Graphics.endFill();
            }
        };

        Atom.draw();

        return Atom;
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

    animation.onLoad = function() {
        var draggableOverlay = new PIXI.Graphics();
        draggableOverlay.beginFill(0xf6f5a4);
        draggableOverlay.drawRect(ddd.Camera.WIDTH / -2, ddd.Camera.HEIGHT / -2, ddd.Camera.WIDTH, ddd.Camera.HEIGHT);
        draggableOverlay.endFill();
        draggableOverlay.interactive = true;
        draggableOverlay.alpha = 0;

        draggableOverlay.onDragStart = function(event) {
            this.dragStartPos = event.data.getLocalPosition(this.parent);
            this.data = event.data;
            this.dragging = true;
            this.data.rotation = {
                flat: Grid.Rotation.flat,
                lean: Grid.Rotation.lean
            };
            this.data.autoRotate = animation.autoRotate;
            animation.autoRotate = false;
        }

        draggableOverlay.onDragEnd = function() {
            animation.autoRotate = this.data.autoRotate;
            this.data = null;
            this.dragging = false;
            this.x = 0;
            this.y = 0;
        }

        draggableOverlay.onDragMove = function() {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.x = newPosition.x -this.dragStartPos.x;
                this.y = newPosition.y -this.dragStartPos.y;

                Grid.Rotation.flat = this.data.rotation.flat + this.x / -100;
                Grid.Rotation.lean = this.data.rotation.lean + this.y / -100;
            }
        }

        draggableOverlay.on('pointerdown', draggableOverlay.onDragStart)
        .on('pointerup', draggableOverlay.onDragEnd)
        .on('pointermove', draggableOverlay.onDragMove);

        var poss = [
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
            var anatom = Atom(poss[i][0], poss[i][1], poss[i][2]);
            animation.atoms.push(anatom);
            animation.atomGraphics.addChild(anatom.Graphics);
        }

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
        animation.scene.addChild(animation.atomGraphics);
    }

    animation.onRender = function() {

        if (animation.autoRotate)
            Grid.Rotation.flat -= 0.003;

        Grid.Axes.x = ddd.Vector(1, 0, 0).rotate(ddd.Vector(0, 1, 0), Grid.Rotation.flat);
        Grid.Axes.y = ddd.Vector(0, 1, 0);
        Grid.Axes.z = ddd.Vector(0, 0, 1).rotate(ddd.Vector(0, 1, 0), Grid.Rotation.flat);

        Grid.Axes.y = Grid.Axes.y.rotate(Grid.Axes.x, Grid.Rotation.lean);
        Grid.Axes.z = Grid.Axes.z.rotate(Grid.Axes.x, Grid.Rotation.lean);

        for (var i = 0; i < animation.atoms.length; i++) {
            animation.atoms[i].draw();
        }

        for (var i = 0; i < animation.lines.length; i++) {
            animation.lines[i].draw();
        }
    }

    animation.settings = [
        controls.Text('Material (does nothing yet)'),
        controls.Select([
            {text: 'Silicon', value: 'silicon'},
            {text: 'Something else', value: 'sth'}
        ], function(val) {}),
        controls.Text('Rotation'),
        controls.Button('Toggle auto rotation', function() {animation.autoRotate = !animation.autoRotate;}),
    ];

    return animation;
});