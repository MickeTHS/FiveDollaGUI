/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 
 */




/* class for drawing a line between two GUI_nodes */

class GUI_line_2_node 
{
    constructor(renderobj) {
        this._renderer = renderobj;
        this._nodes = [];
        this._num_nodes = 0;
        this._thickness = 0.5;
        this._line_color = '#222222';
    }

    add_node(node) {
        this._nodes[this._num_nodes++] = node;
    }

    set_line_color(color) {
        this._line_color = color;
    }

    set_stroke_color(color) {
        this._stroke_color;
    }

    set_thickness(pixels) {
        this._thickness = pixels;
    }

    draw() {
        if (this._num_nodes < 2) {
            return;
        }

        var fx = this._nodes[0].x();
        var fy = this._nodes[0].y();

        var tx = this._nodes[1].x();
        var ty = this._nodes[1].y();

        if (this._nodes[0].shape() == 'square') {
            fx += this._nodes[0].width() / 2;
            fy += this._nodes[0].height() / 2;
        }
        if (this._nodes[1].shape() == 'square') {
            tx += this._nodes[1].width() / 2;
            ty += this._nodes[1].height() / 2;
        }

        this._renderer.draw_line(fx, fy, tx, ty, this._thickness, this._line_color);
    }
};

/*
    A simple container class for all objects presented on the drawing canvas

    this class will:

    + draw guinodes
    + allow for users to select color
    + mouseover animate
    + move guinodes
 */

class GUI_node 
{
    constructor(renderobj) {
		this._renderer       = renderobj;
        this._selected       = false;
        this._icons          = [];
        this._border_color   = '#dedede';
        this._border_thickness = 1;
        this._background_color = '#000000';
        this._icon_color     = '#000000';
        this._caption_color  = '#ffffff';
        this._shape          = 'square';
        this._px             = 0;
        this._py             = 0;
        this._caption        = '';
        this._width          = 16;
        this._height         = 16;
        this._radius         = 8;
        this._text_autohide  = false;
        this._got_focus      = false;
        this._draggable      = false;
        this._icon_scale     = 1.0;
        this._font_size      = 14;
        this._font           = 'Bitstream2';
        this._icon_x_offset  = 0;
        this._icon_y_offset  = 0;
        this._hit_test       = true;
        this._on_click       = 0;
        this._hostname       = 0;
        this._mx             = 0;
        this._my             = 0;
        this._indicator_color = null;
        this._highlighted    = false;
        this._highlightable  = true;
        this._static_color   = false;
	}

    set_static_color(st) { this._static_color = st; }
    static_color() { return this._static_color; }
    print() {
        console.log('GUI_node: ' + this._caption);
    }

    font() { return this._font; }
    font_size() { return this._font_size; }

    icon_offset() { return [this._icon_x_offset, this._icon_y_offset]; }

    x() { return this._px; }
    y() { return this._py; }

    autohidden_caption() { return this._text_autohide; }
    selected() { return this._selected; }
    caption_color() { return this._text_color; }
    caption() { return this._caption; }
    width() { return this._width; }
    height() { return this._height; }
    radius() { return this._width / 2.0; }
    rect() { return [this._px, this._py, this._width, this._height]; }
    radius() { return this._radius; }
    icons() { return this._icons; }
    is_box() { return false; }
    has_hit_test() { return this._hit_test; }
    shape() { return this._shape; }
    draggable() { return this._draggable; }
    corner_color() { return this._corner_color; }
    set_mousepos(x, y) { this._mx = x; this._my = y; }
    indicator_color() { return this._indicator_color; }

    set_font(font) {
        this._font = font;
    }
    
    /**
     * Register the callback to happen when the node has been clicked on
     * 
     * @param {function} func the callback function
     */
    on_click(func) { 
        this._on_click = func; 
    }

    /**
     * There are no children for GUI_nodes, this is only needed because GUI_box and GUI_node can be in the same arrays
     * 
     * @param {Array<undefined>} container 
     */
    fetch_gui_children(container) {
        //we dont have children here, so dont do anything
    }

    /**
     * Sets the upper left corner to display a little triangle with the given color
     * 
     * @param {String} color the color as RGB
     */
    set_indicator_color(color) {
        this._indicator_color = color;
    }

    /**
     * Set to true if you want the node to be draggable
     * 
     * @param {boolean} draggable true or false
     */
    set_draggable(draggable) {
        this._draggable = draggable;
    }

