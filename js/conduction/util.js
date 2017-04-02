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
        },

        // from https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
        slugify: function(text) {
          const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
          const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
          const p = new RegExp(a.split('').join('|'), 'g')

          return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(p, c =>
                b.charAt(a.indexOf(c)))     // Replace special chars
            .replace(/&/g, '-and-')         // Replace & with 'and'
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '')             // Trim - from end of text
        },

        controlId: function(label) {
            return 'control_' + slugify(label)
        }
    };
});