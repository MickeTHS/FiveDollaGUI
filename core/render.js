"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Render_text = (function () {
    function Render_text(text, font, color, size, x, y) {
        this._text = text;
        this._font_color = color;
        this._font_size = size;
        this._font = font;
        this._x = x;
        this._y = y;
    }
    Render_text.prototype.x = function () { return this._x; };
    Render_text.prototype.y = function () { return this._y; };
    Render_text.prototype.text = function () { return this._text; };
    Render_text.prototype.color = function () { return this._font_color; };
    Render_text.prototype.size = function () { return this._font_size; };
    Render_text.prototype.font = function () { return this._font; };
    return Render_text;
}());
var Render_screen = (function () {
    function Render_screen(canvas_id, width, height) {
        this._mainscreen = document.getElementById(canvas_id);
        this._mainscreen_ctx = this._mainscreen.getContext("2d");
        this._offscreen = document.createElement("canvas");
        this._mainscreen.width = width;
        this._mainscreen.height = height;
        this._offscreen.width = this._mainscreen.width;
        this._offscreen.height = this._mainscreen.height;
        this._offscreen_ctx = this._offscreen.getContext("2d");
        this._default_font = 'Bitstream';
        console.log('context sizes: ' + this._mainscreen.width + ' ' + this._mainscreen.height);
        this._text_buffer = [];
        this._shadow = false;
        this._icons = [];
        this._counter = 0;
        this._track = { border_states: [], no_border_states: [] };
    }
    Render_screen.prototype.init_img_source = function (id) {
        var img = document.getElementById(id);
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        return canvas;
    };
    Render_screen.prototype.get_pixel_image = function (canvas, x, y) {
        return canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    };
    Render_screen.prototype.contrast = function (hexcolor) {
        return (parseInt(hexcolor.substr(1), 16) > 0xffffff / 2) ? '#000000' : '#ffffff';
    };
    Render_screen.prototype.calc_shade_color = function (color, percent) {
        var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    };
    Render_screen.prototype.add_icon = function (icon) {
        this._icons.push(icon);
    };
    Render_screen.prototype.icon = function (name) {
        for (var i = 0; i < this._icons.length; ++i) {
            if (this._icons[i].name() == name) {
                return this._icons[i];
            }
        }
        return null;
    };
    Render_screen.prototype.resize = function (width, height) {
        this._mainscreen.width = width;
        this._mainscreen.height = height;
        this._offscreen.width = width;
        this._offscreen.height = height;
        this._offscreen_ctx = this._offscreen.getContext("2d");
    };
    Render_screen.prototype.print = function () {
        console.log("Offscreen context : " + this._offscreen.width + ", " + this._offscreen.height);
    };
    Render_screen.prototype.toggle_shadow = function (shadow) {
        this._shadow = shadow;
    };
    Render_screen.prototype.shadow = function () {
        return this._shadow;
    };
    Render_screen.prototype.clear = function (rect) {
        this._mainscreen_ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        this._offscreen_ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    };
    Render_screen.prototype.pre_draw = function () {
        this._offscreen_ctx.translate(0.5, 0.5);
    };
    Render_screen.prototype.post_draw = function () {
        this._offscreen_ctx.translate(-0.5, -0.5);
    };
    Render_screen.prototype.swap_buffer = function (rect) {
        this._mainscreen_ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
        this._mainscreen_ctx.drawImage(this._offscreen, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);
        this._offscreen_ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    };
    Render_screen.prototype.set_font = function (size, name) {
        var ctx = this._offscreen_ctx;
        ctx.font = size + "px " + name;
    };
    Render_screen.prototype.draw_shadow = function (ctx) {
        if (!this._shadow) {
            return;
        }
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.shadowColor = '#000000';
    };
    Render_screen.prototype.draw_icon_assoc = function (color, gui_nodes) {
        var ctx = this._offscreen_ctx;
        for (var k in gui_nodes) {
            var tb = gui_nodes[k];
            var tr = tb.icon_rect();
            if (tr == null) {
                continue;
            }
            var ir = tb.icon().rect();
            ctx.drawImage(tb.icon().img(), ir.x, ir.y, ir.w, ir.h, tr.x, tr.y, tr.w, tr.h);
        }
    };
    Render_screen.prototype.draw_text_assoc = function (color, gui_nodes) {
        var ctx = this._offscreen_ctx;
        for (var k in gui_nodes) {
            var tb = gui_nodes[k];
            var tr = tb.text_rect();
            if (tr == null) {
                continue;
            }
            ctx.fillStyle = color;
            ctx.fillText(tb.caption(), tr.x, tr.y);
        }
    };
    Render_screen.prototype.draw_borders_assoc = function (color, thickness, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        var len = nodes.length;
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        for (var k in nodes) {
            r = nodes[k].topleft_rect();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x + r.w, r.y);
            ctx.lineTo(r.x + r.w, r.y + r.h);
            ctx.lineTo(r.x, r.y + r.h);
            ctx.lineTo(r.x, r.y);
        }
        ctx.stroke();
    };
    Render_screen.prototype.draw_no_border_box_assoc = function (color, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        ctx.fillStyle = color;
        for (var k in nodes) {
            r = nodes[k].topleft_rect();
            ctx.fillRect(r.x, r.y, r.w, r.h);
        }
    };
    Render_screen.prototype.draw_no_border_poly_assoc = function (color, nodes) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.fillStyle = color;
        var len = 0;
        for (var k in nodes) {
            var points = nodes[k].abs_points();
            ctx.moveTo(points[0].x, points[0].y);
            len = points.length;
            for (var i = 1; i < len; ++i) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[0].x, points[0].y);
            ctx.fill();
        }
    };
    Render_screen.prototype.draw_borders_poly_assoc = function (color, thickness, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        var len = 0;
        for (var k in nodes) {
            var points = nodes[k].abs_points();
            ctx.moveTo(points[0].x, points[0].y);
            len = points.length;
            for (var i = 1; i < len; ++i) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[0].x, points[0].y);
        }
        ctx.stroke();
    };
    Render_screen.prototype.draw_borders_array = function (color, thickness, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        var len = nodes.length;
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        for (var i = 0; i < len; ++i) {
            r = nodes[i].topleft_rect();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x + r.w, r.y);
            ctx.lineTo(r.x + r.w, r.y + r.h);
            ctx.lineTo(r.x, r.y + r.h);
            ctx.lineTo(r.x, r.y);
        }
        ctx.stroke();
    };
    Render_screen.prototype.draw_no_border_box_array = function (color, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        var len = nodes.length;
        ctx.fillStyle = color;
        for (var i = 0; i < len; ++i) {
            r = nodes[i].topleft_rect();
            ctx.fillRect(r.x, r.y, r.w, r.h);
        }
    };
    Render_screen.prototype.draw_box = function (left, top, w, h, bg_color, stroke_color, stroke_thickness) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.rect(left, top, w, h);
        ctx.fillStyle = bg_color;
        ctx.fill();
        ctx.lineWidth = stroke_thickness;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    };
    Render_screen.prototype.draw_image_blend_color = function (left, top, x, y, val, icon) {
        var ctx = this._offscreen_ctx;
        ctx.drawImage(icon.img(), left, top);
    };
    Render_screen.prototype.draw_icon = function (left, top, width, height, icon) {
        var ctx = this._offscreen_ctx;
        ctx.drawImage(icon.img(), left, top, width, height);
    };
    Render_screen.prototype.draw_image_ctx = function (image_canvas, img_rect, target_rect) {
        var ctx = this._offscreen_ctx;
        ctx.drawImage(image_canvas, img_rect.x, img_rect.y, img_rect.w, img_rect.h, target_rect.x, target_rect.y, target_rect.w, target_rect.h);
    };
    Render_screen.prototype.draw_text_buffer = function () {
        var ctx = this._offscreen_ctx;
        for (var i = 0; i < this._text_buffer.length; ++i) {
            var tb = this._text_buffer[i];
            ctx.font = tb.size() + "px " + tb.font();
            ctx.fillStyle = tb.color();
            ctx.fillText(tb.text(), tb.x(), tb.y());
        }
        this._text_buffer = [];
    };
    Render_screen.prototype.draw_text_color = function (x, y, font, size, color, str) {
        var txt = new Render_text(str, font, color, size, x, y);
        this._text_buffer.push(txt);
    };
    Render_screen.prototype.draw_text = function (x, y, size, str) {
        var txt = new Render_text(str, this._default_font, '#ffffff', size, x, y);
        this._text_buffer.push(txt);
    };
    Render_screen.prototype.draw_line = function (x0, y0, x1, y1, thickness, color) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    Render_screen.prototype.draw_circle = function (x, y, radius, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    };
    Render_screen.prototype.draw_circle_caption = function (x, y, radius, stroke_width, inner_color, stroke_color, text, font, font_size) {
        if (font_size === void 0) { font_size = 16; }
        var ctx = this._offscreen_ctx;
        this.draw_circle(x, y, radius, stroke_width, inner_color, stroke_color);
        ctx.font = font_size + "px " + font;
        var w = ctx.measureText(text).width / 2;
        this.draw_text_color(x - w, y, this._default_font, font_size, 'white', text);
    };
    Render_screen.prototype.calc_text_width = function (text) {
        var ctx = this._offscreen_ctx;
        return ctx.measureText(text).width;
    };
    Render_screen.prototype.draw_fill_points = function (points, stroke_width, inner_color, stroke_color) {
        if (points.length < 3) {
            return false;
        }
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; ++i) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[0].x, points[0].y);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
        return true;
    };
    Render_screen.prototype.draw_fill_path = function (p0, p1, p2, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    };
    Render_screen.prototype.draw_triangle = function (x, y, height, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        var h = height / 2;
        ctx.beginPath();
        ctx.moveTo(x - h, y + h);
        ctx.lineTo(x + h, y + h);
        ctx.lineTo(x, y - h);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    };
    return Render_screen;
}());
exports.Render_screen = Render_screen;
;
