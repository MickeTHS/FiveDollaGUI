/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */
/* a box to store nodes in */
var GUI_box = /** @class */ (function () {
    function GUI_box(renderobj) {
        this._renderer = renderobj;
        this._caption_color = '#ffffff';
        this._rect = { x: 0, y: 0, w: 32, h: 32 };
        this._caption = '';
        this._nodes = [];
        this._bg_color = '#000000';
        this._brd_color = '#dedede';
        this._selected = false;
        this._cols = 1;
        this._y_margin = 0;
        this._hit_test = true;
        this._left_margin = 0;
        this._draggable = false;
        this._on_click = 0;
        this._highlighted = false;
        this._highlightable = true;
        this._mx = 0;
        this._my = 0;
        this._selectable = true;
        this._font_size = 14;
        this._font = 'Bitstream2';
        this._static_color = false;
        this._highlight_color = '#44aa44';
    }
    GUI_box.prototype.rect = function () { return this._rect; };
    GUI_box.prototype.set_static_color = function (st) { this._static_color = st; };
    GUI_box.prototype.static_color = function () { return this._static_color; };
    GUI_box.prototype.font = function () { return this._font; };
    GUI_box.prototype.font_size = function () { return this._font_size; };
    GUI_box.prototype.set_font = function (font) { this._font = font; };
    GUI_box.prototype.set_font_size = function (size) { this._font_size = size; };
    GUI_box.prototype.set_mousepos = function (x, y) {
        this._mx = x;
        this._my = y;
        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_mousepos(x, y);
        }
    };
    GUI_box.prototype.left_margin = function () { return this._left_margin; };
    GUI_box.prototype.nodes = function () { return this._nodes; };
    GUI_box.prototype.x = function () { return this._rect.x; };
    GUI_box.prototype.y = function () { return this._rect.y; };
    GUI_box.prototype.width = function () { return this._rect.w; };
    GUI_box.prototype.height = function () { return this._rect.h; };
    GUI_box.prototype.y_margin = function () { return this._y_margin; };
    GUI_box.prototype.caption = function () { return this._caption; };
    GUI_box.prototype.caption_color = function () { return this._caption_color; };
    GUI_box.prototype.backgrund_color = function () { return this._bg_color; };
    GUI_box.prototype.border_color = function () { return this._brd_color; };
    GUI_box.prototype.selected = function () { return this._selected; };
    GUI_box.prototype.columns = function () { return this._cols; };
    GUI_box.prototype.has_hit_test = function () { return this._hit_test; };
    GUI_box.prototype.is_box = function () { return true; };
    GUI_box.prototype.shape = function () { return 'square'; };
    GUI_box.prototype.draggable = function () { return this._draggable; };
    GUI_box.prototype.set_selectable = function (select) { this._selectable = select; };
    GUI_box.prototype.selectable = function () { return this._selectable; };
    GUI_box.prototype.on_click = function (func) {
        this._on_click = func;
    };
    GUI_box.prototype.set_hostname = function (hostname) {
        this._hostname = hostname;
    };
    GUI_box.prototype.set_draggable = function (draggable) {
        this._draggable = draggable;
    };
    GUI_box.prototype.set_left_margin = function (px) {
        this._left_margin = px;
    };
    GUI_box.prototype.set_hit_test = function (test) {
        this._hit_test = test;
    };
    GUI_box.prototype.set_columns = function (cols) {
        if (cols < 1) {
            console.error('ERROR: illegal to set num columns below 1');
            return;
        }
        this._cols = cols;
    };
    GUI_box.prototype.set_pos = function (x, y, dragged) {
        if (dragged === void 0) { dragged = false; }
        this._rect.x = x;
        this._rect.y = y;
        if (dragged) {
            this.calc_nodes_pos();
        }
    };
    GUI_box.prototype.set_width = function (width) {
        this._rect.w = width;
    };
    GUI_box.prototype.set_height = function (height) {
        this._rect.h = height;
    };
    GUI_box.prototype.set_size = function (w, h) {
        this._rect.w = w;
        this._rect.h = h;
    };
    GUI_box.prototype.set_background_color = function (color) {
        this._bg_color = color;
    };
    GUI_box.prototype.set_border_color = function (color) {
        this._brd_color = color;
    };
    GUI_box.prototype.set_caption = function (caption) {
        this._caption = caption;
    };
    GUI_box.prototype.set_caption_color = function (color) {
        this._caption_color = color;
    };
    GUI_box.prototype.set_selected = function (selected) {
        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_selected(false);
        }
        this._selected = selected;
    };
    GUI_box.prototype.add_node = function (node) {
        this._nodes.push(node);
    };
    GUI_box.prototype.set_y_margin = function (pixels) {
        this._y_margin = pixels;
    };
    GUI_box.prototype.content_height = function () {
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }
        y_offset += this._y_margin;
        return this._rect.h - y_offset;
    };
    GUI_box.prototype.content_width = function () {
        return this._rect.w;
    };
    /**
     * Sets if the node should be allowed to be highlighted
     *
     * @param {boolean} highlightable
     */
    GUI_box.prototype.set_highlightable = function (highlightable) {
        this._highlightable = highlightable;
    };
    /**
     * @returns {boolean}
     */
    GUI_box.prototype.highlightable = function () {
        return this._highlightable;
    };
    /**
     * Sets the node to have a highlighted state
     *
     * @param {boolean} highlighted
     */
    GUI_box.prototype.set_highlighted = function (highlighted) {
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
    GUI_box.prototype.highlighted = function () {
        return this._highlighted;
    };
    /**
     * Calculates the nodes positions inside the box
     */
    GUI_box.prototype.calc_nodes_pos = function () {
        var y = this._rect.y;
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }
        y_offset += this._y_margin;
        y += y_offset;
        var x = 0;
        var rows = Math.ceil(this._nodes.length / this._cols);
        var rh = (this._rect.h - y_offset) / rows;
        var cw = this._rect.w / this._cols;
        var add = (1.0 / (this._cols)) * this._rect.w;
        var ix = this._rect.x + this._left_margin;
        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_pos(ix, y);
            if (this._nodes[i].is_box()) {
                this._nodes[i].calc_nodes_pos();
            }
            ix += add;
            if (i != 0 && (i + 1) % this._cols == 0) {
                y += rh;
                ix = this._rect.x + this._left_margin;
            }
        }
    };
    /**
     * Draws itself and its children
     *
     * @returns {GUI_node|GUI_box} later nodes to draw
     */
    GUI_box.prototype.draw = function () {
        if (this.status_func != 0) {
            this.status_func();
        }
        var shaded_color = this._bg_color;
        if (this._selected) {
            shaded_color = this._renderer.calc_shade_color(shaded_color, 0.5);
        }
        var bc = this._brd_color;
        var bt = this._border_thickness;
        if (this._highlighted) {
            bc = this._highlight_color;
            bt = 2;
        }
        this._renderer.draw_box(this._rect.x, this._rect.y, this._rect.w, this._rect.h, shaded_color, bc, bt);
        if (this._caption != '') {
            var w = this._renderer.calc_text_width(this._font_size + 'px ' + this._font, this._caption);
            this._renderer.draw_text_color(this._rect.x + this._rect.w / 2 - w / 2, this._rect.y + 20, this._font, this._font_size, this._caption_color, this._caption);
        }
        var later = null;
        for (var i = 0; i < this._nodes.length; ++i) {
            var nn = this._nodes[i].draw(true);
            if (nn != null) {
                later = nn;
            }
        }
        return later;
    };
    /**
     * Performs a hit test on this node and all children
     * Returns the node we have a successful hit test on
     *
     * @param {number} x
     * @param {number} y
     * @returns {GUI_node|GUI_box} or null if not found
     */
    GUI_box.prototype.hit_test = function (x, y) {
        // first hit test our children
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].is_box()) {
                var n = this._nodes[i].hit_test(x, y);
                if (n == null) {
                    continue;
                }
                return n;
            }
            else if (this._nodes[i].hit_test(x, y)) {
                return this._nodes[i];
            }
        }
        if (!this._hit_test) {
            return null;
        }
        if (this._rect.x > x) {
            return null;
        }
        if (this._rect.x + this._rect.w < x) {
            return null;
        }
        if (this._rect.y + this._rect.h < y) {
            return null;
        }
        if (this._rect.y > y) {
            return null;
        }
        return this;
    };
    GUI_box.prototype.fetch_gui_children = function (container) {
        for (var i = 0; i < this._nodes.length; ++i) {
            container.push(this._nodes[i]);
            this._nodes[i].fetch_gui_children(container);
        }
    };
    return GUI_box;
}());
