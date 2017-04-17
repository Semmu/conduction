define(['./util'], function(util) {

    var ddd = {
        Camera: {
            DEPTH: 10,
            WIDTH: 50,
            HEIGHT: 50
        },

        getProjectedDistance: function(length, distance) {
            var ratio = ddd.Camera.DEPTH / (distance + ddd.Camera.DEPTH);

            return length * ratio;
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

                    var ratio = ddd.Camera.DEPTH / (object.z + ddd.Camera.DEPTH);

                    return {
                        x: ratio * object.x,
                        y: -1 * ratio * object.y
                    }
                }
            };

            return object;
        }
    };

    return ddd;
});