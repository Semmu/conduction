define(['./util'], function(util) {

    var counter = 0;

    var controls = {

        getCounter: function() {
            return counter;
        },

        Control: function() {

            counter++;

            var control = {
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
            control.create = function () {
                return $('<hr>');
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
                    id: 'checkbox_control_' + controls.getCounter()
                });

                button.on('click', callback);

                return button;
            }

            return control;
        },

        Checkbox: function(label, callback) {

            var control = controls.Control();

            control.type = 'checkbox';
            control.label = label;
            control.create = function() {

                var checkbox = $('<input>', {
                    type: 'checkbox',
                    id: 'checkbox_control_' + controls.getCounter()
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

                console.log(options);
                for (var i = 0; i < options.length; i++) {
                    console.log(options[i]);
                    var label = $('<label>');

                    var radiobutton = $('<input>', {
                        type: 'radio',
                        value: options[i].value,
                        name: 'radio_control_' + controls.getCounter(),
                        id: 'radio_control_' + controls.getCounter() + '_option_' + i
                    });

                    label.append(radiobutton);
                    label.append(options[i].label);

                    elements.push(label);
                }

                return elements;

            }

            return control;
        }

    };

    return controls;

});