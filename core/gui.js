/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 
 */

var _global_gui_id = 0;

var _gui_containers = [];
  
var on_mouse_over = function(event, canvas) {
    console.log('on mouse over');

    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = true;
    }
}

var on_mouse_out = function(event, canvas) {
    console.log('on mouse out');

    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = false;
    }
}

var on_mouse_move = function(event, canvas) {
    console.log('on mouse move');

    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();

        g.mousemove(event.clientX - rect.left, event.clientY - rect.top);
    }
}

var on_mouse_down = function(event, canvas) {
    console.log('on mouse move');

    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();

        g.mousedown(event.clientX - rect.left, event.clientY - rect.top);
    }
}

var on_mouse_up = function(event, canvas) {
    console.log('on mouse move');

    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();

        g.mouseup(event.clientX - rect.left, event.clientY - rect.top);
    }
}


setInterval(function(){
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        
        g.draw('default', true);
    }
}, 1000/30);

/*
//swiping mechanics

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) { // most significant
        if ( xDiff > 0 ) {
            // left swipe
        } else {
            // right swipe
        }                       
    } else {
        if ( yDiff > 0 ) {
            // up swipe
        } else { 
            // down swipe
        }                                                                 
    }
    // reset
    xDown = null;
    yDown = null;                                             
}; */

/**
 * This draws all the nodes in the canvas 
 * There should be only one GUI, so treat it as a singleton
 * 
 * To draw multiple different views, the GUI is divided into "layers"
 * First add_layer to make a new layer
 * And then set_layer before adding nodes you wish to be part of that layer
 * Then you draw supplying your layer name to actually draw the layer
 * 
 * 
 * @class
 */
class GUI {
    /**
     * constructor, needs the html canvas id to draw to
     * Creates a Render_screen
     * 
     * @param {id} canvas_id ID of the canvas element
     * @param {number} quad_division default 8 will create a grid of 8x8 quads for optimization purposes
     */
    constructor(canvas_id, quad_division = 8) {
        _gui_containers.push(this);
        this._canvas_elem = document.getElementById(canvas_id);

        this._width = this._canvas_elem.offsetWidth;
        this._height = this._canvas_elem.offsetHeight;

        this._renderer = new Render_screen(canvas_id, this._width, this._height);
        
        this._canvas_elem.setAttribute('onmouseover', 'on_mouse_over(event, this);');
        this._canvas_elem.setAttribute('onmouseout', 'on_mouse_out(event, this);');
        this._canvas_elem.setAttribute('onmousemove', 'on_mouse_move(event, this);');
        this._canvas_elem.setAttribute('onmousedown', 'on_mouse_down(event, this);');
        this._canvas_elem.setAttribute('onmouseup', 'on_mouse_up(event, this);');

        console.log('gui size: ' + this._width + ', ' + this._height);

        this._dragging = false;
        this._drag_node = 0;
        this._high_node = null;
        
        //some tests
        this._nodes = {};
        this._lines = {};
        this._layer = 'default';
        this._locked = false;
        this._mouse_inside = false;

        this._quads = {};
        this._quad_division = quad_division;

        this._selected_nodes = {};

        this.generate_quads(quad_division);

        this.add_layer(this._layer);
    }


    canvas() {
        return this._canvas_elem;
    }

    /**
     * generates the optimizing quads
     * 
     * @param {number} cols 4 means 4x4 quads = 16
     */
    generate_quads(cols) {
        this._quad_division = cols;
        var x_mul = this._width / cols;
        var y_mul = this._height / cols;

        for (var i = 0; i < cols; ++i) {
            for (var j = 0; j < cols; ++j) {
                var id = j+':'+i;
                this._quads[id] = new GUI_quad(this._renderer, {x: j * x_mul, y: i * y_mul, w: x_mul, h: y_mul}, id);
                this._quads[id].set_bg_color(random_hex_color());
            }
        }
    }

    /**
     * calculates which quads the node should go into
     * 
     * @param {GUI_node} gui_node the gui node to calculate which quad to add to
     */
    calc_quads_for_node(gui_node) {
        var quads = {};

        for (var k in this._quads) {
            var res = this._quads[k].calc_node_inside(gui_node);
            if (res == NODE_FULLY_INSIDE) {
                quads[k] = this._quads[k];
                return quads;
            }
            else if (res == NODE_PARTIALLY_INSIDE) {
                quads[k] = this._quads[k];
            }
        }

        return quads;
    }

