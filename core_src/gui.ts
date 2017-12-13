import { Context } from "vm";

import { Rect } from './guimath';
import { Point } from './guimath';
import { FDGMath } from './guimath';
import { Anchor } from './guitypes';
import { BackgroundImage } from './guitypes';
import { MouseButton } from './guitypes';
import { State } from './guitypes';
import { IconStyle } from './guitypes';
import { NodeOverlaps } from './guitypes';

import { Render_screen } from './render';
import { GUI_node } from './guinode';
import { GUI_line_2_node } from './guinode';
import { GUI_quad } from './guiquad';
import { GUI_atlas } from './guiicon';
import { Render_type_handler } from './rendertype';
import { RenderType } from './guitypes';



/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 
 */

var _draw_calls_per_frame = 0;
var _draw_calls = 0;


var _global_gui_id: number = 0;

var _gui_containers = [];
/*
var sort_nodes_by_rt = function(a, b) {
    var art = a.rt().id;
    var brt = b.rt().id;

    if (art > brt) {
        return 1;
    }
    else if (art < brt) {
        return -1;
    }

    return 0;
}
  */


var on_mouse_over = function(event) {
    
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = true;
    }
}

var on_mouse_out = function(event) {
    console.log('MOUSE OUT');
    var x = event.clientX;
    var y = event.clientY;


    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = false;
        var rect = g.canvas().getBoundingClientRect();
        var myrect = {x: rect.left, y: rect.top, w: rect.width, h: rect.height };
        
        //if (!point_in_rect(x, y, myrect)) {
        g.mouseout(x - myrect.x, y - myrect.y);
        //}
    }
}

var on_mouse_move = function(event) {
    
    for (var i = 0; i < _gui_containers.length; ++i) {
        
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();

        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        //console.log('MOUSE MOVE: ' + x + ' y: ' + y);

        g.mousemove(x, y);
    }
}

var on_mouse_down = function(event) {
    
    for (var i = 0; i < _gui_containers.length; ++i) {
        
    
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        console.log('MOUSE DOWN: ' + x + ' y: ' + y);

        g.mousedown(x, y, event.button);
    }
}

var on_mouse_up = function(event) {
    
    console.log('MOUSE UP');
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();

        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        g.mouseup(x, y, event.button);
    }
}


var on_mouse_wheel = function (e, canvas) {
    for (var i = 0; i < _gui_containers.length; ++i) {
        if (canvas == _gui_containers[i].canvas()) {
            var g = _gui_containers[i];
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            
            g.wheel(delta);
        }
    }
}

function is_event_supported(eventName) {
    var el = document.createElement('div');
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
    }
    el = null;
    return isSupported;
}

var draw_frame = function() {
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        
        g.draw('default', true);
    }
    
    window.requestAnimationFrame(draw_frame);
}
draw_frame();

