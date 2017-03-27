define(['./util'], function(util) {

    var container = null,
        pixiApp = null,
        rootScene = null,
        animationModule = null,

        SCALING_GAP = 0.1;

    return {
        initialize: function()
        {
            container = $('#animation_container');

            pixiApp = new PIXI.Application(
                container.width(),
                container.height(),
                {
                    transparent: true
                }
            );

            rootScene = new PIXI.Container();

            container.append(pixiApp.view);
        },

        handleResize: function()
        {
            pixiApp.renderer.resize(container.width(), container.height());

            rootScene.scale.set(1, 1);
            rootScene.position.set(pixiApp.renderer.width / 2, pixiApp.renderer.height / 2);

            var scale = util.min(pixiApp.renderer.width / rootScene.width, pixiApp.renderer.height / rootScene.height) * (1 - SCALING_GAP);

            rootScene.scale.set(scale, scale);
        },
    };

});