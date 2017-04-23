define(['../../animation_base', '../../controls'], function(animation, controls) {

    animation.name = "Control Widgets";
    animation.description = "This \"animation\" showcases the available controls which can be used to interact with the animation itself. You can create multiple of them in any combination you need.\n\nWith these, you can trigger events, toggle features, change values, etc.\n\nAll these widgets in this example log to the debug console via their callback functions.";

    var rect = 0;

    animation.onRender = function() {
        rect.rotation += 0.001;
    }

    animation.onLoad = function() {
        var arrow = new PIXI.Graphics();

        arrow.lineStyle(5, 0x00b0fa, 1);
        arrow.moveTo(20, 50);
        arrow.lineTo(70, 0);
        arrow.lineTo(20, -50)
        arrow.moveTo(70, 0);
        arrow.lineTo(-70, 0);

        var bgRect = new PIXI.Graphics();
        bgRect.beginFill(0xffffff);
        bgRect.drawRect(-250, -250, 500, 500);
        bgRect.endFill();

        rect = new PIXI.Graphics();
        rect.beginFill(0xeeeeee);
        rect.drawRect(-230, -230, 460, 460);
        rect.endFill();
        rect.rotation = Math.PI / 2;

        animation.scene.addChild(bgRect);
        animation.scene.addChild(rect);
        animation.scene.addChild(arrow);
    }

    animation.settings = [
        controls.Text('Button:'),
        controls.Button('This is a button.', function() {console.log('Button pressed.');}),
        controls.Divider(),
        controls.Text('Checkbox:'),
        controls.Checkbox('A checkbox for toggling things.', true, function(state){console.log('Checkbox\'s state: ' + state);}),
        controls.Divider(),
        controls.Text('Radiobuttons:'),
        controls.Radio([
            { label: 'Option 1', value: 'one' },
            { label: 'Option 2', value: 'two' },
            { label: 'Option 3', value: 'three' }
        ], function(val) {console.log('Selected radiobutton\'s value: ' + val);}),
        controls.Divider(),
        controls.Text('Range:'),
        controls.Range(5, 0, 1, 10, function(val) { console.log('Range value: ' + val);}),
        controls.Divider(),
        controls.Text('Number:'),
        controls.Number(5, 0, 1, 10, function(val) { console.log('Number value: ' + val);}),
        controls.Divider(),
        controls.Text('Select:'),
        controls.Select([
            {text: 'Option 1', value: 'one'},
            {text: 'Option 2', value: 'two'},
            {text: 'Option 3', value: 'three'},
        ], function(val) {console.log('Selected option: ' + val);})
    ];

    return animation;
});