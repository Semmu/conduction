define(function() {
    return {
        extend: function(child, parent) // magic function
        {
            hasProp = {}.hasOwnProperty;

            for (var key in parent)
            {
                if (hasProp.call(parent, key))
                    child[key] = parent[key];
            }

            function ctor()
            {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;

            child.prototype = new ctor();

            child.__super__ = parent.prototype;

            return child;
        },

        max: function(a, b)
        {
            return (a > b ? a : b);
        },

        min: function(a, b)
        {
            return (a < b ? a : b);
        },

        randInt: function(max, symmetric)
        {
            return Math.random() * max - (symmetric ? max / 2 : 0);
        }
    };
});