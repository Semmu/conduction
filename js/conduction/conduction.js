// magic function for OOP goodness
var extend = function(child, parent)
{
    for (var key in parent)
    {
        if (hasProp.call(parent, key))
            child[key] = parent[key];
    }

    function ctor()
    {
        this.constructor = child;
    }

    ctor.prototype = parent.prototype;

    child.prototype = new ctor();

    child.__super__ = parent.prototype;

    return child;
},

// magic function pointer for the magic function above
hasProp = {}.hasOwnProperty;

// utility
function max(a, b)
{
    return (a > b ? a : b);
}

// utility
function min(a, b)
{
    return (a < b ? a : b);
}


// utility
function randInt(max, symmetric)
{
    return Math.random() * max - (symmetric ? max / 2 : 0);
}


// framework "singleton"
var ConductionFramework = (function()
{
    // private vars
    var container = null,
        app = null, // the PIXI Application
        rootScene = null, // the pixi container/"scene" for the animation, gets resized automatically to fit the viewport
        animationInstance = null, // the initialized and running instance

        SCALING_GAP = 0.1; // the gap around the animation's scene


    // private method, just for example
    function privateMethod ()
    {
        // ...
    }

    // public "interface", returned as an object
    return {

        // framework init, creates renderer and appends it
        initialize: function()
        {
            container = $('#animation_container');

            app = new PIXI.Application(
                container.width(),
                container.height(),
                {
                    transparent: true
                }
            );

            rootScene = new PIXI.Container();

            container.append(app.view);
        },

        // function to handle viewport resize and rescale contents
        handleResize: function()
        {
            app.renderer.resize(container.width(), container.height());

            rootScene.scale.set(1, 1);
            rootScene.position.set(app.renderer.width / 2, app.renderer.height / 2);

            var scale = min(app.renderer.width / rootScene.width, app.renderer.height / rootScene.height) * (1 - SCALING_GAP);

            rootScene.scale.set(scale, scale);
        },

        getScene: function()
        {
            return rootScene;
        },

        // framework render, which calls the animation instance to do its thing
        render: function()
        {
            if (animationInstance != null)
            {
                animationInstance.onRender();
                app.renderer.render(rootScene);

                // effective method for animation timing
                requestAnimationFrame(ConductionFramework.render);
            }
        },

        // this sets the animation and generates the UI for the settings
        setAnimation: function(animation_child)
        {
            // previous animation (if any) cleanup
            rootScene.removeChildren();
            animationInstance = animation_child;
            animation_child.scene = this.rootScene;
            // tell the animation to init using the provided scene
            animation_child.initialize(rootScene);

            // basic setup
            $('#animation_title').text(animationInstance.name);
            $('#animation_description').text(animationInstance.description);

            // local shortcut var for the settings DOM container
            var s = $('#animation_settings');

            // cleanup the previous settings
            s.empty();

            // iterate over the animation's settings to generate the UI for them
            $.each(animationInstance.settings, function(index, setting)
            {
                s.append($('<hr>', {
                    class: 'setting_separator'
                }));

                // if the setting type is not a button, we append a label element for it
                if (setting.type != 'button')
                {
                    s.append($('<label>', {
                        text: setting.label + ':',
                        for: 'setting_' + setting.name
                    }));
                }

                var input_element;

                // we generate the corresponding input element for the setting
                switch (setting.type)
                {
                    case 'checkbox':
                        input_element = $('<input>', {
                            type: 'checkbox',
                            id: 'setting_' + setting.name,
                            checked: setting.value
                        });
                    break;

                    case 'number':
                        input_element = $('<input>', {
                            type: 'number',
                            id: 'setting_' + setting.name,
                            class: 'uk-width-1-1',
                            value: setting.value,
                            min: setting.min,
                            max: setting.max
                        });
                    break;

                    case 'range':
                        input_element = $('<input>', {
                            type: 'range',
                            id: 'setting_' + setting.name,
                            class: 'uk-width-1-1',
                            value: setting.value,
                            min: setting.min,
                            max: setting.max
                        });
                    break;

                    case 'button':
                        input_element = $('<button>', {
                            id: 'setting_' + setting.name,
                            class: 'uk-button uk-width-1-1',
                            text: setting.label
                        });
                    break;
                }


                // input event handling hookup
                if (setting.type == 'button')
                {
                    // for the button it is the click event that should be listened on
                    input_element.on('click', function(event) {
                        animationInstance.notifySettingChange(setting.name, true);
                    });
                }
                else
                {
                    // for every other element, it is the change event we should react to
                    input_element.on('change', function(event)
                    {
                        var value = null;

                        // getting the input value, for checkbox it is the checked property
                        if (setting.type == 'checkbox')
                            value = $(event.target).prop('checked');
                        else
                            value = $(event.target).val();

                        // we notify the animation instance by calling its method
                        animationInstance.notifySettingChange(setting.name, value);
                    });
                }

                // append the input element to the settings container
                s.append(input_element);

            }); // end of settings iteration

            // set the execution for the render
            requestAnimationFrame(ConductionFramework.render);
        },

        getAnimation: function()
        {
            return animationInstance;
        }
    };
})();


