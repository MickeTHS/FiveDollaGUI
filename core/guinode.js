"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GUI_line_2_node = (function () {
    function GUI_line_2_node(renderobj) {
        this._renderer = renderobj;
        this._nodes = [];
        this._num_nodes = 0;
        this._thickness = 0.5;
        this._line_color = '#222222';
        this._stroke_color = null;
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
exports.GUI_line_2_node = GUI_line_2_node;
;
var _drawcalls = 0;
var guimath_1 = require("./guimath");
var guitypes_1 = require("./guitypes");
var guitypes_2 = require("./guitypes");
var guitypes_3 = require("./guitypes");
var GUI_node = (function () {
    function GUI_node(renderobj, id, ap, shape) {
        this._radius = 8;
        this._id = id;
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
        this._on_click = null;
        this._mx = 0;
        this._my = 0;
        this._indicator_color = null;
        this._highlighted = false;
        this._highlightable = true;
        this._static_color = false;
        this._shaded_color = null;
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
    GUI_node.prototype.set_visible = function (visible) {
        this._visible = visible;
    };
    GUI_node.prototype.visible = function () {
        return this._visible;
    };
    GUI_node.prototype.anchor_point = function () { return this._anchor_point; };
    GUI_node.prototype.set_anchor_point = function (ap) {
        this._anchor_point = ap;
    };
    GUI_node.prototype.set_quad_ids = function (ids) {
        this._quad_ids = ids;
    };
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
    GUI_node.prototype.set_prev_point_state = function (points) {
        this._prev_points = JSON.parse(JSON.stringify(points));
    };
    GUI_node.prototype.prev_point_state = function () { return this._prev_points; };
    GUI_node.prototype.prev_state = function () { return this._prev_state; };
    GUI_node.prototype.recalculate = function () {
        if (this._shape == 'polygon') {
            this.create_abs_points();
        }
    };
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
        if (this._anchor_point == guitypes_1.Anchor.ANCHOR_CENTER) {
            this._center_rect = rect;
            this._topleft_rect = guimath_1.FDGMath.rect_center_to_topleft(this._center_rect);
        }
        else {
            this._topleft_rect = rect;
            this._center_rect = guimath_1.FDGMath.rect_topleft_to_center(this._topleft_rect);
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
        var r = null;
        if (ap == guitypes_1.Anchor.ANCHOR_CENTER) {
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
        console.log('        : ap_border_rect (center): ' + JSON.stringify(this.ap_border_rect(guitypes_1.Anchor.ANCHOR_CENTER)));
        console.log('        : topleft rect: ' + JSON.stringify(this._topleft_rect));
        console.log('        : ap_border_rect (top left): ' + JSON.stringify(this.ap_border_rect(guitypes_1.Anchor.ANCHOR_TOPLEFT)));
        console.log('        : contained in : ' + JSON.stringify(this._quad_ids));
        console.log('        : helper rect : ' + JSON.stringify(this._prev_state));
        if (this._shape == 'polygon') {
            console.log('        : BR : ' + JSON.stringify(this._br));
        }
    };
    GUI_node.prototype.font = function () { return this._font; };
    GUI_node.prototype.font_size = function () { return this._font_size; };
    GUI_node.prototype.icon_offset = function () { return { x: this._icon_x_offset, y: this._icon_y_offset }; };
    GUI_node.prototype.internal_get_rect = function () {
        return this._anchor_point == guitypes_1.Anchor.ANCHOR_CENTER ? this._center_rect : this._topleft_rect;
    };
    GUI_node.prototype.topleft_rect = function () { return this._topleft_rect; };
    GUI_node.prototype.center_rect = function () { return this._center_rect; };
    GUI_node.prototype.x = function () { return this.internal_get_rect().x; };
    GUI_node.prototype.y = function () { return this.internal_get_rect().y; };
    GUI_node.prototype.pos = function () { return { x: this.x(), y: this.y() }; };
    GUI_node.prototype.autohidden_caption = function () { return this._text_autohide; };
    GUI_node.prototype.selected = function () { return this._selected; };
    GUI_node.prototype.caption_color = function () { return this._caption_color; };
    GUI_node.prototype.caption = function () { return this._caption; };
    GUI_node.prototype.width = function () { return this.internal_get_rect().w; };
    GUI_node.prototype.height = function () { return this.internal_get_rect().h; };
    GUI_node.prototype.radius = function () { return this._radius; };
    GUI_node.prototype.icon = function () { return this._icon; };
    GUI_node.prototype.is_box = function () { return false; };
    GUI_node.prototype.has_hit_test = function () { return this._hit_test; };
    GUI_node.prototype.shape = function () { return this._shape; };
    GUI_node.prototype.draggable = function () { return this._draggable; };
    GUI_node.prototype.set_mousepos = function (x, y) { this._mx = x; this._my = y; };
    GUI_node.prototype.indicator_color = function () { return this._indicator_color; };
    GUI_node.prototype.set_font = function (font) {
        this._font = font;
    };
    GUI_node.prototype.on_click = function (func) {
        this._on_click = func;
    };
    GUI_node.prototype.fetch_gui_children = function (container) {
    };
    GUI_node.prototype.set_indicator_color = function (color) {
        this._indicator_color = color;
    };
    GUI_node.prototype.set_draggable = function (draggable) {
        this._draggable = draggable;
    };
    GUI_node.prototype.set_hit_test = function (test) {
        this._hit_test = test;
    };
    GUI_node.prototype.set_points = function (points) {
        this._points = points;
        this.create_abs_points();
    };
    GUI_node.prototype.points = function () { return this._points; };
    GUI_node.prototype.create_abs_points = function () {
        var r = this._center_rect;
        this._abs_points = [];
        for (var i = 0; i < this._points.length; ++i) {
            this._abs_points.push({ x: r.x + this._points[i].x, y: r.y + this._points[i].y });
        }
        this.set_br(guimath_1.FDGMath.calc_br(this._abs_points));
    };
    GUI_node.prototype.set_icon_offset = function (x, y) {
        this._icon_x_offset = x;
        this._icon_y_offset = y;
    };
    GUI_node.prototype.set_font_size = function (size) {
        this._font_size = size;
    };
    GUI_node.prototype.set_caption_color = function (color) {
        this._caption_color = color;
    };
    GUI_node.prototype.set_autohidden_caption = function (hidden) {
        this._text_autohide = hidden;
    };
    GUI_node.prototype.set_icon_scale = function (scale) {
        this._icon_scale = scale;
    };
    GUI_node.prototype.set_icon = function (icon, style) {
        this._icon_style = style;
        this._icon = icon;
        this.calc_icon_rect();
        this._state_changes.push(guitypes_2.State.STATE_ICON_ADDED);
    };
    GUI_node.prototype.icon_rect = function () {
        return this._icon_rect;
    };
    GUI_node.prototype.calc_icon_rect = function () {
        var r = this._topleft_rect;
        if (this._icon_style == guitypes_3.IconStyle.ICON_STYLE_NORMAL) {
            this._icon_rect = { x: r.x, y: r.y, w: this._icon.rect().w, h: this._icon.rect().h };
            return;
        }
        this._icon_rect = r;
    };
    GUI_node.prototype.set_icon_color = function (color) {
        this._icon_color = color;
    };
    GUI_node.prototype.set_background_color = function (color) {
        this._background_color = color;
        this._shaded_color = color;
    };
    GUI_node.prototype.background_color = function () {
        return this._background_color;
    };
    GUI_node.prototype.set_border_color = function (color) {
        this._border_color = color;
        this._state_changes.push(guitypes_2.State.STATE_COLOR_CHANGE);
    };
    GUI_node.prototype.set_border_thickness = function (thickness) {
        this._border_thickness = thickness;
    };
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
            return guitypes_2.State.STATE_NO_CHANGE;
        }
        return this._state_changes[0];
    };
    GUI_node.prototype.bring_to_back = function () {
        this._state_changes.push(guitypes_2.State.STATE_CHANGE_TO_BACK);
    };
    GUI_node.prototype.bring_to_front = function () {
        this._state_changes.push(guitypes_2.State.STATE_CHANGE_TO_FRONT);
    };
    GUI_node.prototype.pop_state = function () {
        this._state_changes.splice(0, 1);
    };
    GUI_node.prototype.clear_states = function () {
        this._state_changes = [];
    };
    GUI_node.prototype.set_radius = function (radius) {
        var r = this.internal_get_rect();
        r.w = radius * 2.0;
        r.h = radius * 2.0;
        this._radius = radius;
        this.set_rect(r);
    };
    GUI_node.prototype.set_height = function (height) {
        var r = this.internal_get_rect();
        r.h = height;
        this.set_rect(r);
    };
    GUI_node.prototype.set_width = function (width) {
        var r = this.internal_get_rect();
        r.w = width;
        this.set_rect(r);
    };
    GUI_node.prototype.set_caption = function (text) {
        this._caption = text;
    };
    GUI_node.prototype.calculate_width_from_caption = function (margin) {
        var r = this.internal_get_rect();
        r.w = this._renderer.calc_text_width(this._caption) + margin * 2;
        this.set_rect(r);
    };
    GUI_node.prototype.calc_nodes_pos = function () { };
    GUI_node.prototype.set_selected = function (selected) {
        this._selected = selected;
        this._shaded_color = this.shaded_color();
    };
    GUI_node.prototype.shaded_color = function () {
        if (this._selected) {
            return this._renderer.calc_shade_color(this._background_color, 0.5);
        }
        return this._background_color;
    };
    GUI_node.prototype.text_rect = function () {
        if (this._selected && this._text_autohide) {
            return { x: this._mx, y: this._my, w: 0, h: 0 };
        }
        else if (!this._text_autohide) {
            var r = this.internal_get_rect();
            var w = this._renderer.calc_text_width(this._caption);
            return { x: r.x - w / 2, y: r.y, w: 0, h: 0 };
        }
        return null;
    };
    GUI_node.prototype.set_highlightable = function (highlightable) {
        this._highlightable = highlightable;
    };
    GUI_node.prototype.highlightable = function () {
        return this._highlightable;
    };
    GUI_node.prototype.set_highlighted = function (highlighted) {
        if (!this._highlightable) {
            return;
        }
        this._highlighted = highlighted;
    };
    GUI_node.prototype.highlighted = function () {
        return this._highlighted;
    };
    GUI_node.prototype.draw = function (empty) { };
    GUI_node.prototype.hit_test = function (x, y) {
        if (!this._hit_test) {
            return null;
        }
        var calc_rect = null;
        var test = false;
        if (this._shape == 'circle') {
            calc_rect = this._center_rect;
            test = (x - calc_rect.x) * (x - calc_rect.x) + (y - calc_rect.y) * (y - calc_rect.y) < this._radius * this._radius;
        }
        else if (this._shape == 'polygon') {
            test = guimath_1.FDGMath.p_poly(this._abs_points, x, y);
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
            test = guimath_1.FDGMath.point_in_triangle(x, y, calc_rect.x - calc_rect.w / 2, calc_rect.y + calc_rect.h / 2, calc_rect.x + calc_rect.w / 2, calc_rect.y + calc_rect.h / 2, calc_rect.x, calc_rect.y - calc_rect.h / 2);
        }
        if (test) {
            return this;
        }
        return null;
    };
    return GUI_node;
}());
exports.GUI_node = GUI_node;
;
