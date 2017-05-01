define(['../animation_base', '../controls'], function(animation, controls) {

    animation.name = 'PN junction diode under bias';
    animation.description = 'This interactive animation shows a band diagram for a PN junction diode under bias.';

    var settings = {
        voltage: 0.0,

        leakage: true,
        injection: true,
        recombination: true,

        electrons: true,
        holes: true
    };

    var callbacks = {
        setVoltage: function(val) {
            console.log('voltage changed to ' + val);
        },

        setLeakage: function(val) {
            console.log('leakage set to ' + val);
        },

        setInjection: function(val) {
            console.log('injection set to ' + val);
        },

        setRecombination: function(val) {
            console.log('recombination set to ' + val);
        },

        setElectrons: function(val) {
            console.log('electrons set to ' + val);
        },

        setHoles: function(val) {
            console.log('holes set to ' + val);
        }
    };

    animation.settings = [
        controls.Text('Voltage'),
        controls.Range(settings.voltage, -5, 0.1, 5, callbacks.setVoltage),
        controls.Text('Particle types'),
        controls.Checkbox('Electrons', settings.electrons, callbacks.setElectrons),
        controls.Checkbox('Holes', settings.holes, callbacks.setHoles),
        controls.Text('Change types'),
        controls.Checkbox('Injections', settings.injection, callbacks.setInjection),
        controls.Checkbox('Leakages', settings.leakage, callbacks.setLeakage),
        controls.Checkbox('Recombinations', settings.recombination, callbacks.setRecombination)
    ];

    return animation;
});