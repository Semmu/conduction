define(['./util'], function(util) {

    var controls = {

        Control: function() {
            var control = {
                type: 'none',
                name: '',
                callback: null,
                create: function() {
                    throw new Error("Control named '"+control.name+"' of type '"+control.type+"' create() not defined");
                }
            };

            return control;
        },

        Button: function(label) {

            var control = controls.Control();

            control.type = 'button';
            control.name = label;
            control.create = function() {
                element = $('<button>', {
                    class: 'uk-button uk-width-1-1',
                    text: label
                });

                element.on('click', function() {
                    alert('klikkk');
                });

                return element;
            }

            return control;
        }

    };

    return controls;

});