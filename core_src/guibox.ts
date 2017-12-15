/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 
 */


import { Rect } from './guimath';
import { Point } from './guimath';
import { FDGMath } from './guimath';
import { Anchor } from './guitypes';
import { BackgroundImage } from './guitypes';
import { MouseButton } from './guitypes';
import { State } from './guitypes';
import { IconStyle } from './guitypes';
import { Render_screen } from './render';
import { GUI_node } from './guinode';


/* a box to store nodes in */

class GUI_box {
    private _renderer: Render_screen;
    private _caption_color:  string;
    private _rect:           Rect;
    private _caption:        string;
    private _nodes:          [GUI_node]
    private _bg_color:       string;
    private _brd_color:      string;
    private _selected:       boolean;
    private _cols:           number;
    
    private _y_margin:       number;
    private _hit_test:       boolean;
    private _left_margin:    number;
    private _draggable:      boolean;
    private _on_click:       () => void;
            
    private _highlighted:    boolean;
    private _highlightable:  boolean;
    private _mx:             number;
    private _my:             number;
    private _selectable:     boolean;
    private _font_size:      number;
    private _font:           string;
    private _static_color:   boolean;
    private _highlight_color: string;
    private _border_thickness: number;

    constructor(renderobj) {
        
        
        this._renderer       = renderobj;
        this._caption_color  = '#ffffff';
        this._rect           = {x: 0, y: 0, w: 32, h: 32};
        this._caption        = '';
        this._nodes          = [] as [GUI_node];
        this._bg_color       = '#000000';
        this._brd_color      = '#dedede';
        this._selected       = false;
        this._cols           = 1;
        
        this._y_margin       = 0;
        this._hit_test       = true;
        this._left_margin    = 0;
        this._draggable      = false;
        this._on_click       = null;

        this._highlighted    = false;
        this._highlightable  = true;
        this._mx             = 0;
        this._my             = 0;
        this._selectable     = true;
        this._font_size      = 14;
        this._font           = 'Bitstream2';
        this._static_color   = false;
        this._highlight_color = '#44aa44';
        this._border_thickness = 1;
    }

    rect() { return this._rect; }

    set_static_color(st: boolean) { this._static_color = st; }
    static_color() : boolean { return this._static_color; }

    font() : string { return this._font; }
    font_size() : number { return this._font_size; }

    set_font(font: string) { this._font = font; }
    set_font_size(size: number) { this._font_size = size; }

