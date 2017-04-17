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
        Atom.Graphics.drawCircle(Atom.Object.getProjectedPosition().x, Atom.Object.getProjectedPosition().y, ddd.getProjectedDistance(10, Atom.Object.getPosition().z));
        Atom.Graphics.endFill();

        return Atom;
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
            [100, 100, 20],
            [-100, -100, 0],
            [-100, 100, 0],
            [100, 100, 0],
            [100, -100, 0]
        ];

        for (var i = 0; i < poss.length; i++) {
            var anatom = Atom(poss[i][0], poss[i][1], poss[i][2]);
            animation.atoms.addChild(anatom.Graphics);
        }

        animation.scene.addChild(draggableOverlay);
        animation.scene.addChild(animation.atoms);
    }

    animation.onRender = function() {
    }

    return animation;
});