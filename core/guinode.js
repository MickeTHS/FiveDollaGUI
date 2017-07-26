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

var _drawcalls = 0;

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
    constructor(renderobj, id, ap) {
		this._radius         = 8;
        
        this._center_rect    = { x: 0, y: 0, w: 16, h: 16 };
        this._topleft_rect   = { x: 0, y: 0, w: 16, h: 16 };

        this._renderer       = renderobj;
        this._selected       = false;
        this._icons          = [];
        this._border_color   = '#dedede';
        this._border_thickness = 1;
        this._background_color = '#000000';
        this._icon_color     = '#000000';
        this._caption_color  = '#ffffff';
        this._shape          = 'square';
        this._caption        = '';
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
        this._id             = id;
        this._quad_ids       = [];
        this._highlight_color = '#44aa44';
        this._points         = [];
        this._abs_points     = [];
        this._anchor_point   = ap;
        this._visible        = true;
        this._prev_state     = { x: 0, y: 0, w: 16, h: 16 };

	}

    /**
     * Sets the visibility of the node. 
     * 
     * @param {boolean} visible true to visible, false to hidden
     */
    set_visible(visible) {
        this._visible = visible;
    }

    /**
     * @returns {boolean} visibility
     */
    visible() {
        return this._visible;
    }

    anchor_point() { return this._anchor_point; }

    /**
     * should we recalculate the positions?
     */
    set_anchor_point(ap) {
        this._anchor_point = ap;
    }

    set_quad_ids(ids) {
        this._quad_ids = ids;
    }

    /**
     * This is to keep track of the original dimensions of the node
     * 
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    set_prev_state(x, y, w, h) {
        this._prev_state.x = x;
        this._prev_state.y = y;
        this._prev_state.w = w;
        this._prev_state.h = h;
    }

    /**
     * Returns the dimensions from the last time we did set_zoom_helper
     * 
     * @returns {JSON} x, y, w, h
     */
    prev_state() { return this._prev_state; }

    recalculate() {
        
    }

    quad_ids() { return this._quad_ids; }

    set_rect(rect) { 
        if (this._anchor_point == ANCHOR_CENTER) {
            this._center_rect = rect; 
            this._topleft_rect = rect_center_to_topleft(this._center_rect);
        }
        else {
            this._topleft_rect = rect; 
            this._center_rect = rect_topleft_to_center(this._topleft_rect);
        }
        
    }

    rect() { 
        return this.internal_get_rect();
    }

    rect_with_border() { 
        var r = this.internal_get_rect();
        
        return {x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness, h: r.h + this._border_thickness }; 
    }

    ap_border_rect(ap) {
        var r = 0;
        if (ap == ANCHOR_CENTER) {
            r = this._center_rect;
        }
        else {
            r = this._topleft_rect;
        }

        return {x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness*2, h: r.h + this._border_thickness*2 }; 
    }

    id() { return this._id; }
    set_static_color(st) { this._static_color = st; }
    static_color() { return this._static_color; }
    print() {
        console.log('GUI_node: ' + this._caption)
        console.log('        : center rect: ' + JSON.stringify(this._center_rect));
        console.log('        : ap_border_rect (center): ' + JSON.stringify(this.ap_border_rect(ANCHOR_CENTER)));
        console.log('        : topleft rect: ' + JSON.stringify(this._topleft_rect));
        console.log('        : ap_border_rect (top left): ' + JSON.stringify(this.ap_border_rect(ANCHOR_TOPLEFT)));
        console.log('        : contained in : ' + JSON.stringify(this._quad_ids));
        console.log('        : helper rect : ' + JSON.stringify(this._prev_state));
    }

    font() { return this._font; }
    font_size() { return this._font_size; }

    icon_offset() { return [this._icon_x_offset, this._icon_y_offset]; }

    internal_get_rect() {
        return this._anchor_point == ANCHOR_CENTER ? this._center_rect : this._topleft_rect;
    }

    topleft_rect() { return this._topleft_rect; }
    center_rect() { return this._center_rect; }

    x() { return this.internal_get_rect().x; }
    y() { return this.internal_get_rect().y; }
    pos() { return {x: this.x(), y: this.y() }; }

    autohidden_caption() { return this._text_autohide; }
    selected() { return this._selected; }
    caption_color() { return this._text_color; }
    caption() { return this._caption; }
    
    width() { return this.internal_get_rect().w; }
    height() { return this.internal_get_rect().h; }
    
    radius() { return this._radius; }
    
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
     * sets the points of the polygon relative to x() and y()
     * 
     * @param {Array<JSON>} points in polygon
     */
    set_points(points) {
        this._points = points;
        this.create_abs_points();
    }

    /**
     * makes an array of absolute coordinates so we dont have to calculate this every draw call
     * 
     */
    create_abs_points() {
        var r = this._center_rect;

        for (var i = 0; i < this._points.length; ++i) {
            this._abs_points.push({ x: r.x + this._points[i].x, y: r.y + this._points[i].y });
        }
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
        var r = this.internal_get_rect();
        r.x = x;
        r.y = y;

        this.set_rect(r);
    }

    
    /**
     * Sets the radius of the circle
     * @param {number} radius 
     */
    set_radius(radius) {
        var r = this.internal_get_rect();

        r.w = radius*2.0;
        r.h = radius*2.0;

        this._radius = radius;

        this.set_rect(r);
    }

    /**
     * Sets the hight of the node in pixels
     * 
     * @param {number} height
     */
    set_height(height) {
        var r = this.internal_get_rect();

        r.h = height;

        this.set_rect(r);
    }

    /**
     * Sets the width of the node in pixels
     * 
     * @param {number} width
     */
    set_width(width) {
        var r = this.internal_get_rect();
        
        r.w = width;

        this.set_rect(r);
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
        var r = this.internal_get_rect();

        r.w = this._renderer.calc_text_width(this._font_size+'px Bitstream Vera Sans Mono', this._caption) + margin * 2;

        this.set_rect(r);
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
        if (!this.visible()) {
            return;
        }

        _drawcalls++;

        if (_drawcalls % 100000 == 0) {
            //console.log('draw: ' + _drawcalls);
        }

        if (first && this._selected && this._text_autohide) {
            return this;
        }

        var calc_rect = this.internal_get_rect();

        var w = calc_rect.w;
        var bc = this._border_color;
        var bt = this._border_thickness;

        if (this._highlighted) {
            bc = this._highlight_color;
            bt = 2;
        }

        if (this._caption != '') {
            w = this._renderer.calc_text_width(this._font_size+'px ' + this._font, this._caption);
        }

        var shaded_color = this._background_color;

        if (this._selected) {
            shaded_color = this._renderer.calc_shade_color(shaded_color, 0.5);
        }

        if (this._shape == 'square') {
            if (_drawcalls % 10000 == 0) {
                //this.print();
            }

            this._renderer.draw_box(this._topleft_rect.x, this._topleft_rect.y, this._topleft_rect.w, this._topleft_rect.h, shaded_color, bc, bt);
        }
        else if (this._shape == 'circle') {
            this._renderer.draw_circle(this._center_rect.x, this._center_rect.y, this._radius, bt, shaded_color, bc);
        }
        else if (this._shape == 'triangle') {
            this._renderer.draw_triangle(this._topleft_rect.x, this._topleft_rect.y, this._topleft_rect.w, bt, shaded_color, bc);
        }
        else if (this._shape == 'polygon') {
            // we always draw it using abs_points, which has already been calculated (hopefully)
            this._renderer.draw_fill_points(this._abs_points, bt, shaded_color, bc);
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

                this._renderer.draw_text_color(calc_rect.x + calc_rect.w/2 - w/2, calc_rect.y + calc_rect.h/2 + 4, this._font, this._font_size, cs, this._caption);
            }
        }

        var mc = this._indicator_color;

        if (mc != null) {
            this._renderer.draw_fill_path([calc_rect.x, calc_rect.y], [calc_rect.x + 10, calc_rect.y], [calc_rect.x, calc_rect.y + 10], 1.0, mc, '#ffffff');
        }

        var add = (1.0 / (this._icons.length + 1)) * calc_rect.w;
        var ix = calc_rect.x - calc_rect.w/2;
        var iy = calc_rect.y - this._font_size+1;

        if (this._caption == '') {
            iy = calc_rect.y;
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
     * Test if the point is located inside the node
     * 
     * @param {number} x position
     * @param {number} y position
     * 
     * @returns {GUI_node} null if no hit test
     */
	hit_test(x, y) {
        
        if (!this._hit_test) { return null; }

        var calc_rect = 0;

        var test = false;

        if (this._shape == 'circle') {
            calc_rect = this._center_rect;
            test = (x - calc_rect.x)*(x - calc_rect.x) + (y - calc_rect.y)*(y - calc_rect.y) < this._radius*this._radius;
        }
        else if (this._shape == 'polygon') {
            test = p_poly(this._abs_points, x, y);
        }
        else if (this._shape == 'square') { // for now we calculate based on the BB for the polygon, TODO: actual polygon test
            calc_rect = this._topleft_rect;
            if (calc_rect.x > x) { test = false; }
            else if (calc_rect.x + calc_rect.w < x) { test = false; }
            else if (calc_rect.y + calc_rect.h < y) { test = false; }
            else if (calc_rect.y > y) { test = false; }
            else { test = true; }
            
        }
        else if (this._shape == 'triangle') {
            calc_rect = this._topleft_rect;
            test = point_in_triangle(x, y, calc_rect.x - calc_rect.w/2, calc_rect.y + calc_rect.h/2, calc_rect.x + calc_rect.w/2, calc_rect.y + calc_rect.h/2, calc_rect.x, calc_rect.y - calc_rect.h/2);
        }
        
        
        if (test) { return this; }
        return null;
    }
};