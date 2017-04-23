define({
    name: "Animation Name",
    description: "A short description of the animation and its available settings.",
    settings: [],

    scene: null,

    setScene: function(s) {
        this.scene = s;
    },

    onLoad: function() {
        console.error("Animation::onLoad() not implemented!");
    },

    onRender: function() {
        console.error("Animation::onRender() not implemented!");
    },

    onUnload: function() {
        console.error("Animation::onUnload() not implemented!");
    },

    unloaded: false
});