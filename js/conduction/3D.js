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

        Vector: function(x, y, z) {

            var vector = {
                x: x,
                y: y,
                z: z,

                length: function() {
                    return Math.sqrt(vector.x * vector.x +
                                     vector.y * vector.y +
                                     vector.z * vector.z);
                },

                setLength: function(length) {
                    var ratio = length / vector.length();

                    vector.x *= ratio;
                    vector.y *= ratio;
                    vector.z *= ratio;

                    return vector;
                },

                add: function(other) {
                    return ddd.Vector(vector.x + other.x,
                                      vector.y + other.y,
                                      vector.z + other.z);
                },

                inverse: function() {
                    return ddd.Vector(-vector.x, -vector.y, -vector.z);
                },

                dotProduct: function(other) {
                    return vector.x * other.x + vector.y * other.y + vector.z * other.z;
                },

                crossProduct: function(other) {
                    return ddd.Vector(vector.y * other.z - vector.z * other.y,
                                      vector.z * other.x - vector.x * other.z,
                                      vector.x * other.y - vector.y * other.x);
                },

                projectionOn: function(other) {
                    var ratio = vector.dotProduct(other) / other.dotProduct(other);
                    return ddd.Vector(other.x * ratio,
                                      other.y * ratio,
                                      other.z * ratio);
                },

                angleTo: function(other) {
                    return Math.acos(vector.dotProduct(other) / vector.length() / other.length());
                },

                rotate: function(axis, angle) {

                    var selfAxisComponent = vector.projectionOn(axis);
                    var selfOrthogonalComponent = vector.add(selfAxisComponent.inverse());

                    var orthogonalOrthogonal = axis.crossProduct(selfOrthogonalComponent);

                    var x = Math.sin(angle) * orthogonalOrthogonal.x + Math.cos(angle) * selfOrthogonalComponent.x + selfAxisComponent.x;
                    var y = Math.sin(angle) * orthogonalOrthogonal.y + Math.cos(angle) * selfOrthogonalComponent.y + selfAxisComponent.y;
                    var z = Math.sin(angle) * orthogonalOrthogonal.z + Math.cos(angle) * selfOrthogonalComponent.z + selfAxisComponent.z;

                    var result = ddd.Vector(x, y, z);
                    result.setLength(vector.length());

                    return result;
                },

                getProjection: function() {

                    var ratio = ddd.Camera.DEPTH / (vector.z + ddd.Camera.DEPTH);

                    return {
                        x: ratio * vector.x,
                        y: -1 * ratio * vector.y
                    }
                },

                log: function() {
                    console.log({
                        x: vector.x,
                        y: vector.y,
                        z: vector.z,
                        length: vector.length()
                    })
                }
            };

            return vector;
        },

        Object: function(x, y, z) {

            var object = {
                Position: ddd.Vector(x, y, z)
            };

            return object;
        }
    };

    return ddd;
});