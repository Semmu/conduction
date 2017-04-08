define(['../util', '../animation_base'], function(util, animation) {

    animation.name = "Crystal Structure";
    animation.description = "This interactive animation shows the crystal structure of various materials used in microchip manufacturing.";

    animation.atoms = new PIXI.Container();

    var SpatialObject = function() {

        var SpatialObject = {
            x: 0,
            y: 0,
            z: 0,

            getPosition: function() {
                return {
                    x: SpatialObject.x,
                    y: SpatialObject.y,
                    z: SpatialObject.z
                }
            }
        };

        return SpatialObject;
    };

    var Atom = function(x, y) {

        var Atom = SpatialObject();

        Atom.Graphics = new PIXI.Graphics();

        Atom.Graphics.beginFill(0x9966FF);
        Atom.Graphics.drawCircle(x, y, 10);
        Atom.Graphics.endFill();

        return Atom;
    }

    animation.onLoad = function() {
        var draggableOverlay = new PIXI.Graphics();
        draggableOverlay.beginFill(0xf6f5a4);
        draggableOverlay.drawRect(-250, -250, 500, 500);
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

        for (var i = 0; i < 10; i++) {
            var anatom = Atom(util.randInt(500, true), util.randInt(500, true));
            animation.atoms.addChild(anatom.Graphics);
        }

        animation.scene.addChild(draggableOverlay);
        animation.scene.addChild(animation.atoms);
    }

    animation.onRender = function() {
    }

    return animation;
});