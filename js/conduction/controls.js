define(['./util'], function(util) {

    var controls = {

        Control: function() {
            var control = {
                type: 'none',
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
                    class: 'uk-button uk-width-1-1',
                    text: label
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
                    type: 'checkbox'
                });
                var label = $('<label>', {
                    class: 'uk-width-1-1',
                    style: 'display:block;'
                });

                label.append(checkbox);
                label.append(control.label);

                checkbox.on('change', callback);

                return label;
            }

            return control;
        }

    };

    return controls;

});