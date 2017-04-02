define(['./util'], function(util) {

    var container = null,
        pixiApp = null,
        rootScene = null,
        animationModule = null,

        SCALING_GAP = 0.1;

    var functions = {
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

            for (var i = animations.length - 1; i >= 0; i--)
            {
                var option = document.createElement('option');
                option.value = animations[i].file;
                option.innerHTML = animations[i].name;
                document.getElementById('animation_select').appendChild(option);
            }

            functions.handleResize(); // to set the correct size
        },

        handleResize: function()
        {
            pixiApp.renderer.resize(container.width(), container.height());

            rootScene.scale.set(1, 1);
            rootScene.position.set(pixiApp.renderer.width / 2, pixiApp.renderer.height / 2);

            var scale = util.min(pixiApp.renderer.width / rootScene.width, pixiApp.renderer.height / rootScene.height) * (1 - SCALING_GAP);

            rootScene.scale.set(scale, scale);
        },

        loadAnimation: function(name)
        {
            require(['conduction/animations/' + name], function(animation) {
                animationModule = animation;
                functions.initializeAnimation();
            });

            // to force reload the sources every time we switch animation
            // otherwise we wouldn't have clean state for the animation_base
            require.undef('conduction/animations/' + name);
            require.undef('conduction/animation_base');
        },

        initializeAnimation: function()
        {
            $('#animation_title').text(animationModule.name);
            $('#animation_description').text(animationModule.description);

            $('#animation_settings').empty();
            $.each(animationModule.settings, function(i, control) {
                $('#animation_settings').append(control.create());
            });
        }
    };

    return functions;
});