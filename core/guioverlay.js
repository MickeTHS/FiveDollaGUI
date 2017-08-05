var _sel_box = null;

var init_selection_box = function() {
    
    var body = document.getElementsByTagName('body')[0];
    _sel_box = document.createElement('div');
    _sel_box.id = 'sel_box_gui';

    _sel_box.style.opacity = '0.4';
    _sel_box.style['background-color'] = '#ffffff';
    _sel_box.style.border = '1px solid black';
    _sel_box.style.display = 'none';
    _sel_box.style.position = 'absolute';
    _sel_box.style['z-index'] = 99;

    body.appendChild(_sel_box);

}

var selection_box = function(x, y, width, height) {
    _sel_box.style.display = 'block';
    _sel_box.style.left = x+'px';
    _sel_box.style.top = y+'px';
    _sel_box.style.width = width+'px';
    _sel_box.style.height = height+'px';

    console.log('x: ' + x + ' y: ' + y + ' width: ' + width + ' height ' + height);
} 

var close_selection_box = function() {
    _sel_box.style.display = 'none';
}