    /**
     * Set to true if we want this node to be selectable and highlightable
     * 
     * @param {boolean} test true or false
     */
    set_hit_test(test) {
        this._hit_test = test;
    }

    /**
     * Sets the icon offset if we have an icon on the node
     * 
     * @param {number} x pixels x
     * @param {number} y pixels y
     */
    set_icon_offset(x,y) {
        this._icon_x_offset = x;
        this._icon_y_offset = y;
    }

    /**
     * Sets the font size of the caption display
     * 
     * @param {number} size
     */
    set_font_size(size) {
        this._font_size = size;
    }

    /**
     * Sets the color the caption will have, (deprecated?)
     * 
     * @param {String} color RGB color HEX
     */
    set_caption_color(color) {
        this._caption_color = color;
    }

    /**
     * Sets if we want the node to have its caption hidden whenever the mouse is not over it
     * 
     * @param {boolean} hidden true or false
     */
    set_autohidden_caption(hidden) {
        this._text_autohide = hidden;
    }

    /**
     * Sets the scale of the icon
     * 
     * @param {float} scale
     */
    set_icon_scale(scale) {
        this._icon_scale = scale;
    }

    /**
     * Adds an icon to be displayed side by side of each other
     * 
     * @param {Rnd_icon} icon
     */
    add_icon(icon) {
        this._icons.push(icon);
    }

    /**
     * Sets the color of the icon
     * 
     * @deprecated dont use
     * @param {String} color RGB HEX
     */
    set_icon_color(color) {
        this._icon_color = color;
    }

    /**
     * Sets the background color of the node
     * 
     * @param {String} color RGB HEX
     */
    set_background_color(color) {
        this._background_color = color;
    }

    /**
     * Sets the border color of the node
     * 
     * @param {String} color RGB HEX
     */
    set_border_color(color) {
        this._border_color = color;
    }

    /**
     * Sets the border thickness in pixels
     * 
     * @param {number} thickness 
     */
    set_border_thickness(thickness) {
        this._border_thickness = thickness;
    }

    /**
     * Sets the icon to be a specific shape, default is 'square'
     * 
     * Can also be 'triangle' and 'circle'
     * 
     * @param {String} shape
     */
    set_shape(shape) {
        this._shape = shape;
    }

    /**
     * Set the global position of the node in pixel position in canvas
     * 
     * @param {number} x
     * @param {number} y
     */
    set_pos(x, y) {
        this._px = x;
        this._py = y;
    }

    /**
     * Sets the width of the node in pixels
     * 
     * @param {number} width
     */
    set_width(width) {
        this._width = width;
        this._radius = width/2;
    }

    /**
     * Sets the radius of the circle
     * @param {number} radius 
     */
    set_radius(radius) {
        this._width = radius/2.0;
        this._radius = radius;
    }

    /**
     * Sets the hight of the node in pixels, also sets the radius to be height / 2
     * 
     * @param {number} height
     */
    set_height(height) {
        this._height = height;
        this._radius = height/2;
    }

    /**
     * Sets the caption of the node as String
     * 
     * @param {String} text
     */
    set_caption(text) {
        this._caption = text;
    }

    /**
     * Sets the _width to be as big as the caption and adds the given margin
     * 
     * @deprecated
     * @param {number} margin
     */
    calculate_width_from_caption(margin) {
        this._width = this._renderer.calc_text_width(this._font_size+'px Bitstream Vera Sans Mono', this._caption) + margin * 2;
    }

    /**
     * Marks this node as selected
     * 
     * @param {boolean} selected true or false
     */
    set_selected(selected) {
        this._selected = selected;
    }

    /**
     * Sets if the node should be allowed to be highlighted
     * 
     * @param {boolean} highlightable 
     */
    set_highlightable(highlightable) {
        this._highlightable = highlightable;
    }

    /**
     * @returns {boolean}
     */
    highlightable() {
        return this._highlightable;
    }

    /**
     * Sets the node to have a highlighted state
     * 
     * @param {boolean} highlighted
     */
    set_highlighted(highlighted) {
        if (!this._highlightable) { return; }

        this._highlighted = highlighted;
    }

    /**
     * Returns if its a highlighted state
     * 
     * @returns {boolean}
     */
    highlighted() {
        return this._highlighted;
    }