/*
//swiping mechanics

docucment.addEventListener('touchstart', handleTouchStart, false);        
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
    private _select_boxing:     { running: boolean, rect: Rect };
    private _draw_history:      [number];
    private _anchor_point:      number;
    private _canvas_elem:       HTMLCanvasElement;
    private _width:             number;
    private _height:            number;
    private _renderer:          Render_screen;
    private _zoom_enabled:      boolean;
    private _pan_enabled:       boolean;
    private _select_box_enabled: boolean;
    private _draw_counter:      number;
    private _dragging:          boolean;
    private _drag_node:         GUI_node;
    private _high_node:         GUI_node;


    private _nodes:             [GUI_node];
    private _lines:             { [id: string]: GUI_line_2_node; };
    private _layer:             string;
    private _locked:            boolean;
    private _mouse_inside:      boolean;
    private _zoom_factor:       number;
    private _center:            {x: number, y: number};
    

    private _quads:             { [id: string]: GUI_quad; };
    private _quad_division:     number;

    private _selected_nodes:    { [id: string]: GUI_node; };
    private _prev_center:       {x: number, y: number};
    private _force_draw:        boolean;
    private _bg_image:          HTMLImageElement;
    private _bg_sizing:         number;
    private _rect:              { x: number, y: number, w: number, h: number };


    private _pos_rect:          { x: number, y: number, w: number, h: number };
    
    private _render_types:      Render_type_handler;
    private _events:            { [key: string]: [ (x: number, y: number, button: number, node: GUI_node|null) => void ] };


    /*_cached: { [key: string]: { [id: string]: DBRecord; } } = { };


    private _events: {[key: string]: { [id: string]: }};*/

    /**
     * constructor, needs the html canvas id to draw to
     * Creates a Render_screen
     * 
     * @param {id} canvas_id ID of the canvas element
     * @param {number} quad_division default 8 will create a grid of 8x8 quads for optimization purposes
     */
    constructor(canvas_id, anchor_point: number = Anchor.ANCHOR_CENTER, quad_division = 2) {
        _gui_containers.push(this);

        init_selection_box();

        this._events = {}
        this._events['click'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['node_selected'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['node_highlight'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['node_deselected'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['mousemove'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['mousedown'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];
        this._events['mouseup'] = [] as [(x: number, y: number, button: number, node: GUI_node) => void ];

        this._select_boxing = { running: false, rect: null };

        this._draw_history = [] as [number];

        this._anchor_point = anchor_point;

        this._canvas_elem = document.getElementById(canvas_id) as HTMLCanvasElement;

        this._width = this._canvas_elem.offsetWidth;
        this._height = this._canvas_elem.offsetHeight;

        this._renderer = new Render_screen(canvas_id, this._width, this._height);
        this._renderer.set_font(12, 'Verdana');

        this._zoom_enabled       = false;
        this._pan_enabled        = false;
        this._select_box_enabled = false;
        
        
        // when document is finished loading
        document.addEventListener('DOMContentLoaded', function(){
            
            var htmls = document.getElementsByTagName('html');
            var bodys = document.getElementsByTagName('body');
            
            if (htmls.length == 0) {
                console.error('num <html> tags is 0, critical error');
            }

            if (bodys.length == 0) {
                console.error('num <body> tags is 0, critical error');
            }

            for (var i = 0; i < htmls.length; ++i) {
                //htmls[i].style.height= "100%";
                //htmls[i].style.overflow= "hidden";
                console.log('setting html style');

                htmls[i].setAttribute('onmouseover',    'on_mouse_over(event);');
                //htmls[i].setAttribute('onmouseout',     'on_mouse_out(event);');
                htmls[i].setAttribute('onmousemove',    'on_mouse_move(event);');
                htmls[i].setAttribute('onmousedown',    'on_mouse_down(event);');
                htmls[i].setAttribute('onmouseup',      'on_mouse_up(event);');
                
                break;
            }

            for (var i = 0; i < bodys.length; ++i) {
                //bodys[i].style.height= "100%";
                //bodys[i].style.overflow= "hidden";

                break;
            }

        }, false);

        this._draw_counter = 0;

        this._canvas_elem.addEventListener('mousewheel', function(e) {
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            
            this.wheel(delta);
        }.bind(this), false);
    
        this._dragging = false;
        this._drag_node = null;
        this._high_node = null;
        
        //some tests
        this._nodes = [] as [GUI_node];
        this._lines = {};
        this._layer = 'default';
        this._locked = false;
        this._mouse_inside = false;
        this._zoom_factor = 1.0;
        this._center = {x: this._width / 2, y: this._height / 2};

        this._quads = {};
        this._quad_division = quad_division;

        this._selected_nodes = {};
        this._prev_center = {x: 0, y: 0};
        this._force_draw = false;
        this._bg_image = null;
        this._bg_sizing = 0;
        this._rect = { x: 0, y: 0, w: this._width, h: this._height };

        var r = this._canvas_elem.getBoundingClientRect();

        this._pos_rect = { x: r.left, y: r.top, w: this._width, h: this._height };

        this._render_types = new Render_type_handler(this._renderer);

        this.generate_quads(quad_division);

        this.add_layer(this._layer);

    }

    /**
     * returns the average amount of drawcalls per frame based on the 60 most recent frames
     * 
     * @returns {number}
     */
    num_drawcalls() : number {
        var sum = 0;
        for (var i = 0; i < this._draw_history.length; ++i) {
            sum += this._draw_history[i];
        }

        return sum / this._draw_history.length;
    }

    init() {

    }

    set_static_background_image(img_src: string, scale: number) {
        var loadingimage = new Image();
        var that = this;

        var canvas = document.getElementById('bg') as HTMLCanvasElement;
        var context = canvas.getContext('2d');
        loadingimage.src = img_src;

        loadingimage.addEventListener('load', function() {
            
            var fw = loadingimage.width * scale;
            var fh = loadingimage.height * scale;

            var cw = that._width;
            var ch = that._height;

            if (fw > cw) {
                console.error('image wont fit, stretching');
            }
            
            if (fh > ch) {
                console.error('image wont fit, stretching');
            }

            var empty_w = cw - fw;
            var empty_h = ch - fh;


            context.drawImage(loadingimage, 0, 0, loadingimage.width, loadingimage.height, empty_w/2, empty_h/2, cw - empty_w, ch - empty_h);
            that = null;
            loadingimage = null;
        });
        
        
    }

    /**
     * Loads an image from a source path and creates a new image object, if successful, will create an atlas and pass it on to the callback function
     */
    load_atlas(img_src: string, name: string, callback: (GUI_atlas) => void) {
        var loadingimage = new Image();
        var that = this;
        

        loadingimage.addEventListener('load', function() {

            var rect = {x: 0, y: 0, w: loadingimage.width, h:  loadingimage.height};
            var atlas = new GUI_atlas(loadingimage, '');    
            
            callback(atlas);
            callback = null;
            atlas = null;
            that = null;
            rect = null;
        });
        
        loadingimage.src = img_src;
    }

    get_quad(key: string) : GUI_quad {
        return this._quads[key];
    }

    set_bg_image_obj(image: HTMLImageElement) {
        this._bg_image = image;
    }

    /**
     * Sets a background image for the entire canvas
     */
    set_bg_image(img_src: string, sizing: number = BackgroundImage.BACKGROUND_IMAGE_STRETCH) {

        var loadingimage = new Image();
        var that = this;

        this._bg_sizing = sizing;

        loadingimage.addEventListener('load', function() {
            
            that.set_bg_image_obj(loadingimage);
            var rect = {x: 0, y: 0, w: that._bg_image.width, h:  that._bg_image.height};
        
            if (that._bg_sizing == BackgroundImage.BACKGROUND_IMAGE_STRETCH) {
                var x_div = rect.w / that._quad_division;
                var y_div = rect.h / that._quad_division;

                for (var gy = 0; gy < that._quad_division; ++gy) {
                    for (var gx = 0; gx < that._quad_division; ++gx) {
                        var r = {x: x_div * gx, y: y_div * gy, w: x_div, h: y_div};
                        
                        that._quads[gx+':'+gy].set_bg_image(loadingimage, r);
                    }
                }
            }

            that = null;
            loadingimage = null;
        });
        
        loadingimage.src = img_src;
    }

    /**
     * register event listeners on the gui
     * 
     * @param {String} event_str 'click', 'node_selected', 'node_deselected'
     * @param {Callback} callback the callback to be called
     */
    on(event_str: string, callback) {
        this._events[event_str].push(callback);
    }

    canvas() : HTMLCanvasElement {
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
                //this._quads[id].set_bg_color(random_hex_color());
                this._quads[id].set_bg_color('#000');
            }
        }
    }

    /**
     * calculates which quads the node should go into
     * 
     * @param {GUI_node} gui_node the gui node to calculate which quad to add to
     */
    calc_quads_for_node(gui_node: GUI_node) : { [key: string] : GUI_quad } {
        var quads = {};

        for (var k in this._quads) {
            
            var res = this._quads[k].calc_node_inside(gui_node);
            if (res == NodeOverlaps.NODE_FULLY_INSIDE) {
                quads[k] = this._quads[k];
                return quads;
            }
            else if (res == NodeOverlaps.NODE_PARTIALLY_INSIDE) {
                quads[k] = this._quads[k];
            }
        }

        return quads;
    }

    /**
     * Same as create_box only this one will create a box with given id and starts the ID counter from id+1
     */
    create_stored_box(
        id: number, 
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        caption: string = '', 
        background_color: string = '#000', 
        border: number = 1, 
        border_color: string = '#fff') : GUI_node {
        
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].id() == id) {
                return this._nodes[i];
            }
        }

        var g = new GUI_node(this._renderer, id, this._anchor_point, 'square');

        _global_gui_id = id + 1;

        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_background_color(background_color);
        //g.set_border_color(border_color);
        g.set_border_color('#000');
        g.set_caption(caption);
        g.set_border_thickness(border);
        g.recalculate();
        g.set_prev_state(x, y, width, height);
        this._nodes.push(g);

        var rt = this._render_types.add_square(background_color);
        rt.add_node(g);
        var rt_b = this._render_types.add_border(border, '#000');
        rt_b.add_node(g);
        //g.set_render_type(rt);
        //g.set_render_type_handler(this._render_types);

        //g.print();
        
        var q = this.calc_quads_for_node(g);

        for (var k in q) {
            q[k].add_node(g);
        }

        g.set_quad_ids(Object.keys(q));

        //this._nodes.sort(sort_nodes_by_rt);

        return g;
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
    create_box(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        caption: string = '', 
        background_color: string = '#000', 
        border: number = 1, 
        border_color: string = '#fff') : GUI_node {
        var g = new GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'square');

        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_background_color(background_color);
        //g.set_border_color(border_color);
        g.set_border_color('#000');
        g.set_caption(caption);
        g.set_border_thickness(border);
        g.recalculate();
        g.set_prev_state(x, y, width, height);
        this._nodes.push(g);

        var rt = this._render_types.add_square(background_color);
        rt.add_node(g);
        var rt_b = this._render_types.add_border(border, '#000');
        rt_b.add_node(g);

        if (caption != '') {
            var rt_t = this._render_types.add_text('#ffffff');
            rt_t.add_node(g);
        }
        
        
        var q = this.calc_quads_for_node(g);

        for (var k in q) {
            q[k].add_node(g);
        }

        if (Object.keys(q).length <= 0) {
            console.error('No quads for node!');
        }

        g.set_quad_ids(Object.keys(q));

        //this._nodes.sort(sort_nodes_by_rt);

        return g;
    }

    get_current_id() : number {
        return _global_gui_id;
    }

    /**
     * Creates and returns a new polygon
     * 
     * @param {number} x x position in canvas
     * @param {number} y y position in canvas
     * @param {Array<JSON>} points points relative to x and y
     * @param {String} caption text to show in the box
     * @param {String} background_color background color
     * @param {number} border border thickness
     * @param {number} border_color border color around the box
     */
    create_stored_polygon(
        id: number, 
        x: number, 
        y: number, 
        points: [Point],
        caption: string = '', 
        background_color: string = '#000', 
        border: number = 1, 
        border_color: string = '#000000') : GUI_node {
        
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].id() == id) {
                return this._nodes[i];
            }
        }

        _global_gui_id = id + 1;

        var g = new GUI_node(this._renderer, id, this._anchor_point, 'polygon');

        var min_x = FDGMath.min_arr(points, 'x');
        var max_x = FDGMath.max_arr(points, 'x');
        var min_y = FDGMath.min_arr(points, 'y');
        var max_y = FDGMath.max_arr(points, 'y');

        var width   = max_x - min_x; 
        var height  = max_y - min_y;

        //console.log('p width: ' + width + ' p height: ' + height);

        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_points(points); // we must call set points AFTER set_pos
        g.set_prev_point_state(g.abs_points());
        //g.print();

        g.set_background_color(background_color);
        g.set_border_color(border_color);
        g.set_caption(caption);
        g.set_border_thickness(border);

        var rt = this._render_types.add_polygon(background_color);
        rt.add_node(g);
        var rt_b = this._render_types.add_border_poly(border, border_color);
        rt_b.add_node(g);

        if (caption != '') {
            var rt_t = this._render_types.add_text('#000000');
            rt_t.add_node(g);
        }
        
        this._nodes.push(g);
        
        var q = this.calc_quads_for_node(g);

        for (var k in q) {
            q[k].add_node(g);
        }
       

        g.set_quad_ids(Object.keys(q));

        return g;
    }

    /**
     * Creates and returns a new polygon
     * 
     * @param {number} x x position in canvas
     * @param {number} y y position in canvas
     * @param {Array<JSON>} points points relative to x and y
     * @param {String} caption text to show in the box
     * @param {String} background_color background color
     * @param {number} border border thickness
     * @param {number} border_color border color around the box
     */
    create_polygon(
        x: number, 
        y: number, 
        points: [Point], 
        caption: string = '', 
        background_color: string = '#000', 
        border: number = 1, 
        border_color: string = '#fff') : GUI_node {
        var g = new GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'polygon');

        var min_x = FDGMath.min_arr(points, 'x');
        var max_x = FDGMath.max_arr(points, 'x');
        var min_y = FDGMath.min_arr(points, 'y');
        var max_y = FDGMath.max_arr(points, 'y');

        var width   = max_x - min_x; 
        var height  = max_y - min_y;

        console.log('p width: ' + width + ' p height: ' + height);

        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_points(points); // we must call set points AFTER set_pos
        g.set_prev_point_state(g.abs_points());
        //g.print();

        g.set_background_color(background_color);
        g.set_border_color(border_color);
        g.set_caption(caption);
        g.set_border_thickness(border);

        var rt = this._render_types.add_polygon(background_color);
        rt.add_node(g);
        var rt_b = this._render_types.add_border_poly(border, border_color);
        rt_b.add_node(g);

        if (caption != '') {
            var rt_t = this._render_types.add_text('#ffffff');
            rt_t.add_node(g);
        }
        
        this._nodes.push(g);
        
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
    create_circle(
        x: number, 
        y: number, 
        radius: number, 
        caption: string = '', 
        background_color: string = '#aaaaaa', 
        border: number = 0.5, 
        border_color: string = '#000') : GUI_node {

        var g = new GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'circle');

        
        g.set_pos(x, y);
        g.set_radius(radius);
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
     * Supply the ID of a quad and it shall be returned
     * 
     * @param {String} id id of quad
     * 
     * @returns {GUI_quad} null if not found
     */
    get_quad_with_id(id: string) : GUI_quad {
        if (id in this._quads) {
            return this._quads[id];
        }

        return null;
    }

    /**
     * @param {number} id id of node
     * 
     * @returns {GUI_node} null if not found
     */
    get_node_with_id(id: number) : GUI_node {
        for (var k in this._quads) {
            var n = this._quads[k].get_node_with_id(id);

            if (n != null) {
                return n;
            }
        }

        return null;
    }

    /**
     * Updates the quads for the node for speedier hit tests
     */
    update_node_quads(gui_node: GUI_node) {
        
        var calced_qs = this.calc_quads_for_node(gui_node);

        for (var cck in calced_qs) {
            calced_qs[cck].add_node(gui_node);
        }

        gui_node.set_quad_ids(Object.keys(calced_qs));
    }


    /**
     * Sets the zoom factor centered on the given absolute coordinate in canvas space
     * 
     * Forces a full redraw of the GUI
     * 
     * @param {number} center_x the center x point to zoom on
     * @param {number} center_y the center y point to zoom on
     * @param {number} factor sets the zoom factor, 1.0 is no zoom
     */
    set_zoom(center_x: number, center_y: number, factor: number) {
        this._zoom_factor = factor;
        this._center = {x: center_x, y: center_y};


        console.log('zoomed, pos: ' + center_x + ', ' + center_y + ' factor: ' + this._zoom_factor);

        // remove all nodes from each quad
        for (var k in this._quads) {
            this._quads[k].clear_nodes();
        }

        // reposition the nodes
        for (var nk = 0; nk < this._nodes.length; ++nk) {
            var node = this._nodes[nk];
            if (node == null) {
                console.log('null node, how?');
                continue;
            }
            
            try {
                if (node.shape() == 'polygon') {
                    //console.log('polygon shape, before:');
                    var points = node.points();
                    var ppoints = node.prev_point_state();

                    //node.print();
                    for (var i = 0; i < points.length; ++i) {
                        points[i].x = Math.round((ppoints[i].x*factor));
                        points[i].y = Math.round((ppoints[i].y*factor));
                    }
                    node.set_points(points);

                    //console.log('polygon shape, after:');
                    //node.print();
                }
                else {
                    var pos = node.pos();
                    var help = node.prev_state();
                    node.set_width(Math.round(help.w * factor));
                    node.set_height(Math.round(help.h * factor));
                    node.set_pos(Math.round((help.x * factor) - center_x), Math.round((help.y * factor) - center_y));
                }
                
                this.update_node_quads(node);
                
            } catch (ex) {
                console.log('exception: ' + node.id() + ':' + ex)
            }
            
        }

        // mark all quads as changed
        for (var k in this._quads) {
            this._quads[k].set_changed(true);
        }

        this._prev_center = this._center;
        this._force_draw = true;
    
    }

    /**
     * Sets the center of the GUI
     * 
     * Forces a full redraw of the GUI
     * 
     * @param {number} x center on x
     * @param {number} y center on y
     * 
     * @returns {JSON} new center point {x,y}
     */
    set_center(x: number, y: number) {
        this._center = {x: x, y: y};

        var delta_x = this._center.x - this._prev_center.x;
        var delta_y = this._center.y - this._prev_center.y;

        //console.log('setting center: ' + delta_x + ' ' + delta_y);

        // reposition the nodes
        for (var nk = 0; nk < this._nodes.length; ++nk) {
            var node = this._nodes[nk];
            var pos = node.pos();
            node.set_pos(Math.round(pos.x + delta_x), Math.round(pos.y + delta_y), true);
        }

        this._prev_center = this._center;
        this._force_draw = true;

        return this._center;
    }

    /**
     * @returns {boolean} if mouse is inside the GUI canvas
     */
    is_mouse_inside() : boolean {
        return this._mouse_inside;
    }

    /**
     * Add a new layer
     * 
     * @param {String} layer name of the layer
     */
    add_layer(layer: string) {
        //this._nodes[layer] = [];
        //this._lines[layer] = [];
    }

    /**
     * Set the layer as active, subsequent calls which interacts with GUI_nodes will be made on the current layer
     * 
     * @param {String} layer layer name
     */
    set_layer(layer: string) {
        this._layer = layer;
    }

    /**
     * get current layer
     * @returns {String} layer name
     */
    layer() { return this._layer; }

    locked() : boolean { return this._locked; }

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
    /*fetch_all_gui_nodes(container) {
        for (var i = 0; i < this._nodes[this._layer].length; ++i) {
            this._nodes[this._layer][i].fetch_gui_children(container);

            container.push(this._nodes[this._layer][i]);
        }
    }*/

    /**
     * adds an icon for internal lookup, must be called before attempting to draw the icon
     * 
     * @param {id} element_id HTML id of the img element
     * @param {String} name name of the icon to be used in subsequent calls to draw it
     */
    add_icon(element_id: string, name: string) {
        //this._renderer.add_icon(new GUI_icon(element_id, name));
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
    /*clear_layer() {
        this._nodes[this._layer] = [];
        this._lines[this._layer] = [];
    }*/

    /**
     * Gets all the GUI nodes
     * 
     * @returns {Array<GUI_node>} array of GUI_nodes 
     */
    nodes() {
        return this._nodes;
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
        /*var line = new GUI_line_2_node(this._renderer);
        line.add_node(node1);
        line.add_node(node2);

        this._lines.push(line);*/
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

    remove_node(node) {
        console.log('removing from all');
        this._render_types.remove_node_from_all(node);

        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i] == node) {
                this._nodes.splice(i,1);
            }
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

        for (var k in this._selected_nodes) {
            
            var node = this._selected_nodes[k];
            if (!node.highlightable()) {
                continue;
            }
            node.set_selected(false);
            this.mark_changed_node(node);

            var rt = null;

            if (node.shape() == 'square') {
                this._render_types.remove_node(node, RenderType.RT_SQUARE);
                rt = this._render_types.add_square(node.shaded_color());
            }
            else if (node.shape() == 'polygon') {
                this._render_types.remove_node(node, RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon(node.shaded_color());
            }
            
            rt.add_node(node);
            
        }

        this._selected_nodes = {} as {GUI_node};

        for (var k in nodes) {
            if (!nodes[k].highlightable()) {
                continue;
            }
            this._selected_nodes[k] = nodes[k];
            nodes[k].set_selected(true);
            var rt = null;

            if (nodes[k].shape() == 'square') {
                this._render_types.remove_node(nodes[k], RenderType.RT_SQUARE);
                rt = this._render_types.add_square(nodes[k].shaded_color());
            }
            else if (nodes[k].shape() == 'polygon') {
                this._render_types.remove_node(nodes[k], RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon(nodes[k].shaded_color());
            }
            rt.add_node(nodes[k]);
            nodes[k].set_mousepos(x,y);
        }

    }

    state_change_node(guinode) {
        var rt = null;

        if (guinode.shape() == 'square') {
            this._render_types.remove_node(guinode, RenderType.RT_SQUARE);
            rt = this._render_types.add_square(guinode.shaded_color());
        }
        else if (guinode.shape() == 'polygon') {
            this._render_types.remove_node(guinode, RenderType.RT_POLYGON);
            rt = this._render_types.add_polygon(guinode.shaded_color());
        }

        rt.add_node(guinode);

        guinode.pop_state();
    }

    /**
     * When the mouse wheel has been activated on the canvas 
     * 
     * @param {number} delta the delta value of the wheel
     */
    wheel(delta) {
        if (!this._zoom_enabled) {
            return;
        }
        
        if (delta < 0) {
            // zoom out
            this.set_zoom(0, 0, 1.0);
        }
        else if (delta > 0) {
            this.set_zoom(this.width(), this.height(), 4.0);
        }
    }

    /**
     * When a mousebutton has been pushed, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} button MOUSEBUTTON_LEFT -> left, MOUSEBUTTON_MIDDLE -> middle, MOUSEBUTTON_RIGHT -> right
     */
    mousedown(x: number, y: number, button: MouseButton) {
        if (!FDGMath.point_in_rect(x, y, this._rect)) {
            return;
        }

        if (this._select_box_enabled && button == MouseButton.MOUSEBUTTON_LEFT) {
            this._select_boxing.running = true;
            this._select_boxing.rect.x = x;
            this._select_boxing.rect.y = y;
        }

        for (var i = 0; i < this._events['click'].length; ++i) {
            this._events['click'][i](x, y, button, null);
        }

        for (var i = 0; i < this._events['mousedown'].length; ++i) {
            this._events['mousedown'][i](x, y, button, null);
        }

        var q = this.get_quad_at_pos(x,y);
        
        if (this.locked()) { return; }
        
        if (this._high_node != null) {
            this._high_node.set_highlighted(false);
            this.mark_changed_node(this._high_node);
        }

        var nodes = this.get_nodes_at_pos(x,y);

        if (Object.keys(nodes).length == 0) {
            console.error('no nodes');
            return;
        }

        this._dragging = true;
        this._drag_node = nodes[Object.keys(nodes)[0]];
        
        /* dragging and selection functionality */
        if (this._drag_node != null) {
            this._drag_node.set_selected(true);
            this.mark_changed_node(this._drag_node);
        
            var rt = null;

            if (this._drag_node.shape() == 'square') {
                this._render_types.remove_node(this._drag_node, RenderType.RT_SQUARE);
                rt = this._render_types.add_square('#33ff33');
            }
            else if (this._drag_node.shape() == 'polygon') {
                this._render_types.remove_node(this._drag_node, RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon('#33ff33');
            }

            rt.add_node(this._drag_node);

            for (var i = 0; i < this._events['node_selected'].length; ++i) {
                this._events['node_selected'][i](x, y, button, this._drag_node);
            }
        }
        
        /* node highlight when mouse over */
        this._high_node = nodes[Object.keys(nodes)[0]];
        
        if (this._high_node != null) {
            this._high_node.set_highlighted(true);
            this.mark_changed_node(this._high_node);
            
            for (var i = 0; i < this._events['node_highlight'].length; ++i) {
                this._events['node_highlight'][i](x, y, button, this._high_node);
            }
        }
    }

    /**
     * When a mousebutton has been released, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y
     */
    mouseup(x, y, button) {
        console.log('RELEASE: ' + button);
        if (button == MouseButton.MOUSEBUTTON_LEFT) {
            console.log('CLOSING SELECT BOX');

            var brect = this._select_boxing.rect;

            /*for (var i = 0; i < this._nodes.length; ++i) {
                if (point_in_rect(this._nodes[i].x(), this._nodes[i].y(), brect)) {
                    console.log(this._nodes[i].id() + ' inside rect');
                }
            }*/

            this._select_boxing.running = false;
            close_selection_box();
        }

        if (this.locked()) { return; }
        
        for (var i = 0; i < this._events['mouseup'].length; ++i) {
            this._events['mouseup'][i](x, y, button, null);
        }
        
        for (var i = 0; i < this._nodes.length; ++i) {
            this.update_node_quads(this._nodes[i]);
        }
        

        this._dragging = false;
        this._drag_node = null;
    }

    mouseout(x, y) {
        console.log('mouseout');
        this._select_boxing.running = false;
        close_selection_box();
    }

    /**
     * When the mouse has moved over the GUI, this function should be called so the GUI can interact with it
     * 
     * @param {number} x 
     * @param {number} y 
     */
    mousemove(x, y) {
        
        if (this._select_boxing.running) {
            
            var bx = this._select_boxing.rect.x + this._pos_rect.x;
            var by = this._select_boxing.rect.y + this._pos_rect.y;

            var width = (x + this._pos_rect.x) - bx;
            var height = (y + this._pos_rect.y) - by;

            this._select_boxing.rect.w = width;
            this._select_boxing.rect.h = height;

            selection_box(bx, by, width, height);
        }

        if (this.locked()) { return; }

        for (var i = 0; i < this._events['mousemove'].length; ++i) {
            this._events['mousemove'][i](x, y, -1, null);
        }

        if (!this._dragging) {
            this.select_nodes_at_pos(x, y);
            return;
        }

        if (this._drag_node != null && this._drag_node.draggable()) {
            this._drag_node.set_pos(x,y,true);
        }
    }

    get_shapes(type) {
        var arr = [];

        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].shape() == type) {
                arr.push(this._nodes[i]);
            }
        }

        return arr;
    }

    
    /**
     * @param {String} layer name of the layer to draw
     * @param {boolean} [swap=true] if we should swap buffer or not
     */
    draw(layer = 'default', swap = true) {
        if (_draw_calls++ > 45) {
            // check for state changes every nth frame
            for (var i = 0; i < this._nodes.length; ++i) {
                var node = this._nodes[i];
                var state = node.state();
                if (state == State.STATE_NO_CHANGE) {
                    continue;
                }

                if (state == State.STATE_CHANGE_TO_FRONT) {
                    
                    this._render_types.push_to_front(node);
                    node.pop_state();
                }
                else if (state == State.STATE_CHANGE_TO_BACK) {
                    this._render_types.push_back(node);
                    node.pop_state();
                }
                else if (state == State.STATE_ICON_ADDED) {
                    var rt_i = this._render_types.add_icon();
                    rt_i.add_node(node);
                    node.pop_state();
                }
                else {
                    this.state_change_node(node);
                }
            }

            _draw_calls = 0;
        }

        //this._renderer.pre_draw();

        this._render_types.draw();

        //this._renderer.post_draw();

        this._renderer.swap_buffer(this._rect);
    }

    /**
     * Prints info about the GUI
     */
    print() {
        this._render_types.print();


        /*var prev_rt = null;
        for (var i = 0; i < this._nodes.length; ++i) {
            var rt = this._nodes[i].rt();

            if (prev_rt != rt) {
                console.log("GUI: rt: " + rt);
                prev_rt = rt;
            }            
        }*/
        
    }
};

