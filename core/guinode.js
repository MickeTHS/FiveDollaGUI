/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */
var STATE_NO_CHANGE = 0;
var STATE_CHANGE_TO_FRONT = 1;
var STATE_CHANGE_TO_BACK = 2;
var STATE_ICON_ADDED = 3;
var STATE_COLOR_CHANGE = 4;
var ICON_STYLE_NORMAL = 1;
var ICON_STYLE_STRETCHED = 2;
/* class for drawing a line between two GUI_nodes */
var GUI_line_2_node = /** @class */ (function () {
    function GUI_line_2_node(renderobj) {
        this._renderer = renderobj;
        this._nodes = [];
        this._num_nodes = 0;
        this._thickness = 0.5;
        this._line_color = '#222222';
    }
    GUI_line_2_node.prototype.add_node = function (node) {
        this._nodes[this._num_nodes++] = node;
    };
    GUI_line_2_node.prototype.set_line_color = function (color) {
        this._line_color = color;
    };
    GUI_line_2_node.prototype.set_stroke_color = function (color) {
        this._stroke_color;
    };
    GUI_line_2_node.prototype.set_thickness = function (pixels) {
        this._thickness = pixels;
    };
    GUI_line_2_node.prototype.draw = function () {
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
    };
    return GUI_line_2_node;
}());
;
var _drawcalls = 0;
/*
    A simple container class for all objects presented on the drawing canvas

    this class will:

    + draw guinodes
    + allow for users to select color
    + mouseover animate
    + move guinodes
 */
