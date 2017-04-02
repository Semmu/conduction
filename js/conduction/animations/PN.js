define(['../animation_base', '../controls'], function(animation, controls) {


    animation.name = "PN diode";
    animation.description = "A simple animation showing the PN diode and its behaviour.";

    animation.onButtonClicked = function() {
        alert('müxik');
    }

    animation.onLoad = function() {
        console.log("PN onLoad");
    }

    animation.settings = [
        controls.Button('bátön', animation.onButtonClicked),
        controls.Divider(),
        controls.Checkbox('csekk it', function(){alert('x');}),
    ];

    return animation;
});