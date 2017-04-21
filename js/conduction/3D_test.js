define(['./3D'], function(ddd) {

    var PRECISION = 0.0000001;

    function r2d(r) {
        return r / Math.PI * 180;
    }

    function d2r(d) {
        return r * Math.PI / 180;
    }

    function TESTING(thing) {
        console.log()
        console.log('TESTING ' + thing);
        console.log('--------------')
    }

    function eq(dbl1, dbl2) {
        return (Math.abs(dbl1 - dbl2) < PRECISION);
    }

    function same(vec1, vec2) {
        return (eq(vec1.x, vec2.x) &&
                eq(vec1.y, vec2.y) &&
                eq(vec1.z, vec2.z));
    }

    function testEq(dbl1, dbl2) {
        if (eq(dbl1, dbl2)) {
            console.log(  '+++ EQUALS:  ' + dbl1 + ' and ' + dbl2);
        } else {
            console.error('!!! DIFFERS: ' + dbl1 + ' and ' + dbl2);
        }
    }

    function testSame(vec1, vec2) {
        if (same(vec1, vec2)) {
            console.log(  '+++ SAME:     vector with length ' + vec1.length() + ' and ' + vec2.length());
        } else {
            console.error('!!! NOT SAME: vector with length ' + vec1.length() + ' and ' + vec2.length())
        }
    }

    TESTING('length');
    testEq(ddd.Vector(1, 0, 0).length(), 1);
    testEq(ddd.Vector(0, 1, 0).length(), 1);
    testEq(ddd.Vector(0, 0, 1).length(), 1);
    testEq(ddd.Vector(1, 1, 1).length(), Math.sqrt(3));
    testEq(ddd.Vector(3, 4, 0).length(), 5);

    TESTING('setLength');
    testEq(ddd.Vector(3, 4, 0).setLength(0.5).length(), 0.5);
    testSame(ddd.Vector(3, 4, 0).setLength(0.5), ddd.Vector(0.3, 0.4, 0));
    testSame(ddd.Vector(1, 1, 1).setLength(Math.sqrt(3) * 2), ddd.Vector(2, 2, 2));

    TESTING('add');
    testSame(ddd.Vector(3, 4, 5).add(ddd.Vector(1, 0, 4)), ddd.Vector(4, 4, 9));
    testSame(ddd.Vector(1, 1, 1).add(ddd.Vector(-4, -2, 9)), ddd.Vector(-3, -1, 10));

    TESTING('inverse');
    testSame(ddd.Vector(1, 2, 3).inverse(), ddd.Vector(-1, -2, -3));
    testSame(ddd.Vector(-1, 0, -4).inverse(), ddd.Vector(1, 0, 4));

    TESTING('inverse and add');
    testSame(ddd.Vector(1, 2, 3).add(ddd.Vector(3, 2, 1).inverse()), ddd.Vector(-2, 0, 2));
    testSame(ddd.Vector(3, 3, 3).add(ddd.Vector(1, 1, 1).inverse()), ddd.Vector(2, 2, 2));

    TESTING('dotProduct');
    testEq(ddd.Vector(1, 1, 1).dotProduct(ddd.Vector(1, 1, 1)), 3);
    testEq(ddd.Vector(1, 2, 3).dotProduct(ddd.Vector(-4, -5, -6)), -32);

    TESTING('crossProduct');
    testSame(ddd.Vector(1, 2, 3).crossProduct(ddd.Vector(1, 2, 3)), ddd.Vector(0, 0, 0));
    testSame(ddd.Vector(1, 2, 3).crossProduct(ddd.Vector(0, 0, 0)), ddd.Vector(0, 0, 0));
    testSame(ddd.Vector(0, 2, 0).crossProduct(ddd.Vector(0, 0, 2)), ddd.Vector(4, 0, 0));
    testSame(ddd.Vector(2, 0, 0).crossProduct(ddd.Vector(0, 2, -2)), ddd.Vector(0, 4, 4));
    testSame(ddd.Vector(1, 0, 1).crossProduct(ddd.Vector(1, 0, -1)), ddd.Vector(0, 2, 0));

    TESTING('projectionOn');
    testSame(ddd.Vector(0, 1, 1).projectionOn(ddd.Vector(0, 0, 4)), ddd.Vector(0, 0, 1));
    testSame(ddd.Vector(1, 1, 1).projectionOn(ddd.Vector(-5, 0, -5)), ddd.Vector(1, 0, 1));
    testSame(ddd.Vector(1, 0, 1).projectionOn(ddd.Vector(0, 3, 0)), ddd.Vector(0, 0, 0));

    TESTING('angleTo');
    testEq(ddd.Vector(-2, 0, 2).angleTo(ddd.Vector(3, 0, 3)), Math.PI / 2);
    testEq(ddd.Vector(4, 0, 4).angleTo(ddd.Vector(-5, 0, 5)), Math.PI / 2);
    testEq(ddd.Vector(3, 0, 3).angleTo(ddd.Vector(7, 0, 7)), 0);
    testEq(ddd.Vector(5, 0, 0).angleTo(ddd.Vector(-6, 0, 0)), Math.PI);

    TESTING('rotate');
    testSame(ddd.Vector(0, 0, 2).rotate(ddd.Vector(0, 2, 0), Math.PI/2), ddd.Vector(2, 0, 0));
    testSame(ddd.Vector(2, 2, 2).rotate(ddd.Vector(3, 0, -3), Math.PI), ddd.Vector(-2, -2, -2));
    testSame(ddd.Vector(1, 2, 3).rotate(ddd.Vector(1, 2, 3), Math.PI), ddd.Vector(1, 2, 3));
    testSame(ddd.Vector(1, 2, 3).rotate(ddd.Vector(1, 2, 3), 0), ddd.Vector(1, 2, 3));

    TESTING('distanceFromCamera');
    testEq(ddd.Vector(0, 0, 0).distanceFromCamera(), 10);
    testEq(ddd.Vector(0, 10, 10).distanceFromCamera(), Math.sqrt(500));
    testEq(ddd.Vector(0, 0, -10).distanceFromCamera(), 0);
});