// handle viewport resize
window.onresize = ConductionFramework.handleResize;

// things to do when the site loaded
$(document).ready(function()
{
    ConductionFramework.initialize();
    ConductionFramework.setAnimation(new PNAnim());
    ConductionFramework.handleResize();
});

Control = (function(){

    function Control()
    {
        this.type = null;
        this.name = null;
        this.label = null;
        this.value = null;
        this.other = {};
    }

    function onInteract()
    {
        // stub method to implement
    }

    return Control;

})();

ButtonControl = (function(superClass){

    extend(ButtonControl, superClass);

    function ButtonControl()
    {
        this.type = properties.type;
        this.name = properties.name;
        this.label = properties.label;
        this.value = properties.value;
        this.disabled = properties.disabled;
    }

    return ButtonControl;

})(Control);

// the parent class for the animations
Animation = (function() {

    // constructor, sets the data variables
    function Animation()
    {
        this.scene = null;
        this.settings = [];
        this.name = "Animation";
        this.description = "Description";
    }

    // stub method for overriding
    Animation.prototype.initialize = function(framework_scene)
    {
        //
    }

    // stub method for overriding
    Animation.prototype.onRender = function()
    {
        //
    }

    // shortcut method for setting registering
    Animation.prototype.registerSetting = function(label, name, type, value, other)
    {
        var setting =
        {
            name: name,
            type: type,
            label: label,
            value: value
        };

        // the other parameter should be an object and we merge it into the setting
        $.extend(setting, other);

        this.settings.push(setting);
    }

    // stub function for overriding, this gets called when the settings UI is poked
    Animation.prototype.notifySettingChange = function(setting_name, value)
    {
        //
    }

    return Animation;

})();

// dumb animation for a semiconduction PN diode
PNAnim = (function(superClass) {

    extend(PNAnim, superClass);

    function PNAnim()
    {
        PNAnim.__super__.constructor.call(this);

        this.name = "PN Diode";
        this.description = "This animation shows the current flow in a PN junction.";
        this.count = 20;
        this.running = true;

        // the 2 settings controls
        this.registerSetting("Start/Stop", "startstop", "button", null, {});
        this.registerSetting("Count", "count", "range", 10, {min: 1, max: 50});

    }

    // we generate a lot of objects and graphics
    PNAnim.prototype.initialize = function(framework_scene)
    {
        this.scene = framework_scene;

        var top_rect = new PIXI.Graphics();
        top_rect.lineStyle(2, 0x000000, 1);
        top_rect.drawRect(-200, -20, 400, 40);
        top_rect.moveTo(0, -20);
        top_rect.lineStyle(1, 0xdddd00, 1);
        top_rect.lineTo(0, 20);

        top_rect.lineStyle(0, 0x000000, 0);
        top_rect.beginFill(0xff0000);
        top_rect.drawRect(-200, -20, 150, 40);

        top_rect.beginFill(0x0000ff);
        top_rect.drawRect(50, -20, 150, 40);

        this.electrons = new PIXI.Container();
        this.holes = new PIXI.Container();

        this.scene.addChild(this.electrons);
        this.scene.addChild(this.holes);

        this.generateParticles();

        this.scene.addChild(top_rect);
    }

    // this generates the blue and red dots
    PNAnim.prototype.generateParticles = function()
    {
        this.electrons.removeChildren();
        this.holes.removeChildren();

        for(i = 0; i < this.count; i++)
        {
            var particle = new PIXI.Graphics();
            particle.beginFill(0x3333ff);
            particle.drawCircle(-50 + randInt(100), -20 + randInt(40), 1);
            this.electrons.addChild(particle);
        }

        for(i = 0; i < this.count; i++)
        {
            var particle = new PIXI.Graphics();
            particle.beginFill(0xff3333);
            particle.drawCircle(-50 + randInt(100), -20 + randInt(40), 1);
            this.holes.addChild(particle);
        }
    }

    // basic animation, moves the particles
    PNAnim.prototype.onRender = function()
    {
        if (!this.running)
            return;

        for (i = 0; i < this.electrons.children.length; i++)
        {
            this.electrons.children[i].position.x -= 0.1;
            if (this.electrons.children[i].position.x < -50)
                this.electrons.children[i].position.x += 100;
        }
        for (i = 0; i < this.holes.children.length; i++)
        {
            this.holes.children[i].position.x += 0.1;
            if (this.holes.children[i].position.x > 50)
                this.holes.children[i].position.x -= 100;
        }
    }

    // debug
    PNAnim.prototype.getE = function()
    {
        return this.electrons;
    }

    // settings change handler
    PNAnim.prototype.notifySettingChange = function(type, value)
    {
        if (type == 'startstop')
            this.running = !this.running;

        if (type == 'count')
        {
            this.count = value;
            this.generateParticles();
        }
    }

    return PNAnim;

})(Animation);


