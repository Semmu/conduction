define({
    name: "Animation Name",
    description: "A short description of the animation and its available settings.",
    settings: [],

    scene: null,

    setScene: function(s) {
        scene = s;
    },

    onLoad: function() {
        throw new Error("Animation::onLoad() not implemented!");
    },

    onRender: function() {
        throw new Error("Animation::onRender() not implemented!");
    },

    onUnload: function() {
        throw new Error("Animation::onUnload() not implemented!");
    }
});