var GUI_node = /** @class */ (function () {
    function GUI_node(renderobj, id, ap, shape) {
        this._radius = 8;
        this._center_rect = { x: 0, y: 0, w: 16, h: 16 };
        this._topleft_rect = { x: 0, y: 0, w: 16, h: 16 };
        this._renderer = renderobj;
        this._selected = false;
        this._icon = null;
        this._border_color = '#dedede';
        this._border_thickness = 1;
        this._background_color = '#000000';
        this._icon_color = '#000000';
        this._caption_color = '#ffffff';
        this._shape = shape;
        this._caption = '';
        this._text_autohide = false;
        this._got_focus = false;
        this._draggable = false;
        this._icon_scale = 1.0;
        this._font_size = 14;
        this._font = 'Bitstream2';
        this._icon_x_offset = 0;
        this._icon_y_offset = 0;
        this._hit_test = true;
        this._on_click = 0;
        this._hostname = 0;
        this._mx = 0;
        this._my = 0;
        this._indicator_color = null;
        this._highlighted = false;
        this._highlightable = true;
        this._static_color = false;
        this._shaded_color = false;
        this._id = id;
        this._quad_ids = [];
        this._highlight_color = '#44aa44';
        this._points = [];
        this._abs_points = [];
        this._prev_points = [];
        this._anchor_point = ap;
        this._visible = true;
        this._prev_state = { x: 0, y: 0, w: 16, h: 16 };
        this._br = { x: 0, y: 0, w: 0, h: 0 };
        this._state_changes = [];
        this._icon_style = -1;
        this._zoom_thresholds = [];
        this._zoom_thresholds.push(-1);
        this._zoom_thresholds.push(-1);
    }
    /**
     * Sets the visibility of the node.
     *
     * @param {boolean} visible true to visible, false to hidden
     */
    GUI_node.prototype.set_visible = function (visible) {
        this._visible = visible;
    };
    /**
     * @returns {boolean} visibility
     */
    GUI_node.prototype.visible = function () {
        return this._visible;
    };
    GUI_node.prototype.anchor_point = function () { return this._anchor_point; };
    /**
     * should we recalculate the positions?
     */
    GUI_node.prototype.set_anchor_point = function (ap) {
        this._anchor_point = ap;
    };
    GUI_node.prototype.set_quad_ids = function (ids) {
        this._quad_ids = ids;
    };
    /**
     * This is to keep track of the original dimensions of the node
     *
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    GUI_node.prototype.set_prev_state = function (x, y, w, h) {
        this._prev_state.x = x;
        this._prev_state.y = y;
        this._prev_state.w = w;
        this._prev_state.h = h;
    };
    GUI_node.prototype.zoom_thresholds = function () {
        return this._zoom_thresholds;
    };
    GUI_node.prototype.set_min_zoom = function (factor) {
        this._zoom_thresholds[0] = factor;
    };
    GUI_node.prototype.set_max_zoom = function (factor) {
        this._zoom_thresholds[1] = factor;
    };
    /**
     * Same reason as for prev_state, only this is for paths and polygons
     *
     * @param {JSON} points {x,y}
     */
    GUI_node.prototype.set_prev_point_state = function (points) {
        this._prev_points = JSON.parse(JSON.stringify(points));
    };
    GUI_node.prototype.prev_point_state = function () { return this._prev_points; };
    /**
     * Returns the dimensions from the last time we did set_zoom_helper
     *
     * @returns {JSON} x, y, w, h
     */
    GUI_node.prototype.prev_state = function () { return this._prev_state; };
    GUI_node.prototype.recalculate = function () {
        if (this._shape == 'polygon') {
            this.create_abs_points();
        }
    };
    /**
     * @readonly
     *
     * Will return a copy of the absolute points
     *
     * @returns {Array<JSON>} returns a copy of absolute points in the triangle
     */
    GUI_node.prototype.abs_points = function () {
        return JSON.parse(JSON.stringify(this._abs_points));
    };
    GUI_node.prototype.br = function () {
        return this._br;
    };
    GUI_node.prototype.set_br = function (br) {
        this._br = br;
    };
    GUI_node.prototype.quad_ids = function () { return this._quad_ids; };
    GUI_node.prototype.set_rect = function (rect) {
        if (this._anchor_point == ANCHOR_CENTER) {
            this._center_rect = rect;
            this._topleft_rect = rect_center_to_topleft(this._center_rect);
        }
        else {
            this._topleft_rect = rect;
            this._center_rect = rect_topleft_to_center(this._topleft_rect);
        }
    };
    GUI_node.prototype.rect = function () {
        return this.internal_get_rect();
    };
    GUI_node.prototype.rect_with_border = function () {
        var r = this.internal_get_rect();
        return { x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness, h: r.h + this._border_thickness };
    };
    GUI_node.prototype.ap_border_rect = function (ap) {
        var r = 0;
        if (ap == ANCHOR_CENTER) {
            r = this._center_rect;
        }
        else {
            r = this._topleft_rect;
        }
        return { x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness * 2, h: r.h + this._border_thickness * 2 };
    };
    GUI_node.prototype.id = function () { return this._id; };
    GUI_node.prototype.set_static_color = function (st) { this._static_color = st; };
    GUI_node.prototype.static_color = function () { return this._static_color; };
    GUI_node.prototype.print = function () {
        console.log('GUI_node: ' + this._caption);
        console.log('        : center rect: ' + JSON.stringify(this._center_rect));
        console.log('        : ap_border_rect (center): ' + JSON.stringify(this.ap_border_rect(ANCHOR_CENTER)));
        console.log('        : topleft rect: ' + JSON.stringify(this._topleft_rect));
        console.log('        : ap_border_rect (top left): ' + JSON.stringify(this.ap_border_rect(ANCHOR_TOPLEFT)));
        console.log('        : contained in : ' + JSON.stringify(this._quad_ids));
        console.log('        : helper rect : ' + JSON.stringify(this._prev_state));
        if (this._shape == 'polygon') {
            console.log('        : BR : ' + JSON.stringify(this._br));
        }
    };
    GUI_node.prototype.font = function () { return this._font; };
    GUI_node.prototype.font_size = function () { return this._font_size; };
    GUI_node.prototype.icon_offset = function () { return [this._icon_x_offset, this._icon_y_offset]; };
    GUI_node.prototype.internal_get_rect = function () {
        return this._anchor_point == ANCHOR_CENTER ? this._center_rect : this._topleft_rect;
    };
    GUI_node.prototype.topleft_rect = function () { return this._topleft_rect; };
    GUI_node.prototype.center_rect = function () { return this._center_rect; };
    GUI_node.prototype.x = function () { return this.internal_get_rect().x; };
    GUI_node.prototype.y = function () { return this.internal_get_rect().y; };
    GUI_node.prototype.pos = function () { return { x: this.x(), y: this.y() }; };
    GUI_node.prototype.autohidden_caption = function () { return this._text_autohide; };
    GUI_node.prototype.selected = function () { return this._selected; };
    GUI_node.prototype.caption_color = function () { return this._text_color; };
    GUI_node.prototype.caption = function () { return this._caption; };
    GUI_node.prototype.width = function () { return this.internal_get_rect().w; };
    GUI_node.prototype.height = function () { return this.internal_get_rect().h; };
    GUI_node.prototype.radius = function () { return this._radius; };
    GUI_node.prototype.radius = function () { return this._radius; };
    GUI_node.prototype.icon = function () { return this._icon; };
    GUI_node.prototype.is_box = function () { return false; };
    GUI_node.prototype.has_hit_test = function () { return this._hit_test; };
    GUI_node.prototype.shape = function () { return this._shape; };
    GUI_node.prototype.draggable = function () { return this._draggable; };
    GUI_node.prototype.corner_color = function () { return this._corner_color; };
    GUI_node.prototype.set_mousepos = function (x, y) { this._mx = x; this._my = y; };
    GUI_node.prototype.indicator_color = function () { return this._indicator_color; };
    GUI_node.prototype.set_font = function (font) {
        this._font = font;
    };
    /**
     * Register the callback to happen when the node has been clicked on
     *
     * @param {function} func the callback function
     */
    GUI_node.prototype.on_click = function (func) {
        this._on_click = func;
    };
    /**
     * There are no children for GUI_nodes, this is only needed because GUI_box and GUI_node can be in the same arrays
     *
     * @param {Array<undefined>} container
     */
    GUI_node.prototype.fetch_gui_children = function (container) {
        //we dont have children here, so dont do anything
    };
    /**
     * Sets the upper left corner to display a little triangle with the given color
     *
     * @param {String} color the color as RGB
     */
    GUI_node.prototype.set_indicator_color = function (color) {
        this._indicator_color = color;
    };
    /**
     * Set to true if you want the node to be draggable
     *
     * @param {boolean} draggable true or false
     */
    GUI_node.prototype.set_draggable = function (draggable) {
        this._draggable = draggable;
    };
    /**
     * Set to true if we want this node to be selectable and highlightable
     *
     * @param {boolean} test true or false
     */
    GUI_node.prototype.set_hit_test = function (test) {
        this._hit_test = test;
    };
    /**
     * sets the points of the polygon relative to x() and y()
     *
     * @param {Array<JSON>} points in polygon
     */
    GUI_node.prototype.set_points = function (points) {
        this._points = points;
        this.create_abs_points();
    };
    /**
     * Get the points of the polygon or path
     * @returns {Array<JSON>} [{x,y}...]
     */
    GUI_node.prototype.points = function () { return this._points; };
    /**
     * makes an array of absolute coordinates so we dont have to calculate this every draw call
     *
     */
    GUI_node.prototype.create_abs_points = function () {
        var r = this._center_rect;
        this._abs_points = [];
        for (var i = 0; i < this._points.length; ++i) {
            this._abs_points.push({ x: r.x + this._points[i].x, y: r.y + this._points[i].y });
        }
        this.set_br(calc_br(this._abs_points));
    };
    /**
     * Sets the icon offset if we have an icon on the node
     *
     * @param {number} x pixels x
     * @param {number} y pixels y
     */
    GUI_node.prototype.set_icon_offset = function (x, y) {
        this._icon_x_offset = x;
        this._icon_y_offset = y;
    };
    /**
     * Sets the font size of the caption display
     *
     * @param {number} size
     */
    GUI_node.prototype.set_font_size = function (size) {
        this._font_size = size;
    };
    /**
     * Sets the color the caption will have, (deprecated?)
     *
     * @param {String} color RGB color HEX
     */
    GUI_node.prototype.set_caption_color = function (color) {
        this._caption_color = color;
    };
    /**
     * Sets if we want the node to have its caption hidden whenever the mouse is not over it
     *
     * @param {boolean} hidden true or false
     */
    GUI_node.prototype.set_autohidden_caption = function (hidden) {
        this._text_autohide = hidden;
    };
    /**
     * Sets the scale of the icon
     *
     * @param {float} scale
     */
    GUI_node.prototype.set_icon_scale = function (scale) {
        this._icon_scale = scale;
    };
    /**
     * Adds an icon to be displayed side by side of each other
     *
     * @param {Rnd_icon} icon
     */
    GUI_node.prototype.set_icon = function (icon, style) {
        this._icon_style = style;
        this._icon = icon;
        this.calc_icon_rect();
        this._state_changes.push(STATE_ICON_ADDED);
    };
    /**
     * Gets the rectangle for the icon as displayed on the screen, NOT the source rectangle
     */
    GUI_node.prototype.icon_rect = function () {
        return this._icon_rect;
    };
    GUI_node.prototype.calc_icon_rect = function () {
        var r = this._topleft_rect;
        if (this._icon_style == ICON_STYLE_NORMAL) {
            this._icon_rect = { x: r.x, y: r.y, w: this._icon.rect.w, h: this._icon.rect.h };
            return;
        }
        this._icon_rect = r;
    };
    /**
     * Sets the color of the icon
     *
     * @deprecated dont use
     * @param {String} color RGB HEX
     */
    GUI_node.prototype.set_icon_color = function (color) {
        this._icon_color = color;
    };
    /**
     * Sets the background color of the node
     *
     * @param {String} color RGB HEX
     */
    GUI_node.prototype.set_background_color = function (color) {
        this._background_color = color;
        this._shaded_color = color;
    };
    GUI_node.prototype.background_color = function () {
        return this._background_color;
    };
    /**
     * Sets the border color of the node
     *
     * @param {String} color RGB HEX
     */
    GUI_node.prototype.set_border_color = function (color) {
        this._border_color = color;
        this._state_changes.push(STATE_COLOR_CHANGE);
    };
    /**
     * Sets the border thickness in pixels
     *
     * @param {number} thickness
     */
    GUI_node.prototype.set_border_thickness = function (thickness) {
        this._border_thickness = thickness;
    };
    /**
     * Set the global position of the node in pixel position in canvas
     *
     * @param {number} x
     * @param {number} y
     */
    GUI_node.prototype.set_pos = function (x, y, recalculate) {
        if (recalculate === void 0) { recalculate = false; }
        var r = this.internal_get_rect();
        r.x = x;
        r.y = y;
        this.set_rect(r);
        if (recalculate) {
            this.recalculate();
        }
    };
    GUI_node.prototype.state = function () {
        if (this._state_changes.length <= 0) {
            return STATE_NO_CHANGE;
        }
        return this._state_changes[0];
    };
    GUI_node.prototype.bring_to_back = function () {
        this._state_changes.push(STATE_CHANGE_TO_BACK);
    };
    GUI_node.prototype.bring_to_front = function () {
        this._state_changes.push(STATE_CHANGE_TO_FRONT);
    };
    GUI_node.prototype.pop_state = function () {
        this._state_changes.splice(0, 1);
    };
    GUI_node.prototype.clear_states = function () {
        this._state_changes = [];
    };
    /**
     * Sets the radius of the circle
     * @param {number} radius
     */
    GUI_node.prototype.set_radius = function (radius) {
        var r = this.internal_get_rect();
        r.w = radius * 2.0;
        r.h = radius * 2.0;
        this._radius = radius;
        this.set_rect(r);
    };
    /**
     * Sets the hight of the node in pixels
     *
     * @param {number} height
     */
    GUI_node.prototype.set_height = function (height) {
        var r = this.internal_get_rect();
        r.h = height;
        this.set_rect(r);
    };
    /**
     * Sets the width of the node in pixels
     *
     * @param {number} width
     */
    GUI_node.prototype.set_width = function (width) {
        var r = this.internal_get_rect();
        r.w = width;
        this.set_rect(r);
    };
    /**
     * Sets the caption of the node as String
     *
     * @param {String} text
     */
    GUI_node.prototype.set_caption = function (text) {
        this._caption = text;
    };
    /**
     * Sets the _width to be as big as the caption and adds the given margin
     *
     * @deprecated
     * @param {number} margin
     */
    GUI_node.prototype.calculate_width_from_caption = function (margin) {
        var r = this.internal_get_rect();
        r.w = this._renderer.calc_text_width(this._font_size + 'px Bitstream Vera Sans Mono', this._caption) + margin * 2;
        this.set_rect(r);
    };
    /**
     * Marks this node as selected
     *
     * @param {boolean} selected true or false
     */
    GUI_node.prototype.set_selected = function (selected) {
        this._selected = selected;
        this._shaded_color = this.shaded_color();
    };
    /**
     * Gets the actual color of the node as its being rendered
     *
     * @returns {String} color as hex
     */
    GUI_node.prototype.shaded_color = function () {
        if (this._selected) {
            return this._renderer.calc_shade_color(this._background_color, 0.5);
        }
        return this._background_color;
    };
    GUI_node.prototype.text_rect = function () {
        if (this._selected && this._text_autohide) {
            return { x: this._mx, y: this._my };
        }
        else if (!this._text_autohide) {
            var r = this.internal_get_rect();
            var w = this._renderer.calc_text_width(this._caption);
            return { x: r.x - w / 2, y: r.y };
        }
        return null;
    };
    /**
     * Sets if the node should be allowed to be highlighted
     *
     * @param {boolean} highlightable
     */
    GUI_node.prototype.set_highlightable = function (highlightable) {
        this._highlightable = highlightable;
    };
    /**
     * @returns {boolean}
     */
    GUI_node.prototype.highlightable = function () {
        return this._highlightable;
    };
    /**
     * Sets the node to have a highlighted state
     *
     * @param {boolean} highlighted
     */
    GUI_node.prototype.set_highlighted = function (highlighted) {
        if (!this._highlightable) {
            return;
        }
        this._highlighted = highlighted;
    };
    /**
     * Returns if its a highlighted state
     *
     * @returns {boolean}
     */
    GUI_node.prototype.highlighted = function () {
        return this._highlighted;
    };
    /**
     * Test if the point is located inside the node
     *
     * @param {number} x position
     * @param {number} y position
     *
     * @returns {GUI_node} null if no hit test
     */
    GUI_node.prototype.hit_test = function (x, y) {
        if (!this._hit_test) {
            return null;
        }
        var calc_rect = 0;
        var test = false;
        if (this._shape == 'circle') {
            calc_rect = this._center_rect;
            test = (x - calc_rect.x) * (x - calc_rect.x) + (y - calc_rect.y) * (y - calc_rect.y) < this._radius * this._radius;
        }
        else if (this._shape == 'polygon') {
            test = p_poly(this._abs_points, x, y);
        }
        else if (this._shape == 'square') {
            calc_rect = this._topleft_rect;
            if (calc_rect.x > x) {
                test = false;
            }
            else if (calc_rect.x + calc_rect.w < x) {
                test = false;
            }
            else if (calc_rect.y + calc_rect.h < y) {
                test = false;
            }
            else if (calc_rect.y > y) {
                test = false;
            }
            else {
                test = true;
            }
        }
        else if (this._shape == 'triangle') {
            calc_rect = this._topleft_rect;
            test = point_in_triangle(x, y, calc_rect.x - calc_rect.w / 2, calc_rect.y + calc_rect.h / 2, calc_rect.x + calc_rect.w / 2, calc_rect.y + calc_rect.h / 2, calc_rect.x, calc_rect.y - calc_rect.h / 2);
        }
        if (test) {
            return this;
        }
        return null;
    };
    return GUI_node;
}());
;
