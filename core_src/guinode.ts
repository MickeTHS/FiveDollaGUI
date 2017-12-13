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

export class GUI_line_2_node 
{
    private _renderer:      Render_screen;
    private _nodes:         [GUI_node];
    private _num_nodes:     number;
    private _thickness:     number;
    private _line_color:    string;
    private _stroke_color:  string;

    constructor(renderobj) {
        this._renderer = renderobj;
        this._nodes = [] as [GUI_node];
        this._num_nodes = 0;
        this._thickness = 0.5;
        this._line_color = '#222222';
        this._stroke_color = null;
    }

    add_node(node: GUI_node) {
        this._nodes[this._num_nodes++] = node;
    }

    set_line_color(color: string) {
        this._line_color = color;
    }

    set_stroke_color(color: string) {
        this._stroke_color;
    }

    set_thickness(pixels: number) {
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

import { Rect } from './guimath';
import { Point } from './guimath';
import { FDGMath } from './guimath';
import { Anchor } from './guitypes';
import { BackgroundImage } from './guitypes';
import { MouseButton } from './guitypes';
import { State } from './guitypes';
import { IconStyle } from './guitypes';
import { Render_screen } from './render';

import { GUI_icon } from './guiicon';

export class GUI_node 
{
    private _radius:         number;
    
    private _center_rect:    Rect;
    private _topleft_rect:   Rect;

    private _renderer:       Render_screen;
    private _selected:       boolean;
    private _icon:           GUI_icon;
    private _border_color:   string;
    private _border_thickness: number;
    private _background_color: string;
    private _icon_color:     string;
    private _caption_color:  string;
    private _shape:          string;
    private _caption:        string;
    private _text_autohide:  boolean;
    private _got_focus:      boolean;
    private _draggable:      boolean;
    private _icon_scale:     number;
    private _font_size:      number;
    private _font:           string;
    private _icon_x_offset:  number;
    private _icon_y_offset:  number;
    private _hit_test:       boolean;
    private _on_click:       () => void;
    
    private _mx:             number;
    private _my:             number;
    private _indicator_color: string;
    private _highlighted:    boolean;
    private _highlightable:  boolean;
    private _static_color:   boolean;
    private _shaded_color:   string;
    private _id:             number;
    private _quad_ids:       string[];
    private _highlight_color: string;
    private _points:         [Point];
    private _abs_points:     [Point];
    private _prev_points:    [Point];
    private _anchor_point:   Anchor;
    private _visible:        boolean;
    private _prev_state:     Rect;
    private _br:             Rect;
    private _state_changes:     [State];
    private _icon_style:        number;
    private _zoom_thresholds:   [number];
    private _icon_rect:      Rect;
    
    

    constructor(renderobj: Render_screen, id: number, ap: Anchor, shape: string) {
        this._radius         = 8;
        this._id             = id;
        
        this._center_rect    = { x: 0, y: 0, w: 16, h: 16 };
        this._topleft_rect   = { x: 0, y: 0, w: 16, h: 16 };

        this._renderer       = renderobj;
        this._selected       = false;
        this._icon           = null;
        this._border_color   = '#dedede';
        this._border_thickness = 1;
        this._background_color = '#000000';
        this._icon_color     = '#000000';
        this._caption_color  = '#ffffff';
        this._shape          = shape;
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
        this._on_click       = null;
        
        this._mx             = 0;
        this._my             = 0;
        this._indicator_color = null;
        this._highlighted    = false;
        this._highlightable  = true;
        this._static_color   = false;
        this._shaded_color   = null;
        this._id             = id;
        this._quad_ids       = [] as [string];
        this._highlight_color = '#44aa44';
        this._points         = [] as [Point];
        this._abs_points     = [] as [Point];
        this._prev_points    = [] as [Point];
        this._anchor_point   = ap;
        this._visible        = true;
        this._prev_state     = { x: 0, y: 0, w: 16, h: 16 };
        this._br             = { x: 0, y: 0, w: 0, h: 0 };
        this._state_changes     = [] as [number];
        this._icon_style        = -1;
        this._zoom_thresholds   = [] as [number];
        this._zoom_thresholds.push(-1);
        this._zoom_thresholds.push(-1);
        
	}

    /**
     * Sets the visibility of the node. 
     * 
     * @param {boolean} visible true to visible, false to hidden
     */
    set_visible(visible: boolean) {
        this._visible = visible;
    }

    /**
     * @returns {boolean} visibility
     */
    visible() : boolean {
        return this._visible;
    }

    anchor_point() : Anchor { return this._anchor_point; }

    /**
     * should we recalculate the positions?
     */
    set_anchor_point(ap: Anchor) {
        this._anchor_point = ap;
    }

    set_quad_ids(ids: string[]) {
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
    set_prev_state(x: number, y: number, w: number, h: number) {
        this._prev_state.x = x;
        this._prev_state.y = y;
        this._prev_state.w = w;
        this._prev_state.h = h;
    }

    zoom_thresholds() : [number] {
        return this._zoom_thresholds;
    }

    set_min_zoom(factor: number) {
        this._zoom_thresholds[0] = factor;
    }

    set_max_zoom(factor: number) {
        this._zoom_thresholds[1] = factor;
    }

    /**
     * Same reason as for prev_state, only this is for paths and polygons
     * 
     * @param {JSON} points {x,y}
     */
    set_prev_point_state(points: [Point]) {
        this._prev_points = JSON.parse(JSON.stringify(points));
    }

    prev_point_state() : [Point] { return this._prev_points; }

    /**
     * Returns the dimensions from the last time we did set_zoom_helper
     * 
     * @returns {JSON} x, y, w, h
     */
    prev_state() : Rect { return this._prev_state; }

    recalculate() {
        if (this._shape == 'polygon') {
            this.create_abs_points();
        }
    }

    /**
     * @readonly
     * 
     * Will return a copy of the absolute points
     * 
     * @returns {Array<JSON>} returns a copy of absolute points in the triangle
     */
    abs_points() : [Point] { 
        return JSON.parse(JSON.stringify(this._abs_points));
    }

    br() : Rect {
        return this._br;
    }

    set_br(br: Rect) {
        this._br = br;
    }

    quad_ids() : string[] { return this._quad_ids; }

    set_rect(rect: Rect) { 
       
        if (this._anchor_point == Anchor.ANCHOR_CENTER) {
            this._center_rect = rect; 
            this._topleft_rect = FDGMath.rect_center_to_topleft(this._center_rect);
        }
        else {
            this._topleft_rect = rect; 
            this._center_rect = FDGMath.rect_topleft_to_center(this._topleft_rect);
        }
        
    }

    rect() : Rect { 
        return this.internal_get_rect();
    }

    rect_with_border() : Rect { 
        var r = this.internal_get_rect();
        
        return {x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness, h: r.h + this._border_thickness }; 
    }

    ap_border_rect(ap: Anchor) : Rect {
        var r = null;
        if (ap == Anchor.ANCHOR_CENTER) {
            r = this._center_rect;
        }
        else {
            r = this._topleft_rect;
        }

        return {x: r.x - this._border_thickness, y: r.y - this._border_thickness, w: r.w + this._border_thickness*2, h: r.h + this._border_thickness*2 }; 
    }

    id() : number { return this._id; }
    set_static_color(st: boolean) { this._static_color = st; }
    static_color() : boolean { return this._static_color; }
    print() {
        console.log('GUI_node: ' + this._caption)
        console.log('        : center rect: ' + JSON.stringify(this._center_rect));
        console.log('        : ap_border_rect (center): ' + JSON.stringify(this.ap_border_rect(Anchor.ANCHOR_CENTER)));
        console.log('        : topleft rect: ' + JSON.stringify(this._topleft_rect));
        console.log('        : ap_border_rect (top left): ' + JSON.stringify(this.ap_border_rect(Anchor.ANCHOR_TOPLEFT)));
        console.log('        : contained in : ' + JSON.stringify(this._quad_ids));
        console.log('        : helper rect : ' + JSON.stringify(this._prev_state));
        if (this._shape == 'polygon') {
            console.log('        : BR : ' + JSON.stringify(this._br));
        }
    }

    font() : string { return this._font; }
    font_size() : number { return this._font_size; }

    icon_offset() : Point { return  { x: this._icon_x_offset, y: this._icon_y_offset }; }

    internal_get_rect() : Rect {
        
        return this._anchor_point == Anchor.ANCHOR_CENTER ? this._center_rect : this._topleft_rect;
    }

    topleft_rect() : Rect { return this._topleft_rect; }
    center_rect() : Rect { return this._center_rect; }

    x() : number { return this.internal_get_rect().x; }
    y() : number { return this.internal_get_rect().y; }
    pos() : Point { return {x: this.x(), y: this.y() }; }

    autohidden_caption() : boolean { return this._text_autohide; }
    selected() : boolean { return this._selected; }
    caption_color() : string { return this._caption_color; }
    caption() : string { return this._caption; }
    
    width() { return this.internal_get_rect().w; }
    height() { return this.internal_get_rect().h; }
    
    radius() : number { return this._radius; }
    
    icon() : GUI_icon { return this._icon; }
    is_box() : boolean { return false; }
    has_hit_test() : boolean { return this._hit_test; }
    shape() : string { return this._shape; }
    draggable() : boolean { return this._draggable; }
    
    set_mousepos(x: number, y: number) { this._mx = x; this._my = y; }
    indicator_color() : string { return this._indicator_color; }

    set_font(font: string) {
        this._font = font;
    }
    
    /**
     * Register the callback to happen when the node has been clicked on
     * 
     * @param {function} func the callback function
     */
    on_click(func: () => void) { 
        this._on_click = func; 
    }

    /**
     * There are no children for GUI_nodes, this is only needed because GUI_box and GUI_node can be in the same arrays
     * 
     * @param {Array<undefined>} container 
     */
    fetch_gui_children(container: [GUI_node]) {
        //we dont have children here, so dont do anything
    }

    /**
     * Sets the upper left corner to display a little triangle with the given color
     * 
     * @param {String} color the color as RGB
     */
    set_indicator_color(color: string) {
        this._indicator_color = color;
    }

    /**
     * Set to true if you want the node to be draggable
     * 
     * @param {boolean} draggable true or false
     */
    set_draggable(draggable: boolean) {
        this._draggable = draggable;
    }

    /**
     * Set to true if we want this node to be selectable and highlightable
     * 
     * @param {boolean} test true or false
     */
    set_hit_test(test: boolean) {
        this._hit_test = test;
    }

    /**
     * sets the points of the polygon relative to x() and y()
     * 
     * @param {Array<JSON>} points in polygon
     */
    set_points(points: [Point]) {
        this._points = points;
        this.create_abs_points();
    }

    /**
     * Get the points of the polygon or path
     * @returns {Array<JSON>} [{x,y}...]
     */
    points() : [Point] { return this._points; }

    /**
     * makes an array of absolute coordinates so we dont have to calculate this every draw call
     * 
     */
    create_abs_points() {
        var r = this._center_rect;
        this._abs_points = [] as [Point];

        for (var i = 0; i < this._points.length; ++i) {
            this._abs_points.push({ x: r.x + this._points[i].x, y: r.y + this._points[i].y });
        }

        this.set_br(FDGMath.calc_br(this._abs_points));
    }

    /**
     * Sets the icon offset if we have an icon on the node
     * 
     * @param {number} x pixels x
     * @param {number} y pixels y
     */
    set_icon_offset(x: number, y: number) {
        this._icon_x_offset = x;
        this._icon_y_offset = y;
    }

    /**
     * Sets the font size of the caption display
     * 
     * @param {number} size
     */
    set_font_size(size: number) {
        this._font_size = size;
    }

    /**
     * Sets the color the caption will have, (deprecated?)
     * 
     * @param {String} color RGB color HEX
     */
    set_caption_color(color: string) {
        this._caption_color = color;
    }

    /**
     * Sets if we want the node to have its caption hidden whenever the mouse is not over it
     * 
     * @param {boolean} hidden true or false
     */
    set_autohidden_caption(hidden: boolean) {
        this._text_autohide = hidden;
    }

    /**
     * Sets the scale of the icon
     * 
     * @param {float} scale
     */
    set_icon_scale(scale: number) {
        this._icon_scale = scale;
    }

    /**
     * Adds an icon to be displayed side by side of each other
     * 
     * @param {GUI_icon} icon
     */
    set_icon(icon: GUI_icon, style: IconStyle) {
        this._icon_style = style;
        this._icon = icon;

        this.calc_icon_rect();

        this._state_changes.push(State.STATE_ICON_ADDED);
    }

    /**
     * Gets the rectangle for the icon as displayed on the screen, NOT the source rectangle
     */
    icon_rect() : Rect {
        return this._icon_rect;
    }

    calc_icon_rect() {
        var r = this._topleft_rect;

        if (this._icon_style == IconStyle.ICON_STYLE_NORMAL) {
            this._icon_rect = {x: r.x, y: r.y, w: this._icon.rect().w, h: this._icon.rect().h };
            return;
        }
        
        this._icon_rect = r;
    }

    /**
     * Sets the color of the icon
     * 
     * @deprecated dont use
     * @param {String} color RGB HEX
     */
    set_icon_color(color: string) {
        this._icon_color = color;
    }

    /**
     * Sets the background color of the node
     * 
     * @param {String} color RGB HEX
     */
    set_background_color(color: string) {
        this._background_color = color;
        this._shaded_color = color;
    }

    background_color() : string {
        return this._background_color;
    }

    /**
     * Sets the border color of the node
     * 
     * @param {String} color RGB HEX
     */
    set_border_color(color: string) {
        this._border_color = color;

        this._state_changes.push(State.STATE_COLOR_CHANGE);
    }

    /**
     * Sets the border thickness in pixels
     * 
     * @param {number} thickness 
     */
    set_border_thickness(thickness: number) {
        this._border_thickness = thickness;
    }

    /**
     * Set the global position of the node in pixel position in canvas
     * 
     * @param {number} x
     * @param {number} y
     */
    set_pos(x: number, y: number, recalculate: boolean = false) {
        var r = this.internal_get_rect();
        r.x = x;
        r.y = y;

        this.set_rect(r);

        if (recalculate) {
            this.recalculate();
        }
    }

    state() : State {
        if (this._state_changes.length <= 0) {
            return State.STATE_NO_CHANGE;
        }

        return this._state_changes[0];
    }

    bring_to_back() {
        this._state_changes.push(State.STATE_CHANGE_TO_BACK);
    }
    
    bring_to_front() {
        this._state_changes.push(State.STATE_CHANGE_TO_FRONT);
    }

    pop_state() {
        this._state_changes.splice(0,1);
    }

    clear_states() {
        this._state_changes = [] as [State];
    }
    
    /**
     * Sets the radius of the circle
     * @param {number} radius 
     */
    set_radius(radius: number) {
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
    set_height(height: number) {
        var r = this.internal_get_rect();

        r.h = height;

        this.set_rect(r);
    }

    /**
     * Sets the width of the node in pixels
     * 
     * @param {number} width
     */
    set_width(width: number) {
        var r = this.internal_get_rect();
        
        r.w = width;

        this.set_rect(r);
    }

    /**
     * Sets the caption of the node as String
     * 
     * @param {String} text
     */
    set_caption(text: string) {
        this._caption = text;
    }

    /**
     * Sets the _width to be as big as the caption and adds the given margin
     * 
     * @deprecated
     * @param {number} margin
     */
    calculate_width_from_caption(margin: number) {
        var r = this.internal_get_rect();
        //this._font_size+'px Bitstream Vera Sans Mono',
        r.w = this._renderer.calc_text_width(this._caption) + margin * 2;

        this.set_rect(r);
    }

    /**
     * Marks this node as selected
     * 
     * @param {boolean} selected true or false
     */
    set_selected(selected: boolean) {
        this._selected = selected;

        this._shaded_color = this.shaded_color();
    }

    /**
     * Gets the actual color of the node as its being rendered
     * 
     * @returns {String} color as hex
     */
    shaded_color() : string {
        if (this._selected) {
            return this._renderer.calc_shade_color(this._background_color, 0.5);
        }
        
        return this._background_color;
    }

    /**
     * WTF? 
     * */
    text_rect() : Rect {
        if (this._selected && this._text_autohide) {
            return { x: this._mx, y: this._my, w: 0, h: 0 };
        }
        else if (!this._text_autohide) {
            var r = this.internal_get_rect();

            var w = this._renderer.calc_text_width(this._caption);

            return { x: r.x - w/2, y: r.y, w: 0, h: 0 };
        }

        return null;
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
     * Test if the point is located inside the node
     * 
     * @param {number} x position
     * @param {number} y position
     * 
     * @returns {GUI_node} null if no hit test
     */
	hit_test(x: number, y: number) : GUI_node|null {
        
        if (!this._hit_test) { return null; }

        var calc_rect = null;

        var test = false;

        if (this._shape == 'circle') {
            calc_rect = this._center_rect;
            test = (x - calc_rect.x)*(x - calc_rect.x) + (y - calc_rect.y)*(y - calc_rect.y) < this._radius*this._radius;
        }
        else if (this._shape == 'polygon') {
            test = FDGMath.p_poly(this._abs_points, x, y);
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
            test = FDGMath.point_in_triangle(x, y, calc_rect.x - calc_rect.w/2, calc_rect.y + calc_rect.h/2, calc_rect.x + calc_rect.w/2, calc_rect.y + calc_rect.h/2, calc_rect.x, calc_rect.y - calc_rect.h/2);
        }
        
        
        if (test) { return this; }
        return null;
    }
};