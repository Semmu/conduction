define(['../animation_base', '../controls'], function(animation, controls) {

    animation.name = "PN diode";
    animation.description = "A simple animation showing the PN diode and its behaviour.";
    animation.settings = [
        controls.Button('bátön')
    ];

    animation.onLoad = function() {
        console.log("PN onLoad");
    }

    return animation;
});