    /**
     * Creates and returns a new box
     * 
     * @param {number} x x position in canvas
     * @param {number} y y position in canvas
     * @param {number} width width of box
     * @param {number} height height of box
     * @param {String} caption text to show in the box
     * @param {String} background_color background color
     * @param {number} border border thickness
     * @param {number} border_color border color around the box
     */
    create_box(x, y, width, height, caption = '', background_color = '#000', border = 1, border_color = '#fff') {
        var g = new GUI_node(this._renderer, _global_gui_id++);

        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_background_color(background_color);
        g.set_border_color(border_color);
        g.set_caption(caption);
        g.set_border_thickness(border);
        
        var q = this.calc_quads_for_node(g);

        for (var k in q) {
            q[k].add_node(g);
        }

        g.set_quad_ids(Object.keys(q));

        return g;
    }

    /**
     * Creates and returns a new circle
     * x and y represents the middle of the circle
     * 
     * @param {number} x x position in canvas
     * @param {number} y y position in canvas
     * @param {number} radius radius of the circle
     * @param {String} caption text to show in the circle
     * @param {String} background_color background color
     * @param {number} border border thickness
     * @param {number} border_color border color around the circle
     */
    create_circle(x, y, radius, caption = '', background_color = '#aaaaaa', border = 0.5, border_color = '#000') {
        var g = new GUI_node(this._renderer, _global_gui_id++);

        g.set_shape('circle');
        g.set_pos(x, y);
        g.set_radius(radius);
        g.set_background_color(background_color);
        g.set_border_color(border_color);
        g.set_caption(caption);
        g.set_border_thickness(border);

        var q = this.calc_quads_for_node(g);

        for (var k in q) {
            q.add_node(g);
        }

        g.set_quad_ids(Object.keys(q));

        return g;
    }

    /**
     * @returns {boolean} if mouse is inside the GUI canvas
     */
    is_mouse_inside() {
        return this._mouse_inside;
    }

    /**
     * Add a new layer
     * 
     * @param {String} layer name of the layer
     */
    add_layer(layer) {
        this._nodes[layer] = [];
        this._lines[layer] = [];
    }

    /**
     * Set the layer as active, subsequent calls which interacts with GUI_nodes will be made on the current layer
     * 
     * @param {String} layer layer name
     */
    set_layer(layer) {
        this._layer = layer;
    }

    /**
     * get current layer
     * @returns {String} layer name
     */
    layer() { return this._layer; }

    locked() { return this._locked; }

    lock() {
        this._locked = true;
    }

    unlock() {
        this._locked = false;
    }

    /**
     * Fetches all the GUI nodes in the active layer and stores them in an Array by argument
     * 
     * @param {Array} container the GUI nodes will be stored inside
     */
    fetch_all_gui_nodes(container) {
        for (var i = 0; i < this._nodes[this._layer].length; ++i) {
            this._nodes[this._layer][i].fetch_gui_children(container);

            container.push(this._nodes[this._layer][i]);
        }
    }

    /**
     * adds an icon for internal lookup, must be called before attempting to draw the icon
     * 
     * @param {id} element_id HTML id of the img element
     * @param {String} name name of the icon to be used in subsequent calls to draw it
     */
    add_icon(element_id, name) {
        this._renderer.add_icon(new Rnd_icon(element_id, name));
    }

    /**
     * Get the icon with the given name 
     * 
     * @param {String} name name of the icon
     * @returns {Image} the image 
     */
    icon(name) { return this._renderer.icon(name); }

    /**
     * removes everything from the active layer
     */
    clear_layer() {
        this._nodes[this._layer] = [];
        this._lines[this._layer] = [];
    }

    /**
     * Gets all the GUI nodes in the active layer
     * 
     * @returns {Array<GUI_node>} array of GUI_nodes 
     */
    nodes() {
        return this._nodes[this._layer];
    }

    /**
     * Adds a GUI_node to the active layer
     * 
     * @param {GUI_node} node GUI_node to add
     */
    add_node(node) {
        this._nodes[this._layer].push(node);
    }

    /**
     * Get the renderer for the GUI 
     * 
     * @returns {Render_screen} 
     */
    renderer() {
        return this._renderer;
    }

    /**
     * Draws a line between two GUI_nodes
     * 
     * @param {GUI_node} node1 first node
     * @param {GUI_node} node2 second node
     */
    connect(node1, node2) {
        var line = new GUI_line_2_node(this._renderer);
        line.add_node(node1);
        line.add_node(node2);

        this._lines[this._layer].push(line);
    }

    /**
     * Toggle if we should draw shadows on our elements
     * Warning: heavy operation!
     * 
     * @param {boolean} shadow true or false
     */
    toggle_shadow(shadow) {
        this._renderer.toggle_shadow(shadow);
    }

    /**
     * Are we drawing shadows?
     * 
     * @returns {boolean}
     */
    shadow() {
        return this._renderer.shadow();
    }

