"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var guimath_1 = require("./guimath");
var guitypes_1 = require("./guitypes");
var guitypes_2 = require("./guitypes");
var GUI_quad = (function () {
    function GUI_quad(renderer, rect, id) {
        this._renderer = renderer;
        this._changed = true;
        this._rect = rect;
        this._img_rect = { x: 0, y: 0, w: 0, h: 0 };
        this._pp_rect = { x: this._rect.x - 0.5, y: this._rect.y - 0.5, w: this._rect.w + 0.5, h: this._rect.w + 0.5 };
        this._layers = {};
        this._bg_color = '#000000';
        this._id = id;
        this._bg_image = null;
    }
    GUI_quad.prototype.id = function () {
        return this._id;
    };
    GUI_quad.prototype.rect = function () {
        return this._rect;
    };
    GUI_quad.prototype.is_changed = function () {
        return this._changed;
    };
    GUI_quad.prototype.get_node_with_id = function (id, layer) {
        if (layer === void 0) { layer = 'default'; }
        if (!this._layers.hasOwnProperty(layer)) {
            return null;
        }
        if (id in this._layers[layer]) {
            return this._layers[layer][id];
        }
        return null;
    };
    GUI_quad.prototype.calc_node_inside = function (gui_node) {
        var bordered_rect = null;
        if (gui_node.shape() == 'polygon') {
            bordered_rect = gui_node.br();
        }
        else {
            bordered_rect = gui_node.ap_border_rect(guitypes_1.Anchor.ANCHOR_TOPLEFT);
        }
        if (guimath_1.FDGMath.a_rect_contains_b(this._pp_rect, bordered_rect)) {
            return guitypes_2.NodeOverlaps.NODE_FULLY_INSIDE;
        }
        if (guimath_1.FDGMath.a_rect_overlaps_b(this._pp_rect, bordered_rect)) {
            return guitypes_2.NodeOverlaps.NODE_PARTIALLY_INSIDE;
        }
        return guitypes_2.NodeOverlaps.NODE_NOT_INSIDE;
    };
    GUI_quad.prototype.clear_nodes = function (layer) {
        if (layer === void 0) { layer = 'default'; }
        if (!this._layers.hasOwnProperty(layer)) {
            this._layers[layer] = {};
        }
    };
    GUI_quad.prototype.add_node = function (gui_node, layer) {
        if (layer === void 0) { layer = 'default'; }
        if (!this._layers.hasOwnProperty(layer)) {
            this._layers[layer] = {};
        }
        this.set_changed(true);
        this._layers[layer][gui_node.id()] = gui_node;
    };
    GUI_quad.prototype.nodes = function (layer) {
        if (layer === void 0) { layer = 'default'; }
        return this._layers[layer];
    };
    GUI_quad.prototype.set_changed = function (changed) {
        this._changed = changed;
    };
    GUI_quad.prototype.set_bg_color = function (color) {
        this._bg_color = color;
    };
    GUI_quad.prototype.get_nodes_at_pos = function (x, y, layer) {
        if (layer === void 0) { layer = 'default'; }
        var nodes = {};
        for (var k in this._layers[layer]) {
            var n = this._layers[layer][k].hit_test(x, y);
            if (n != null) {
                nodes[k] = n;
            }
        }
        return nodes;
    };
    GUI_quad.prototype.set_bg_image = function (image, rect) {
        this._bg_image = image;
        this._img_rect = rect;
    };
    GUI_quad.prototype.draw = function (layer, swap, force_draw) {
        if (layer === void 0) { layer = 'default'; }
        if (swap === void 0) { swap = true; }
        if (force_draw === void 0) { force_draw = false; }
        if (!force_draw && !this.is_changed()) {
            return force_draw;
        }
        this._renderer.pre_draw();
        this.set_changed(false);
        if (this._bg_image != null) {
        }
        else {
            this._renderer.draw_box(this._rect.x, this._rect.y, this._rect.w, this._rect.h, this._bg_color, this._bg_color, 0);
        }
        for (var k in this._layers[layer]) {
            this._layers[layer][k].draw(false);
        }
        this._renderer.post_draw();
        this._renderer.swap_buffer(this._rect);
        return force_draw;
    };
    GUI_quad.prototype.print = function () {
        console.log('GUI_quad: ' + this.id());
        console.log('        : pp rect: ' + JSON.stringify(this._pp_rect));
    };
    return GUI_quad;
}());
exports.GUI_quad = GUI_quad;
