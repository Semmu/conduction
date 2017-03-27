requirejs.config({
    baseUrl: 'js/vendor',
    paths: {
        conduction: '../conduction'
    }
});

requirejs(['jquery/jquery-2.2.3.min', 'uikit/uikit.min', 'pixi/pixi.min'], function () {
    requirejs(['conduction/conduction_old'], function() {
        alert('everything loaded');
    });
});