define(['./util'], function(util) {

    var counter = 0;

    var controls = {

        Control: function() {

            counter++;

            var control = {
                counter: counter,
                type: 'none',
                name: 'undefined',
                label: '',
                create: function() {
                    throw new Error("Control named '"+control.label+"' of type '"+control.type+"' create() not defined");
                }
            };

            return control;
        },

        Divider: function() {

            var control = controls.Control();

            control.type = 'divider';
            control.name = 'divider';
            control.label = '';
            control.create = function() {
                return $('<hr>');
            }

            return control;

        },

        Text: function(text) {

            var control = controls.Control();

            control.type = 'text';
            control.name = '';
            control.label = '';
            control.create = function() {
                return $('<p>', {
                    text: text
                });
            }

            return control;

        },

        Button: function(label, callback) {

            var control = controls.Control();

            control.type = 'button';
            control.label = label;
            control.create = function() {
                var button = $('<button>', {
                    type: 'button',
                    class: 'uk-button uk-width-1-1',
                    text: label,
                    id: 'checkbox_control_' + control.counter
                });

                button.on('click', callback);

                return button;
            }

            return control;
        },

        Checkbox: function(label, checked, callback) {

            var control = controls.Control();

            control.type = 'checkbox';
            control.label = label;
            control.create = function() {

                var checkbox = $('<input>', {
                    type: 'checkbox',
                    checked: checked,
                    id: 'checkbox_control_' + control.counter
                });
                var label = $('<label>');

                label.append(checkbox);
                label.append(control.label);

                checkbox.on('change', callback);

                return label;
            }

            return control;
        },

        Radio: function(options, callback) {

            var control = controls.Control();

            control.type = 'radio';
            control.create = function () {

                var elements = [];

                for (var i = 0; i < options.length; i++) {
                    var label = $('<label>');

                    var radiobutton = $('<input>', {
                        type: 'radio',
                        value: options[i].value,
                        checked: (i == 0 ? true : false),
                        name: 'radio_control_' + control.counter,
                        id: 'radio_control_' + control.counter + '_option_' + i
                    });

                    radiobutton.on('change', callback);

                    label.append(radiobutton);
                    label.append(options[i].label);

                    elements.push(label);
                }

                return elements;

            }

            return control;
        },

        Range: function(value, min, step, max, callback) {

            var control = controls.Control();

            control.type = 'range';
            control.create = function() {
                var range = $('<input>', {
                    type: 'range',
                    value: value,
                    min: min,
                    max: max,
                    step: step
                });

                range.on('change', callback);

                return range;
            }

            return control;

        }

    };

    return controls;

});