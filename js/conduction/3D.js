define(['util'], function(util) {

    var ddd = {
        Camera: {
            DEPTH: 0.5,
            WIDTH: 500,
            HEIGHT: 500
        },

        Object: function(x, y, z) {

            var object = {
                x: x,
                y: y,
                z: z,

                getPosition: function() {
                    return {
                        x: object.x,
                        y: object.y,
                        z: object.z
                    };
                },

                getProjectedPosition: function() {
                    return {
                        x: Camera.DEPTH * object.x / ( object.z + object.depth) + WIDTH,
                        y: -1 * Camera.DEPTH * object.x / ( object.z + object.depth) + HEIGHT
                    }
                }
            };

            return object;
        }
    };

    return ddd;
});