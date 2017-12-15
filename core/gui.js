"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var guimath_1 = require("./guimath");
var guitypes_1 = require("./guitypes");
var guitypes_2 = require("./guitypes");
var guitypes_3 = require("./guitypes");
var guitypes_4 = require("./guitypes");
var guitypes_5 = require("./guitypes");
var render_1 = require("./render");
var guinode_1 = require("./guinode");
var guiquad_1 = require("./guiquad");
var guiicon_1 = require("./guiicon");
var rendertype_1 = require("./rendertype");
var guitypes_6 = require("./guitypes");
var _draw_calls_per_frame = 0;
var _draw_calls = 0;
var _global_gui_id = 0;
var _gui_containers = [];
var on_mouse_over = function (event) {
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = true;
    }
};
var on_mouse_out = function (event) {
    console.log('MOUSE OUT');
    var x = event.clientX;
    var y = event.clientY;
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g._mouse_inside = false;
        var rect = g.canvas().getBoundingClientRect();
        var myrect = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
        g.mouseout(x - myrect.x, y - myrect.y);
    }
};
var on_mouse_move = function (event) {
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        g.mousemove(x, y);
    }
};
var on_mouse_down = function (event) {
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log('MOUSE DOWN: ' + x + ' y: ' + y);
        g.mousedown(x, y, event.button);
    }
};
var on_mouse_up = function (event) {
    console.log('MOUSE UP');
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        var rect = g.canvas().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        g.mouseup(x, y, event.button);
    }
};
var on_mouse_wheel = function (e, canvas) {
    for (var i = 0; i < _gui_containers.length; ++i) {
        if (canvas == _gui_containers[i].canvas()) {
            var g = _gui_containers[i];
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            g.wheel(delta);
        }
    }
};
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
var draw_frame = function () {
    for (var i = 0; i < _gui_containers.length; ++i) {
        var g = _gui_containers[i];
        g.draw('default', true);
    }
    window.requestAnimationFrame(draw_frame);
};
draw_frame();
var GUI = (function () {
    function GUI(canvas_id, anchor_point, quad_division) {
        if (anchor_point === void 0) { anchor_point = guitypes_1.Anchor.ANCHOR_CENTER; }
        if (quad_division === void 0) { quad_division = 2; }
        console.log('GUI Constructor for ' + canvas_id);
        _gui_containers.push(this);
        init_selection_box();
        this._events = {};
        this._events['click'] = [];
        this._events['node_selected'] = [];
        this._events['node_highlight'] = [];
        this._events['node_deselected'] = [];
        this._events['mousemove'] = [];
        this._events['mousedown'] = [];
        this._events['mouseup'] = [];
        this._select_boxing = { running: false, rect: null };
        this._draw_history = [];
        this._anchor_point = anchor_point;
        this._canvas_elem = document.getElementById(canvas_id);
        this._width = this._canvas_elem.offsetWidth;
        this._height = this._canvas_elem.offsetHeight;
        this._renderer = new render_1.Render_screen(canvas_id, this._width, this._height);
        this._renderer.set_font(12, 'Verdana');
        this._zoom_enabled = false;
        this._pan_enabled = false;
        this._select_box_enabled = false;
        document.addEventListener('DOMContentLoaded', function () {
            var htmls = document.getElementsByTagName('html');
            var bodys = document.getElementsByTagName('body');
            if (htmls.length == 0) {
                console.error('num <html> tags is 0, critical error');
            }
            if (bodys.length == 0) {
                console.error('num <body> tags is 0, critical error');
            }
            for (var i = 0; i < htmls.length; ++i) {
                console.log('setting html style');
                htmls[i].setAttribute('onmouseover', 'on_mouse_over(event);');
                htmls[i].setAttribute('onmousemove', 'on_mouse_move(event);');
                htmls[i].setAttribute('onmousedown', 'on_mouse_down(event);');
                htmls[i].setAttribute('onmouseup', 'on_mouse_up(event);');
                break;
            }
            for (var i = 0; i < bodys.length; ++i) {
                break;
            }
        }, false);
        this._draw_counter = 0;
        this._canvas_elem.addEventListener('mousewheel', function (e) {
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            this.wheel(delta);
        }.bind(this), false);
        this._dragging = false;
        this._drag_node = null;
        this._high_node = null;
        this._nodes = [];
        this._lines = {};
        this._layer = 'default';
        this._locked = false;
        this._mouse_inside = false;
        this._zoom_factor = 1.0;
        this._center = { x: this._width / 2, y: this._height / 2 };
        this._quads = {};
        this._quad_division = quad_division;
        this._selected_nodes = {};
        this._prev_center = { x: 0, y: 0 };
        this._force_draw = false;
        this._bg_image = null;
        this._bg_sizing = 0;
        this._rect = { x: 0, y: 0, w: this._width, h: this._height };
        var r = this._canvas_elem.getBoundingClientRect();
        this._pos_rect = { x: r.left, y: r.top, w: this._width, h: this._height };
        this._render_types = new rendertype_1.Render_type_handler(this._renderer);
        this.generate_quads(quad_division);
        this.add_layer(this._layer);
    }
    GUI.prototype.num_drawcalls = function () {
        var sum = 0;
        for (var i = 0; i < this._draw_history.length; ++i) {
            sum += this._draw_history[i];
        }
        return sum / this._draw_history.length;
    };
    GUI.prototype.init = function () {
    };
    GUI.prototype.set_static_background_image = function (img_src, scale) {
        var loadingimage = new Image();
        var that = this;
        var canvas = document.getElementById('bg');
        var context = canvas.getContext('2d');
        loadingimage.src = img_src;
        loadingimage.addEventListener('load', function () {
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
            context.drawImage(loadingimage, 0, 0, loadingimage.width, loadingimage.height, empty_w / 2, empty_h / 2, cw - empty_w, ch - empty_h);
            that = null;
            loadingimage = null;
        });
    };
    GUI.prototype.load_atlas = function (img_src, name, callback) {
        var loadingimage = new Image();
        var that = this;
        loadingimage.addEventListener('load', function () {
            var rect = { x: 0, y: 0, w: loadingimage.width, h: loadingimage.height };
            var atlas = new guiicon_1.GUI_atlas(loadingimage, '');
            callback(atlas);
            callback = null;
            atlas = null;
            that = null;
            rect = null;
        });
        loadingimage.src = img_src;
    };
    GUI.prototype.get_quad = function (key) {
        return this._quads[key];
    };
    GUI.prototype.set_bg_image_obj = function (image) {
        this._bg_image = image;
    };
    GUI.prototype.set_bg_image = function (img_src, sizing) {
        if (sizing === void 0) { sizing = guitypes_2.BackgroundImage.BACKGROUND_IMAGE_STRETCH; }
        var loadingimage = new Image();
        var that = this;
        this._bg_sizing = sizing;
        loadingimage.addEventListener('load', function () {
            that.set_bg_image_obj(loadingimage);
            var rect = { x: 0, y: 0, w: that._bg_image.width, h: that._bg_image.height };
            if (that._bg_sizing == guitypes_2.BackgroundImage.BACKGROUND_IMAGE_STRETCH) {
                var x_div = rect.w / that._quad_division;
                var y_div = rect.h / that._quad_division;
                for (var gy = 0; gy < that._quad_division; ++gy) {
                    for (var gx = 0; gx < that._quad_division; ++gx) {
                        var r = { x: x_div * gx, y: y_div * gy, w: x_div, h: y_div };
                        that._quads[gx + ':' + gy].set_bg_image(loadingimage, r);
                    }
                }
            }
            that = null;
            loadingimage = null;
        });
        loadingimage.src = img_src;
    };
    GUI.prototype.on = function (event_str, callback) {
        this._events[event_str].push(callback);
    };
    GUI.prototype.canvas = function () {
        return this._canvas_elem;
    };
    GUI.prototype.generate_quads = function (cols) {
        this._quad_division = cols;
        var x_mul = this._width / cols;
        var y_mul = this._height / cols;
        for (var i = 0; i < cols; ++i) {
            for (var j = 0; j < cols; ++j) {
                var id = j + ':' + i;
                this._quads[id] = new guiquad_1.GUI_quad(this._renderer, { x: j * x_mul, y: i * y_mul, w: x_mul, h: y_mul }, id);
                this._quads[id].set_bg_color('#000');
            }
        }
    };
    GUI.prototype.calc_quads_for_node = function (gui_node) {
        var quads = {};
        for (var k in this._quads) {
            var res = this._quads[k].calc_node_inside(gui_node);
            if (res == guitypes_5.NodeOverlaps.NODE_FULLY_INSIDE) {
                quads[k] = this._quads[k];
                return quads;
            }
            else if (res == guitypes_5.NodeOverlaps.NODE_PARTIALLY_INSIDE) {
                quads[k] = this._quads[k];
            }
        }
        return quads;
    };
    GUI.prototype.create_stored_box = function (id, x, y, width, height, caption, background_color, border, border_color) {
        if (caption === void 0) { caption = ''; }
        if (background_color === void 0) { background_color = '#000'; }
        if (border === void 0) { border = 1; }
        if (border_color === void 0) { border_color = '#fff'; }
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].id() == id) {
                return this._nodes[i];
            }
        }
        var g = new guinode_1.GUI_node(this._renderer, id, this._anchor_point, 'square');
        _global_gui_id = id + 1;
        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_background_color(background_color);
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
        var q = this.calc_quads_for_node(g);
        for (var k in q) {
            q[k].add_node(g);
        }
        g.set_quad_ids(Object.keys(q));
        return g;
    };
    GUI.prototype.create_box = function (x, y, width, height, caption, background_color, border, border_color) {
        if (caption === void 0) { caption = ''; }
        if (background_color === void 0) { background_color = '#000'; }
        if (border === void 0) { border = 1; }
        if (border_color === void 0) { border_color = '#fff'; }
        var g = new guinode_1.GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'square');
        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_background_color(background_color);
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
        return g;
    };
    GUI.prototype.get_current_id = function () {
        return _global_gui_id;
    };
    GUI.prototype.create_stored_polygon = function (id, x, y, points, caption, background_color, border, border_color) {
        if (caption === void 0) { caption = ''; }
        if (background_color === void 0) { background_color = '#000'; }
        if (border === void 0) { border = 1; }
        if (border_color === void 0) { border_color = '#000000'; }
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].id() == id) {
                return this._nodes[i];
            }
        }
        _global_gui_id = id + 1;
        var g = new guinode_1.GUI_node(this._renderer, id, this._anchor_point, 'polygon');
        var min_x = guimath_1.FDGMath.min_arr(points, 'x');
        var max_x = guimath_1.FDGMath.max_arr(points, 'x');
        var min_y = guimath_1.FDGMath.min_arr(points, 'y');
        var max_y = guimath_1.FDGMath.max_arr(points, 'y');
        var width = max_x - min_x;
        var height = max_y - min_y;
        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_points(points);
        g.set_prev_point_state(g.abs_points());
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
    };
    GUI.prototype.create_polygon = function (x, y, points, caption, background_color, border, border_color) {
        if (caption === void 0) { caption = ''; }
        if (background_color === void 0) { background_color = '#000'; }
        if (border === void 0) { border = 1; }
        if (border_color === void 0) { border_color = '#fff'; }
        var g = new guinode_1.GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'polygon');
        var min_x = guimath_1.FDGMath.min_arr(points, 'x');
        var max_x = guimath_1.FDGMath.max_arr(points, 'x');
        var min_y = guimath_1.FDGMath.min_arr(points, 'y');
        var max_y = guimath_1.FDGMath.max_arr(points, 'y');
        var width = max_x - min_x;
        var height = max_y - min_y;
        console.log('p width: ' + width + ' p height: ' + height);
        g.set_pos(x, y);
        g.set_width(width);
        g.set_height(height);
        g.set_points(points);
        g.set_prev_point_state(g.abs_points());
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
    };
    GUI.prototype.create_circle = function (x, y, radius, caption, background_color, border, border_color) {
        if (caption === void 0) { caption = ''; }
        if (background_color === void 0) { background_color = '#aaaaaa'; }
        if (border === void 0) { border = 0.5; }
        if (border_color === void 0) { border_color = '#000'; }
        var g = new guinode_1.GUI_node(this._renderer, _global_gui_id++, this._anchor_point, 'circle');
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
    };
    GUI.prototype.get_quad_with_id = function (id) {
        if (id in this._quads) {
            return this._quads[id];
        }
        return null;
    };
    GUI.prototype.get_node_with_id = function (id) {
        for (var k in this._quads) {
            var n = this._quads[k].get_node_with_id(id);
            if (n != null) {
                return n;
            }
        }
        return null;
    };
    GUI.prototype.update_node_quads = function (gui_node) {
        var calced_qs = this.calc_quads_for_node(gui_node);
        for (var cck in calced_qs) {
            calced_qs[cck].add_node(gui_node);
        }
        gui_node.set_quad_ids(Object.keys(calced_qs));
    };
    GUI.prototype.set_zoom = function (center_x, center_y, factor) {
        this._zoom_factor = factor;
        this._center = { x: center_x, y: center_y };
        console.log('zoomed, pos: ' + center_x + ', ' + center_y + ' factor: ' + this._zoom_factor);
        for (var k in this._quads) {
            this._quads[k].clear_nodes();
        }
        for (var nk = 0; nk < this._nodes.length; ++nk) {
            var node = this._nodes[nk];
            if (node == null) {
                console.log('null node, how?');
                continue;
            }
            try {
                if (node.shape() == 'polygon') {
                    var points = node.points();
                    var ppoints = node.prev_point_state();
                    for (var i = 0; i < points.length; ++i) {
                        points[i].x = Math.round((ppoints[i].x * factor));
                        points[i].y = Math.round((ppoints[i].y * factor));
                    }
                    node.set_points(points);
                }
                else {
                    var pos = node.pos();
                    var help = node.prev_state();
                    node.set_width(Math.round(help.w * factor));
                    node.set_height(Math.round(help.h * factor));
                    node.set_pos(Math.round((help.x * factor) - center_x), Math.round((help.y * factor) - center_y));
                }
                this.update_node_quads(node);
            }
            catch (ex) {
                console.log('exception: ' + node.id() + ':' + ex);
            }
        }
        for (var k in this._quads) {
            this._quads[k].set_changed(true);
        }
        this._prev_center = this._center;
        this._force_draw = true;
    };
    GUI.prototype.set_center = function (x, y) {
        this._center = { x: x, y: y };
        var delta_x = this._center.x - this._prev_center.x;
        var delta_y = this._center.y - this._prev_center.y;
        for (var nk = 0; nk < this._nodes.length; ++nk) {
            var node = this._nodes[nk];
            var pos = node.pos();
            node.set_pos(Math.round(pos.x + delta_x), Math.round(pos.y + delta_y), true);
        }
        this._prev_center = this._center;
        this._force_draw = true;
        return this._center;
    };
    GUI.prototype.is_mouse_inside = function () {
        return this._mouse_inside;
    };
    GUI.prototype.add_layer = function (layer) {
    };
    GUI.prototype.set_layer = function (layer) {
        this._layer = layer;
    };
    GUI.prototype.layer = function () { return this._layer; };
    GUI.prototype.locked = function () { return this._locked; };
    GUI.prototype.lock = function () {
        this._locked = true;
    };
    GUI.prototype.unlock = function () {
        this._locked = false;
    };
    GUI.prototype.add_icon = function (element_id, name) {
    };
    GUI.prototype.icon = function (name) { return this._renderer.icon(name); };
    GUI.prototype.nodes = function () {
        return this._nodes;
    };
    GUI.prototype.renderer = function () {
        return this._renderer;
    };
    GUI.prototype.connect = function (node1, node2) {
    };
    GUI.prototype.toggle_shadow = function (shadow) {
        this._renderer.toggle_shadow(shadow);
    };
    GUI.prototype.shadow = function () {
        return this._renderer.shadow();
    };
    GUI.prototype.size = function () {
        return [this._width, this._height];
    };
    GUI.prototype.width = function () {
        return this._width;
    };
    GUI.prototype.height = function () {
        return this._height;
    };
    GUI.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
        this._renderer.resize(this._width, this._height);
    };
    GUI.prototype.get_quad_at_pos = function (x, y) {
        var x_mul = Math.round(this._width / this._quad_division);
        var y_mul = Math.round(this._height / this._quad_division);
        var q_x = Math.floor(x / x_mul);
        var q_y = Math.floor(y / y_mul);
        return this._quads[q_x + ':' + q_y];
    };
    GUI.prototype.get_nodes_at_pos = function (x, y) {
        var q = this.get_quad_at_pos(x, y);
        if (q == null) {
            return null;
        }
        var nodes = q.get_nodes_at_pos(x, y);
        return nodes;
    };
    GUI.prototype.mark_changed_node = function (gui_node) {
        var ids = gui_node.quad_ids();
        for (var i = 0; i < ids.length; ++i) {
            this._quads[ids[i]].set_changed(true);
        }
    };
    GUI.prototype.remove_node = function (node) {
        console.log('removing from all');
        this._render_types.remove_node_from_all(node);
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i] == node) {
                this._nodes.splice(i, 1);
            }
        }
    };
    GUI.prototype.select_nodes_at_pos = function (x, y) {
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
                this._render_types.remove_node(node, guitypes_6.RenderType.RT_SQUARE);
                rt = this._render_types.add_square(node.shaded_color());
            }
            else if (node.shape() == 'polygon') {
                this._render_types.remove_node(node, guitypes_6.RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon(node.shaded_color());
            }
            rt.add_node(node);
        }
        this._selected_nodes = {};
        for (var k in nodes) {
            if (!nodes[k].highlightable()) {
                continue;
            }
            this._selected_nodes[k] = nodes[k];
            nodes[k].set_selected(true);
            var rt = null;
            if (nodes[k].shape() == 'square') {
                this._render_types.remove_node(nodes[k], guitypes_6.RenderType.RT_SQUARE);
                rt = this._render_types.add_square(nodes[k].shaded_color());
            }
            else if (nodes[k].shape() == 'polygon') {
                this._render_types.remove_node(nodes[k], guitypes_6.RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon(nodes[k].shaded_color());
            }
            rt.add_node(nodes[k]);
            nodes[k].set_mousepos(x, y);
        }
    };
    GUI.prototype.state_change_node = function (guinode) {
        var rt = null;
        if (guinode.shape() == 'square') {
            this._render_types.remove_node(guinode, guitypes_6.RenderType.RT_SQUARE);
            rt = this._render_types.add_square(guinode.shaded_color());
        }
        else if (guinode.shape() == 'polygon') {
            this._render_types.remove_node(guinode, guitypes_6.RenderType.RT_POLYGON);
            rt = this._render_types.add_polygon(guinode.shaded_color());
        }
        rt.add_node(guinode);
        guinode.pop_state();
    };
    GUI.prototype.wheel = function (delta) {
        if (!this._zoom_enabled) {
            return;
        }
        if (delta < 0) {
            this.set_zoom(0, 0, 1.0);
        }
        else if (delta > 0) {
            this.set_zoom(this.width(), this.height(), 4.0);
        }
    };
    GUI.prototype.mousedown = function (x, y, button) {
        if (!guimath_1.FDGMath.point_in_rect(x, y, this._rect)) {
            return;
        }
        if (this._select_box_enabled && button == guitypes_3.MouseButton.MOUSEBUTTON_LEFT) {
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
        var q = this.get_quad_at_pos(x, y);
        if (this.locked()) {
            return;
        }
        if (this._high_node != null) {
            this._high_node.set_highlighted(false);
            this.mark_changed_node(this._high_node);
        }
        var nodes = this.get_nodes_at_pos(x, y);
        if (Object.keys(nodes).length == 0) {
            console.error('no nodes');
            return;
        }
        this._dragging = true;
        this._drag_node = nodes[Object.keys(nodes)[0]];
        if (this._drag_node != null) {
            this._drag_node.set_selected(true);
            this.mark_changed_node(this._drag_node);
            var rt = null;
            if (this._drag_node.shape() == 'square') {
                this._render_types.remove_node(this._drag_node, guitypes_6.RenderType.RT_SQUARE);
                rt = this._render_types.add_square('#33ff33');
            }
            else if (this._drag_node.shape() == 'polygon') {
                this._render_types.remove_node(this._drag_node, guitypes_6.RenderType.RT_POLYGON);
                rt = this._render_types.add_polygon('#33ff33');
            }
            rt.add_node(this._drag_node);
            for (var i = 0; i < this._events['node_selected'].length; ++i) {
                this._events['node_selected'][i](x, y, button, this._drag_node);
            }
        }
        this._high_node = nodes[Object.keys(nodes)[0]];
        if (this._high_node != null) {
            this._high_node.set_highlighted(true);
            this.mark_changed_node(this._high_node);
            for (var i = 0; i < this._events['node_highlight'].length; ++i) {
                this._events['node_highlight'][i](x, y, button, this._high_node);
            }
        }
    };
    GUI.prototype.mouseup = function (x, y, button) {
        console.log('RELEASE: ' + button);
        if (button == guitypes_3.MouseButton.MOUSEBUTTON_LEFT) {
            console.log('CLOSING SELECT BOX');
            var brect = this._select_boxing.rect;
            this._select_boxing.running = false;
            close_selection_box();
        }
        if (this.locked()) {
            return;
        }
        for (var i = 0; i < this._events['mouseup'].length; ++i) {
            this._events['mouseup'][i](x, y, button, null);
        }
        for (var i = 0; i < this._nodes.length; ++i) {
            this.update_node_quads(this._nodes[i]);
        }
        this._dragging = false;
        this._drag_node = null;
    };
    GUI.prototype.mouseout = function (x, y) {
        console.log('mouseout');
        this._select_boxing.running = false;
        close_selection_box();
    };
    GUI.prototype.mousemove = function (x, y) {
        if (this._select_boxing.running) {
            var bx = this._select_boxing.rect.x + this._pos_rect.x;
            var by = this._select_boxing.rect.y + this._pos_rect.y;
            var width = (x + this._pos_rect.x) - bx;
            var height = (y + this._pos_rect.y) - by;
            this._select_boxing.rect.w = width;
            this._select_boxing.rect.h = height;
            selection_box(bx, by, width, height);
        }
        if (this.locked()) {
            return;
        }
        for (var i = 0; i < this._events['mousemove'].length; ++i) {
            this._events['mousemove'][i](x, y, -1, null);
        }
        if (!this._dragging) {
            this.select_nodes_at_pos(x, y);
            return;
        }
        if (this._drag_node != null && this._drag_node.draggable()) {
            this._drag_node.set_pos(x, y, true);
        }
    };
    GUI.prototype.get_shapes = function (type) {
        var arr = [];
        for (var i = 0; i < this._nodes.length; ++i) {
            if (this._nodes[i].shape() == type) {
                arr.push(this._nodes[i]);
            }
        }
        return arr;
    };
    GUI.prototype.draw = function (layer, swap) {
        if (layer === void 0) { layer = 'default'; }
        if (swap === void 0) { swap = true; }
        if (_draw_calls++ > 45) {
            console.log('draw call');
            for (var i = 0; i < this._nodes.length; ++i) {
                var node = this._nodes[i];
                var state = node.state();
                if (state == guitypes_4.State.STATE_NO_CHANGE) {
                    continue;
                }
                if (state == guitypes_4.State.STATE_CHANGE_TO_FRONT) {
                    this._render_types.push_to_front(node);
                    node.pop_state();
                }
                else if (state == guitypes_4.State.STATE_CHANGE_TO_BACK) {
                    this._render_types.push_back(node);
                    node.pop_state();
                }
                else if (state == guitypes_4.State.STATE_ICON_ADDED) {
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
        this._render_types.draw();
        this._renderer.swap_buffer(this._rect);
    };
    GUI.prototype.print = function () {
        this._render_types.print();
    };
    return GUI;
}());
exports.GUI = GUI;
;