    set_mousepos(x: number, y: number) { 
        this._mx = x; 
        this._my = y; 

        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_mousepos(x, y);
        }
    }

    left_margin() : number { return this._left_margin; }
    nodes() : [GUI_node] { return this._nodes; }
    x() : number { return this._rect.x; }
    y() : number { return this._rect.y; }
    width() : number { return this._rect.w; }
    height() : number { return this._rect.h; }
    y_margin() : number { return this._y_margin; }
    caption() : string { return this._caption; }
    caption_color() : string { return this._caption_color; }
    backgrund_color() : string { return this._bg_color; }
    border_color() : string { return this._brd_color; }
    selected() : boolean { return this._selected; }
    columns() : number { return this._cols; }
    

    has_hit_test() : boolean { return this._hit_test; }
    is_box() : boolean { return true; }
    shape() : string { return 'square'; }
    draggable() : boolean { return this._draggable; }
    set_selectable(select: boolean) { this._selectable = select; }
    selectable() : boolean { return this._selectable; }

    on_click(func: () => void) { 
        this._on_click = func; 
    }

    set_draggable(draggable: boolean) {
        this._draggable = draggable;
    }

    set_left_margin(px: number) {
        this._left_margin = px;
    }

    set_hit_test(test: boolean) {
        this._hit_test = test;
    }

    set_columns(cols: number) {
        if (cols < 1) { console.error('ERROR: illegal to set num columns below 1'); return; }
        this._cols = cols;
    }

    set_pos(x: number, y: number, dragged: boolean = false) {
        this._rect.x = x;
        this._rect.y = y;

        if (dragged) {
            this.calc_nodes_pos();
        }
    }

    set_width(width: number) {
        this._rect.w = width;
    }

    set_height(height: number) {
        this._rect.h = height;
    }

    set_size(w: number, h: number) {
        this._rect.w = w;
        this._rect.h = h;
    }

    set_background_color(color: string) {
        this._bg_color = color;
    }

    set_border_color(color: string) {
        this._brd_color = color;
    }

    set_caption(caption: string) {
        this._caption = caption;
    }

    set_caption_color(color: string) {
        this._caption_color = color;
    }

    set_selected(selected: boolean) {
        for (var i = 0; i < this._nodes.length; ++i) {
            this._nodes[i].set_selected(false);
        }

        this._selected = selected;
    }

    add_node(node: GUI_node) {
        this._nodes.push(node);
    }

    set_y_margin(pixels: number) {
        this._y_margin = pixels;
    }

    content_height() : number {
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }

        y_offset += this._y_margin;

        return this._rect.h - y_offset;
    }

    content_width() : number {
        return this._rect.w;
    }

    /**
     * Sets if the node should be allowed to be highlighted
     * 
     * @param {boolean} highlightable 
     */
    set_highlightable(highlightable: boolean) {
        this._highlightable = highlightable;
    }

    /**
     * @returns {boolean}
     */
    highlightable() : boolean {
        return this._highlightable;
    }

    /**
     * Sets the node to have a highlighted state
     * 
     * @param {boolean} highlighted
     */
    set_highlighted(highlighted: boolean) {
        if (!this._highlightable) { return; }

        this._highlighted = highlighted;
    }

    /**
     * Returns if its a highlighted state
     * 
     * @returns {boolean}
     */
    highlighted() : boolean {
        return this._highlighted;
    }

    /**
     * Calculates the nodes positions inside the box
     */
    calc_nodes_pos() {
        
        var y = this._rect.y;
        var y_offset = 0;
        if (this._caption != '') {
            y_offset += 16;
        }

        y_offset += this._y_margin;

        y += y_offset;

        var x = 0;
        var rows = Math.ceil(this._nodes.length/this._cols);
        var rh = (this._rect.h-y_offset) / rows;
        var cw = this._rect.w / this._cols;
        var add = (1.0 / (this._cols)) * this._rect.w;

        var ix = this._rect.x + this._left_margin;
        

        for (var i = 0; i < this._nodes.length; ++i) {
            
            this._nodes[i].set_pos(ix, y);
            if (this._nodes[i].is_box()) {
                this._nodes[i].calc_nodes_pos();
            }

            ix += add;

            if (i != 0 && (i+1) % this._cols == 0) {
                y+=rh;
                ix = this._rect.x + this._left_margin;
            }
        }
    }

    /**
     * Draws itself and its children
     * 
     * @returns {GUI_node|GUI_box} later nodes to draw
     */
    draw() : GUI_node|GUI_box {
        console.log('ERROR: draw call on box, deprecated???');
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
            var w = this._renderer.calc_text_width(this._caption);
            //var w = this._renderer.calc_text_width(this._font_size + 'px ' + this._font, this._caption);
            this._renderer.draw_text_color(this._rect.x + this._rect.w/2 - w/2, this._rect.y + 20, this._font, this._font_size, this._caption_color, this._caption);
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
    hit_test(x: number, y: number) : GUI_node|GUI_box {
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

        if (this._rect.x > x) { return null; }
        if (this._rect.x + this._rect.w < x) { return null; }
        if (this._rect.y + this._rect.h < y) { return null; }
        if (this._rect.y > y) { return null; }
        
        return this;
    }

    fetch_gui_children(container: [GUI_node]) {
        for (var i = 0; i < this._nodes.length; ++i) {
            container.push(this._nodes[i]);

            this._nodes[i].fetch_gui_children(container);
        }
    }

}