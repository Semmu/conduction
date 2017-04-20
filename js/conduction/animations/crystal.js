define(['../util', '../animation_base', '../3D'], function(util, animation, ddd) {

    animation.name = "Crystal Structure";
    animation.description = "This interactive animation shows the crystal structure of various materials used in microchip manufacturing.";

    animation.atoms = new PIXI.Container();

    var Atom = function(x, y, z) {

        var Atom = {
            Graphics: new PIXI.Graphics(),
            Object: ddd.Object(x, y, z),
            Color: util.randInt(0xffffff)
        };

        Atom.Graphics.beginFill(Atom.Color);
        Atom.Graphics.drawCircle(Atom.Object.Position.getProjection().x, Atom.Object.Position.getProjection().y, ddd.getProjectedDistance(10, Atom.Object.Position.z));
        Atom.Graphics.endFill();

        return Atom;
    }

    var Line = function(from, to) {

        var Line = {
            Graphics: new PIXI.Graphics(),
            From: ddd.Object(from[0], from[1], from[2]),
            To: ddd.Object(to[0], to[1], to[2]),

            draw: function() {

                var projectedFrom = Line.From.Position.getProjection();
                var projectedTo = Line.To.Position.getProjection();

                Line.Graphics.clear();
                Line.Graphics.moveTo(projectedFrom.x, projectedFrom.y);
                Line.Graphics.lineStyle(1, 0x000000, 1);
                Line.Graphics.lineTo(projectedTo.x, projectedTo.y);
            }
        };

        Line.draw();

        return Line;

    }

    animation.onLoad = function() {
        var draggableOverlay = new PIXI.Graphics();
        draggableOverlay.beginFill(0xf6f5a4);
        draggableOverlay.drawRect(-50, -50, 100, 100);
        draggableOverlay.endFill();
        draggableOverlay.interactive = true;
        draggableOverlay.alpha = 0.3;

        draggableOverlay.onDragStart = function(event) {
            this.dragStartPos = event.data.getLocalPosition(this.parent);
            this.data = event.data;
            this.alpha = 1;
            this.dragging = true;
        }

        draggableOverlay.onDragEnd = function() {
            this.alpha = 0.3;
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
            }
        }

        draggableOverlay.on('pointerdown', draggableOverlay.onDragStart)
        .on('pointerup', draggableOverlay.onDragEnd)
        .on('pointerupoutside', draggableOverlay.onDragEnd)
        .on('pointermove', draggableOverlay.onDragMove);

        var poss = [
            [-100, -100, 0],
            [-100, 100, 0],
            [100, 100, 0],
            [100, -100, 0],
            [-100, -100, 20],
            [-100, 100, 20],
            [100, 100, 20],
            [100, -100, 20]
        ];

        for (var i = 0; i < poss.length; i++) {
            var anatom = Atom(poss[i][0], poss[i][1], poss[i][2]);
            animation.atoms.addChild(anatom.Graphics);
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
            animation.scene.addChild(aline.Graphics);
        }


        animation.scene.addChild(draggableOverlay);
        animation.scene.addChild(animation.atoms);
    }

    animation.onRender = function() {
    }

    return animation;
});