    /**
     * Draws the node. 'first' is only used to allow for the autohidden text to be floating on top of everything else in the GUI (so its not obstructed)
     * 
     * @param {boolean} first default true
     * @returns {GUI_node} if we didnt draw it, we return it, else null
     */
    draw(first = true) {
        if (first && this._selected && this._text_autohide) {
            return this;
        }

        var w = this._width;
        var bc = this._border_color;
        var bt = this._border_thickness;

        if (this._highlighted) {
            bc = '#0088cc';
            bt = 6;
        }

        if (this._caption != '') {
            w = this._renderer.calc_text_width(this._font_size+'px ' + this._font, this._caption);
        }

        var shaded_color = this._background_color;

        if (this._selected) {
            shaded_color = this._renderer.calc_shade_color(shaded_color, 0.5);
        }

        if (this._shape == 'square') {
            this._renderer.draw_box(this._px, this._py, this._width, this._height, shaded_color, bc, bt);
        }
        else if (this._shape == 'circle') {
            this._renderer.draw_circle(this._px, this._py, this._radius, bt, shaded_color, bc);
        }
        else if (this._shape == 'triangle') {
             this._renderer.draw_triangle(this._px, this._py, this._width, bt, shaded_color, bc);
        }

        
        if (this._caption != '') {

            if (this._text_autohide && !this._selected) {
                
            }
            else if (this._text_autohide) {
                // draw a label
                this._renderer.draw_box(this._mx, this._my, w+20, 20, '#000000', '#ffffff');
                this._renderer.draw_text_color(this._mx + 10, this._my + 16, this._font, this._font_size, '#ffffff', this._caption);
            }
            else {
                var cs = this._renderer.contrast(shaded_color);

                this._renderer.draw_text_color(this._px + this._width/2 - w/2, this._py + this._height/2 + 4, this._font, this._font_size, cs, this._caption);
            }
        }

        var mc = this._indicator_color;

        if (mc != null) {
            this._renderer.draw_fill_path([this._px, this._py], [this._px + 10, this._py], [this._px, this._py + 10], 1.0, mc, '#ffffff');
        }

        var add = (1.0 / (this._icons.length + 1)) * this._width;
        var ix = this._px - this._width/2;
        var iy = this._py - this._font_size+1;

        if (this._caption == '') {
            iy = this._py;
        }
        
        ix += this._icon_x_offset;
        iy += this._icon_y_offset;

        for (var i = 0; i < this._icons.length; ++i) {
            var img = this._icons[i].img();
        
            ix += add;

            this._renderer.draw_icon(ix - img.width/2*this._icon_scale, iy, img.width * this._icon_scale, img.height * this._icon_scale, this._icons[i]);
        }

    }

    /**
     * Helper function to determine point in triangle
     * 
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    sign (x0, y0, x1, y1, x2, y2) {
        return (x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2);
    }

    /**
     * Determine is the point x and y is inside a triangle with the given corners 0,1,2
     * 
     * @param {number} x point
     * @param {number} y point
     * @param {number} x0 corner0
     * @param {number} y0 corner0
     * @param {number} x1 corner1
     * @param {number} y1 corner1
     * @param {number} x2 corner2
     * @param {number} y2 corner2
     * 
     * @returns {boolean}
     */
    point_in_triangle(x, y, x0, y0, x1, y1, x2, y2) {
        var b1 = this.sign(x, y, x0, y0, x1, y1) < 0.0;
        var b2 = this.sign(x, y, x1, y1, x2, y2) < 0.0;
        var b3 = this.sign(x, y, x2, y2, x0, y0) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    }

    /**
     * Test if the point is located inside the node
     * 
     * @param {number} x position
     * @param {number} y position
     * 
     * @returns {GUI_node} null if no hit test
     */
	hit_test(x, y) {
        
        if (!this._hit_test) { return null; }

        var test = false;

        if (this._shape == 'circle') {
            test = (x - this._px)*(x - this._px) + (y - this._py)*(y - this._py) < this._radius*this._radius;
        }
        else if (this._shape == 'square') {
            
            if (this._px > x) { test = false; }
            else if (this._px + this._width < x) { test = false; }
            else if (this._py + this._height < y) { test = false; }
            else if (this._py > y) { test = false; }
            else { test = true; }
            
        }
        else if (this._shape == 'triangle') {
            test = this.point_in_triangle(x, y, this._px - this._width/2, this._py + this._height/2, this._px + this._width/2, this._py + this._height/2, this._px, this._py - this._height/2);
        }
        
        if (test) { return this; }
        return null;
    }
};