    /**
     * Gets the size of the GUI in pixels
     * 
     * @returns {Array<int>} [0 -> width, 1 -> height]
     */
    size() {
        return [this._width, this._height];
    }

    /**
     * Gets the width of the GUI in pixels
     * 
     * @returns {number} width pixels
     */
    width() {
        return this._width;
    }

    /**
     * Gets the height of the GUI in pixels
     * 
     * @returns {number} height pixels
     */
    height() {
        return this._height;
    }

    /**
     * Set the size of the GUI in pixels
     * 
     * @param {number} width 
     * @param {number} height
     */
    resize(width, height) {
        this._width = width;
        this._height = height;

        this._renderer.resize(this._width, this._height);
    }

    /**
     * @param {number} x canvas x position
     * @param {number} y canvas y position
     * 
     * @returns {GUI_grid} the quad at position
     */
    get_quad_at_pos(x, y) {
        var x_mul = Math.round(this._width / this._quad_division);
        var y_mul = Math.round(this._height / this._quad_division);

        var q_x = Math.floor(x / x_mul);
        var q_y = Math.floor(y / y_mul);

        return this._quads[q_x+':'+q_y];
    }

    /**
     * Returns the GUI_node we can find at the given x and y coordinate
     * 
     * @param {number} x
     * @param {number} y
     * @returns {GUI_node} the GUI_node we found, null if nothing
     */
    get_nodes_at_pos(x, y) {

        var q = this.get_quad_at_pos(x, y);

        if (q == null) { return null; }

        var nodes = q.get_nodes_at_pos(x, y);

        return nodes;
    }

    /**
     * marks the GUI_node as changed which will redraw the quad(s) is belongs to
     * 
     * @param {GUI_node} gui_node the node to mark
     */
    mark_changed_node(gui_node) {
        var ids = gui_node.quad_ids();
        for (var i = 0; i < ids.length; ++i) {
            this._quads[ids[i]].set_changed(true);
        }
    }

    /**
     * Sets every node at x and y to be selected (highlighted)
     * 
     * @param {number} x 
     * @param {number} y
     */
    select_nodes_at_pos(x, y) {
        var nodes = this.get_nodes_at_pos(x, y);

        for (var i = 0; i < this._selected_nodes.length; ++i) {
            this._selected_nodes[i].set_selected(false);
            this.mark_changed_node(this._selected_nodes[i]);
        }

        this._selected_nodes = [];

        for (var k in nodes) {
            this._selected_nodes.push(nodes[k]);
            nodes[k].set_selected(true);
            nodes[k].set_mousepos(x,y);
        }

    }

    /**
     * When a mousebutton has been pushed, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y 
     */
    mousedown(x, y) {
        var q = this.get_quad_at_pos(x,y);
        console.log(q.id());

        if (this.locked()) { return; }
        
        if (this._high_node != null) {
            this._high_node.set_highlighted(false);
        }

        var node = this.get_node_at_pos(x,y);

        if (node == null) {
            return;
        }

        this._dragging = true;
        this._drag_node = node;
        this._drag_node.set_selected(true);

        this._high_node = node;
        this._high_node.set_highlighted(true);
    }

    /**
     * When a mousebutton has been released, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y
     */
    mouseup(x, y) {
        if (this.locked()) { return; }
        
        
        this._dragging = false;
        this._drag_node = null;
    }

    /**
     * When the mouse has moved over the GUI, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y 
     */
    mousemove(x, y) {
        
        if (this.locked()) { return; }

        if (!this._dragging) {
            this.select_nodes_at_pos(x, y);
            return;
        }

        if (this._drag_node != null && this._drag_node.draggable()) {
            this._drag_node.set_pos(x,y,true);
        }
    }

    
    /**
     * @param {String} layer name of the layer to draw
     * @param {boolean} [swap=true] if we should swap buffer or not
     */
    draw(layer = 'default', swap = true) {

        for (var k in this._quads) {
            
            this._quads[k].draw(layer, true);
            
        }
/*
        //draw lines first
        for (var i = 0; i < this._lines[layer].length; ++i) {
            this._lines[layer][i].draw();
        }
        
        var later_nodes = [];

        // now draw nodes
        for (var i = 0; i < this._nodes[layer].length; ++i) {
            var later = this._nodes[layer][i].draw();
            if (later != null) {
                later_nodes.push(later);
            }
        }
        for (var i = 0; i < later_nodes.length; ++i) {
            later_nodes[i].draw(false);
        }

        if (swap) {
            this._renderer.swap_buffer();
        }*/
    }

    /**
     * Prints info about the GUI
     */
    print() {
        console.log("GUI, num nodes: " + this._nodes[this._layer].length);
    }
};