// random animation for showcasing the capabilities of this "framework"
RandomAnim = (function(superClass) {

    extend(RandomAnim, superClass);

    function RandomAnim()
    {
        RandomAnim.__super__.constructor.call(this);

        this.name="Feature Set";
        this.description="Basic showcase of the framework.";
        this.registerSetting("Rotate", "rotate", "button", null, {});
        this.registerSetting("Jiggle", "jiggle", "checkbox", true, {});
        this.registerSetting("Spawn more static things:", "spawn_num", "number", 20, {min: 10, max: 100});
        this.registerSetting("Spawn", "spawn", "button", null, {});
        this.registerSetting("Méret", "size", "range", 10, {min: 1, max: 50});

        this.jiggle = true;
        this.size = 20;
    }

    RandomAnim.prototype.initialize = function(framework_scene)
    {
            this.centercircle = new PIXI.Graphics();
            this.centercircle.beginFill(0x967564);
            this.centercircle.drawCircle(0, 0, this.size);
            framework_scene.addChild(this.centercircle);

        {
            var centercircle = new PIXI.Graphics();
            centercircle.beginFill(0x967564);
            centercircle.drawCircle(500, 500, 20);
            framework_scene.addChild(centercircle);
        }
        {
            var centercircle = new PIXI.Graphics();
            centercircle.beginFill(0x967564);
            centercircle.drawCircle(-500, 500, 20);
            framework_scene.addChild(centercircle);
        }
        {
            var centercircle = new PIXI.Graphics();
            centercircle.beginFill(0x967564);
            centercircle.drawCircle(500, -500, 20);
            framework_scene.addChild(centercircle);
        }
        {
            var centercircle = new PIXI.Graphics();
            centercircle.beginFill(0x967564);
            centercircle.drawCircle(-500, -500, 20);
            framework_scene.addChild(centercircle);
        }

        for (i = 0; i < 30; i++)
        {
            var randSqr = new PIXI.Graphics();
            randSqr.beginFill(0x523786);
            randSqr.drawRect(randInt(1000, true), randInt(1000, true), 20, 20);
            framework_scene.addChild(randSqr);
        }
    }

    RandomAnim.prototype.onRender = function()
    {
        if (this.jiggle)
            this.centercircle.position.set(randInt(20), randInt(20));
    }

    RandomAnim.prototype.notifySettingChange = function(setting_name, value)
    {
        switch (setting_name)
        {
            case 'jiggle':
                this.jiggle = value;
            break;

            case 'spawn':
            {
                for (i = 0; i < $('#setting_spawn_num').val(); i++)
                {
                    var randSqr = new PIXI.Graphics();
                    randSqr.beginFill(0x523786);
                    randSqr.drawRect(randInt(1000, true), randInt(1000, true), 20, 20);
                    ConductionFramework.getScene().addChild(randSqr);
                }
            }
            break;

            case 'size':
            {
                this.size = value / 10;
                this.centercircle.scale.set(this.size, this.size);
            }
            break;

            case 'rotate':
            {
                ConductionFramework.getScene().rotation += Math.PI / 10 / 4;
            }
            break;
        }
    }

   return RandomAnim;

})(Animation);