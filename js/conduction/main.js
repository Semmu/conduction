define(['./util'], function(util) {

    var DOMcontainer = null,
        pixiApp = null,
        rootScene = null,
        animationModule = null,

        SCALING_GAP = 0.1;

    var functions = {

        render: function()
        {
            if (animationModule != null && !animationModule.unloaded)
            {
                animationModule.onRender();
            }
        },

        initialize: function()
        {
            DOMcontainer = $('#animation_container');

            pixiApp = new PIXI.Application(
                DOMcontainer.width(),
                DOMcontainer.height(),
                {
                    transparent: true,
                    antialias: true
                }
            );

            rootScene = new PIXI.Container();
            pixiApp.stage.addChild(rootScene);
            DOMcontainer.append(pixiApp.view);
            $(pixiApp.view).addClass('uk-vertical-align-middle');

            animations = $.merge([{ name: '', file: 'nothing' }], animations);
            functions.loadAnimation(animations[1].file);

            for (var i = 0; i < animations.length; i++)
            {
                $('#animation_select').append($('<option>', {
                    text: animations[i].name,
                    value: animations[i].file
                }));
            }

            pixiApp.ticker.add(functions.render);
        },

        handleResize: function()
        {
            pixiApp.renderer.resize(DOMcontainer.width(), DOMcontainer.height());

            rootScene.scale.set(1, 1);
            rootScene.position.set(pixiApp.renderer.width / 2, pixiApp.renderer.height / 2);

            var scale = util.min(pixiApp.renderer.width / rootScene.width, pixiApp.renderer.height / rootScene.height) * (1 - SCALING_GAP);

            rootScene.scale.set(scale, scale);
        },

        loadAnimation: function(name)
        {
            if (animationModule != null)
                animationModule.unloaded = true;

            $('#animation_title').empty();
            $('#animation_description').empty();
            $('#animation_settings').empty();

            rootScene.removeChildren();

            require(['conduction/animations/' + name], function(animation) {
                animationModule = animation;
                functions.initializeAnimation();
                $('#animation_select').val(name);
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

                var wrapper = $('<div>', {
                    class: 'control_wrapper'
                });

                wrapper.append(control.create());

                $('#animation_settings').append(wrapper);
            });

            animationModule.setScene(rootScene);
            animationModule.onLoad();

            functions.handleResize();
        }
    };

    return functions;
});