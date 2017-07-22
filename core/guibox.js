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

class GUI_box {
    constructor(renderobj) {
        this._renderer       = renderobj;
        this._caption_color  = '#ffffff';
        this._px             = 0;
        this._py             = 0;
        this._width          = 128;
        this._height         = 128;
        this._caption        = '';
        this._nodes          = [];
        this._bg_color       = '#000000';
        this._brd_color      = '#dedede';
        this._selected       = false;
        this._cols           = 1;
        
        this._y_margin       = 0;
        this._hit_test       = true;
        this._left_margin    = 0;
        this._draggable      = false;
        this._on_click       = 0;
                
        this._highlighted    = false;
        this._highlightable  = true;
        this._mx             = 0;
        this._my             = 0;
        this._selectable     = true;
        this._font_size      = 14;
        this._font           = 'Bitstream2';
        this._static_color   = false;
    }

    set_static_color(st) { this._static_color = st; }
    static_color() { return this._static_color; }

    font() { return this._font; }
    font_size() { return this._font_size; }

    set_font(font) { this._font = font; }
    set_font_size(size) { this._font_size = size; }

    set_mousepos(x, y) { 
        this._mx = x; 
        this._my = y; 

        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_mousepos(x, y);
        }
    }

    left_margin() { return this._left_margin; }
    nodes() { return this._nodes; }
    x() { return this._px; }
    y() { return this._py; }
    width() { return this._width; }
    height() { return this._height; }
    y_margin() { return this._y_margin; }
    caption() { return this._caption; }
    caption_color() { return this._caption_color; }
    backgrund_color() { return this._bg_color; }
    border_color() { return this._brd_color; }
    selected() { return this._selected; }
    columns() { return this._cols; }
    

    has_hit_test() { return this._hit_test; }
    is_box() { return true; }
    shape() { return 'square'; }
    draggable() { return this._draggable; }
    set_selectable(select) { this._selectable = select; }
    selectable() { return this._selectable; }

    on_click(func) { 
        this._on_click = func; 
    }

    set_hostname(hostname) {
        this._hostname = hostname;
    }
    
    set_draggable(draggable) {
        this._draggable = draggable;
    }

    set_left_margin(px) {
        this._left_margin = px;
    }

    set_hit_test(test) {
        this._hit_test = test;
    }

    set_columns(cols) {
        if (cols < 1) { console.error('ERROR: illegal to set num columns below 1'); return; }
        this._cols = cols;
    }

    set_pos(x, y, dragged = false) {
        this._px = x;
        this._py = y;

        if (dragged) {
            this.calc_nodes_pos();
        }
    }

    set_width(width) {
        this._width = width;
    }

    set_height(height) {
        this._height = height;
    }

    set_size(w, h) {
        this._width = w;
        this._height = h;
    }

    set_background_color(color) {
        this._bg_color = color;
    }

    set_border_color(color) {
        this._brd_color = color;
    }

    set_caption(caption) {
        this._caption = caption;
    }

    set_caption_color(color) {
        this._caption_color = color;
    }

    set_selected(selected) {
        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_selected(false);
        }

        this._selected = selected;
    }

    add_node(node) {
        this._nodes.push(node);
    }

    set_y_margin(pixels) {
        this._y_margin = pixels;
    }

    content_height() {
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }

        y_offset += this._y_margin;

        return this._height - y_offset;
    }

    content_width() {
        return this._width;
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
     * Calculates the nodes positions inside the box
     */
    calc_nodes_pos() {
        
        var y = this._py;
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }

        y_offset += this._y_margin;

        y += y_offset;

        var x = 0;
        var rows = Math.ceil(this._nodes.length/this._cols);
        var rh = (this._height-y_offset) / rows;
        var cw = this._width / this._cols;
        var add = (1.0 / (this._cols)) * this._width;

        var ix = this._px + this._left_margin;
        

        for (var i = 0; i < this._nodes.length; ++i) {
            
            this._nodes[i].set_pos(ix, y);
            if (this._nodes[i].is_box()) {
                this._nodes[i].calc_nodes_pos();
            }

            ix += add;

            if (i != 0 && (i+1) % this._cols == 0) {
                y+=rh;
                ix = this._px + this._left_margin;
            }
        }
    }

    /**
     * Draws itself and its children
     * 
     * @returns {GUI_node|GUI_box} later nodes to draw
     */
    draw() {
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
            bc = '#0088cc';
            bt = 6;
        }

        this._renderer.draw_box(this._px, this._py, this._width, this._height, shaded_color, bc, bt);

        if (this._caption != '') {
            var w = this._renderer.calc_text_width(this._font_size + 'px ' + this._font, this._caption);
            this._renderer.draw_text_color(this._px + this._width/2 - w/2, this._py + 20, this._font, this._font_size, this._caption_color, this._caption);
        }

        var later = null;
        for (var i = 0; i < this._nodes.length; ++i) {
            var nn = this._nodes[i].draw(true);

            if (nn != null) {
                later = nn;
            }
            
        }

        return later;
    }

    /**
     * Performs a hit test on this node and all children
     * Returns the node we have a successful hit test on
     * 
     * @param {number} x
     * @param {number} y
     * @returns {GUI_node|GUI_box} or null if not found
     */
    hit_test(x, y) {
        // first hit test our children
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].is_box()) {
                var n = this._nodes[i].hit_test(x, y);

                if (n == null) {
                    continue;
                }
                    
                return n;
            }
            else if (this._nodes[i].hit_test(x,y)) {
                return this._nodes[i];
            }
        }

        if (!this._hit_test) { return null; }

        if (this._px > x) { return null; }
        if (this._px + this._width < x) { return null; }
        if (this._py + this._height < y) { return null; }
        if (this._py > y) { return null; }
        
        return this;
    }

    fetch_gui_children(container) {
        for (var i = 0; i < this._nodes.length; ++i) {
            container.push(this._nodes[i]);

            this._nodes[i].fetch_gui_children(container);
        }
    }

}