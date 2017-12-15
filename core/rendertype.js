"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _rt_ids = 0;
var guitypes_1 = require("./guitypes");
var Render_type = (function () {
    function Render_type(id, type, color, border_thickness, border_color) {
        if (border_thickness === void 0) { border_thickness = 0; }
        if (border_color === void 0) { border_color = '#000'; }
        this._id = id;
        this._type = type;
        this._color = color;
        this._border_thickness = border_thickness;
        this._border_color = border_color;
        this._nodes = {};
    }
    Render_type.prototype.id = function () { return this._id; };
    Render_type.prototype.type = function () { return this._type; };
    Render_type.prototype.color = function () { return this._color; };
    Render_type.prototype.border_thickness = function () { return this._border_thickness; };
    Render_type.prototype.border_color = function () { return this._border_color; };
    Render_type.prototype.pop_node = function (gui_node) {
        if (!(gui_node.id() in this._nodes)) {
            return null;
        }
        var node = this._nodes[gui_node.id()];
        delete this._nodes[gui_node.id()];
        return node;
    };
    Render_type.prototype.add_node = function (gui_node) {
        this._nodes[gui_node.id()] = gui_node;
    };
    Render_type.prototype.remove_node = function (gui_node) {
        if (gui_node.id() in this._nodes) {
            delete this._nodes[gui_node.id()];
        }
        else {
        }
    };
    Render_type.prototype.draw = function (renderer) {
        if (this._type == guitypes_1.RenderType.RT_SQUARE) {
            renderer.draw_no_border_box_assoc(this._color, this._nodes);
        }
        else if (this._type == guitypes_1.RenderType.RT_BORDER_SQUARE) {
            renderer.draw_borders_assoc(this._border_color, this._border_thickness, this._nodes);
        }
        else if (this._type == guitypes_1.RenderType.RT_POLYGON) {
            renderer.draw_no_border_poly_assoc(this._color, this._nodes);
        }
        else if (this._type == guitypes_1.RenderType.RT_BORDER_POLY) {
            renderer.draw_borders_poly_assoc(this._border_color, this._border_thickness, this._nodes);
        }
        else if (this._type == guitypes_1.RenderType.RT_TEXT) {
            renderer.draw_text_assoc(this._color, this._nodes);
        }
        else if (this._type == guitypes_1.RenderType.RT_ICON) {
            renderer.draw_icon_assoc(this._color, this._nodes);
        }
    };
    Render_type.prototype.print = function () {
        var info = [];
        for (var k in this._nodes) {
            var n = this._nodes[k];
            info.push({ id: n.id(), t: n.shape() });
        }
        console.log(JSON.stringify(info));
    };
    return Render_type;
}());
exports.Render_type = Render_type;
var Render_type_handler = (function () {
    function Render_type_handler(renderer) {
        this._render_types = [];
        for (var i = 0; i < 6; ++i) {
            this._render_types[i] = {};
        }
        this._renderer = renderer;
    }
    Render_type_handler.prototype.add_icon = function () {
        for (var k in this._render_types[5]) {
            var rt = this._render_types[5][k];
            if (rt.type() == guitypes_1.RenderType.RT_ICON) {
                return rt;
            }
        }
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_ICON, null, null, null);
        this._render_types[5][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.add_square = function (background_color, z) {
        if (z === void 0) { z = 0; }
        for (var k in this._render_types[z + 0]) {
            var rt = this._render_types[z + 0][k];
            if (rt.type() == guitypes_1.RenderType.RT_SQUARE && rt.color() == background_color) {
                return rt;
            }
        }
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_SQUARE, background_color, null, null);
        this._render_types[z + 0][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.add_polygon = function (background_color, z) {
        if (z === void 0) { z = 0; }
        for (var k in this._render_types[z + 0]) {
            var rt = this._render_types[z + 0][k];
            if (rt.type() == guitypes_1.RenderType.RT_POLYGON && rt.color() == background_color) {
                return rt;
            }
        }
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_POLYGON, background_color, null, null);
        this._render_types[z + 0][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.add_border = function (border_thickness, border_color) {
        for (var k in this._render_types[1]) {
            var rt = this._render_types[1][k];
            if (rt.type() == guitypes_1.RenderType.RT_BORDER_SQUARE && rt.border_thickness() == border_thickness && rt.border_color() == border_color) {
                return rt;
            }
        }
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_BORDER_SQUARE, null, border_thickness, border_color);
        this._render_types[1][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.add_text = function (color) {
        for (var k in this._render_types[4]) {
            var rt = this._render_types[4][k];
            if (rt.type() == guitypes_1.RenderType.RT_TEXT && rt.color() == color) {
                return rt;
            }
        }
        console.log('added text');
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_TEXT, color);
        this._render_types[4][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.add_border_poly = function (border_thickness, border_color) {
        for (var k in this._render_types[1]) {
            var rt = this._render_types[1][k];
            if (rt.type() == guitypes_1.RenderType.RT_BORDER_POLY && rt.border_thickness() == border_thickness && rt.border_color() == border_color) {
                return rt;
            }
        }
        var rt = new Render_type(_rt_ids++, guitypes_1.RenderType.RT_BORDER_POLY, null, border_thickness, border_color);
        this._render_types[1][rt.id()] = rt;
        return rt;
    };
    Render_type_handler.prototype.remove_node = function (node, type) {
        var layers = [];
        if (type == guitypes_1.RenderType.RT_BORDER_POLY || type == guitypes_1.RenderType.RT_BORDER_SQUARE) {
            layers.push(1, 3);
            console.log('removing border');
        }
        else if (type == guitypes_1.RenderType.RT_SQUARE || type == guitypes_1.RenderType.RT_POLYGON) {
            layers.push(0, 2);
        }
        else if (type == guitypes_1.RenderType.RT_TEXT) {
            layers.push(4);
        }
        for (var l = 0; l < layers.length; ++l) {
            for (var k in this._render_types[layers[l]]) {
                this._render_types[layers[l]][k].remove_node(node);
            }
        }
    };
    Render_type_handler.prototype.push_back = function (gui_node) {
        for (var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
                var n = this._render_types[i][k].pop_node(n);
                if (n != null) {
                    if (i == 0 || i == 1) {
                        console.error('Node is already the furthest back possible');
                    }
                    else {
                        this._render_types[i - 2][k].add_node(n);
                    }
                }
            }
        }
    };
    Render_type_handler.prototype.push_to_front = function (gui_node) {
        this.remove_node_from_all(gui_node);
        if (gui_node.shape() == 'square') {
            var rt = this.add_square(gui_node.background_color());
            rt.add_node(gui_node);
        }
        else if (gui_node.shape() == 'polygon') {
            var rt = this.add_polygon(gui_node.background_color());
            rt.add_node(gui_node);
        }
    };
    Render_type_handler.prototype.remove_node_from_all = function (node) {
        for (var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
                this._render_types[i][k].remove_node(node);
            }
        }
    };
    Render_type_handler.prototype.get = function (id) {
        if (id in this._render_types) {
            return this._render_types[id];
        }
        return null;
    };
    Render_type_handler.prototype.draw = function () {
        for (var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
                this._render_types[i][k].draw(this._renderer);
            }
        }
    };
    Render_type_handler.prototype.print = function () {
        for (var i = 0; i < this._render_types.length; ++i) {
            var rt = this._render_types[i];
            for (var k in rt) {
                console.log('RenderType index ' + i + ' with rt key k: ' + k);
                rt[k].print();
            }
        }
    };
    return Render_type_handler;
}());
exports.Render_type_handler = Render_type_handler;
