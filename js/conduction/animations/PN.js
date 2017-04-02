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
        controls.Text('Gombok:'),
        controls.Button('gomb 1', function() {alert('btn1');}),
        controls.Button('bomg 2', function() {alert('btn 2');}),
        controls.Divider(),
        controls.Text('Csekbokszok:'),
        controls.Checkbox('csekk it', true, function(){alert('checkbox');}),
        controls.Checkbox('csekk ezt is', true, function(){alert('chkbx 2');}),
        controls.Divider(),
        controls.Text('Szólarádiók:'),
        controls.Radio([
            { label: 'első', value: 'elso' },
            { label: 'HÁROM', value: 'tevagyazen' },
        ], function() {alert('r1');}),
        controls.Radio([
            { label: 'a', value: '1' },
            { label: 'b', value: '2' },
            { label: 'c', value: '3' },
            { label: 'd', value: '4' },
            { label: 'e', value: '5' }
        ], function() {alert('r2');}),
        controls.Divider(),
        controls.Text('Réndzsek:'),
        controls.Range(5, 0, 1, 10, function() { alert('range 1');}),
        controls.Range(5, -5, 0.1, 15, function() { alert('range 2');})
    ];

    return animation;
});