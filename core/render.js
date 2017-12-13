/**
 * FiveDollaGUI

Copyright 2017 Michael "Larry" Nilsson

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 */
var Render_text = /** @class */ (function () {
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
/*
    This class renders to an offscreen buffer
    to show everything you have drawn to the buffer, do swap_buffer()

    example:

    var rs = new Render_screen('nodescanvas');
    rs.draw_box(0,0,10,10,'#000000','#aaaaaa');
    rs.swap_buffer();
*/
var Render_screen = /** @class */ (function () {
    /* give the canvas id you want to draw to */
    function Render_screen(canvas_id, width, height) {
        this._mainscreen = document.getElementById(canvas_id);
        this._mainscreen_ctx = this._mainscreen.getContext("2d");
        this._offscreen = document.createElement("canvas");
        this._mainscreen.width = width;
        this._mainscreen.height = height;
        this._offscreen.width = this._mainscreen.width;
        this._offscreen.height = this._mainscreen.height;
        this._offscreen_ctx = this._offscreen.getContext("2d");
        console.log('context sizes: ' + this._mainscreen.width + ' ' + this._mainscreen.height);
        this._text_buffer = [];
        this._shadow = false;
        this._icons = [];
        this._counter = 0;
        this._track = {};
        this._track.border_states = [];
        this._track.no_border_states = [];
    }
    /**
     * inits an offscreen canvas of an image so you may read pixel data from it
     */
    Render_screen.prototype.init_img_source = function (id) {
        var img = document.getElementById(id);
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        return canvas;
    };
    /**
     * reads pixel data from the canvas
     */
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
        return 0;
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
        /*var tmp = [];
        var count = 0;
        for (var i = 0; i < this._track.border_states.length; ++i) {
            var found = false;
            for (var t = 0; t < tmp.length; ++t) {
                if (tmp[t].thickness == this._track.border_states[i].thickness && tmp[t].color == this._track.border_states[i].color) {
                    count++;
                    found = true;
                }
            }

            if (!found) {
                tmp.push(this._track.border_states[i]);
            }
        }

        tmp = [];
        var count2 = 0;
        for (var i = 0; i < this._track.no_border_states.length; ++i) {
            var found = false;
            for (var t = 0; t < tmp.length; ++t) {
                if (tmp[t] == this._track.no_border_states[i]) {
                    count2++;
                    found = true;
                }
            }

            if (!found) {
                tmp.push(this._track.no_border_states[i]);
            }
        }

        console.log('TRACKED DUPLICATE STATES: border ' + count + ' no border: ' + count2);

        this._track.border_states = [];
        this._track.no_border_states = [];*/
        //this.draw_text_buffer();
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
    /**
     * draw an array of icons
     *
     * @param {String} color hex color to replace white with
     * @param {Map<GUI_node>} gui_nodes nodes to get icons from
     */
    Render_screen.prototype.draw_icon_assoc = function (color, gui_nodes) {
        var ctx = this._offscreen_ctx;
        for (var k in gui_nodes) {
            var tb = gui_nodes[k];
            var tr = tb.icon_rect();
            if (tr == null) {
                continue;
            }
            var ir = tb.icon().rect;
            ctx.drawImage(tb.icon().image, ir.x, ir.y, ir.w, ir.h, tr.x, tr.y, tr.w, tr.h);
        }
    };
    /**
     * draw an array of texts
     *
     * @param {String} color hex color
     * @param {Map<GUI_node>} gui_nodes nodes to get texts from
     */
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
            //ctx.fillStyle = '#ffffff';
            //ctx.fillText('teeest', 300, 300);
        }
    };
    /**
     * More efficient way of drawing a lot of bordered boxes, we do this as step 2
     *
     * @param {String} color hex color
     * @param {number} thickness the border thickness
     * @param {GUI_node} nodes the list of nodes to draw
     */
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
    /**
     * More efficient way of drawing a lot of boxes, if you want borders on your boxes, you must supply the nodes array
     * to draw_borders_arr immediately after this call
     *
     *
     * @param {String} color hex color
     * @param {GUI_node} nodes the list of nodes to draw
     */
    Render_screen.prototype.draw_no_border_box_assoc = function (color, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        ctx.fillStyle = color;
        for (var k in nodes) {
            r = nodes[k].topleft_rect();
            ctx.fillRect(r.x, r.y, r.w, r.h);
        }
    };
    /**
     * More efficient way of drawing a lot of polygons, if you want borders on your boxes, you must supply the nodes array
     * to draw_borders_arr immediately after this call
     *
     *
     * @param {String} color hex color
     * @param {GUI_node} nodes the list of nodes to draw
     */
    Render_screen.prototype.draw_no_border_poly_assoc = function (color, nodes) {
        var ctx = this._offscreen_ctx;
        ctx.beginPath();
        //this._track.no_border_states.push(color);
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
    /**
     * More efficient way of drawing a lot of polygons, if you want borders on your boxes, you must supply the nodes array
     * to draw_borders_arr immediately after this call
     *
     *
     * @param {String} color hex color
     * @param {GUI_node} nodes the list of nodes to draw
     */
    Render_screen.prototype.draw_borders_poly_assoc = function (color, thickness, nodes) {
        var ctx = this._offscreen_ctx;
        var r = null;
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        //this._track.border_states.push({ color, thickness } );
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
    /**
     * More efficient way of drawing a lot of bordered boxes, we do this as step 2
     *
     * @param {String} color hex color
     * @param {number} thickness the border thickness
     * @param {GUI_node} nodes the list of nodes to draw
     */
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
    /**
     * More efficient way of drawing a lot of boxes, if you want borders on your boxes, you must supply the nodes array
     * to draw_borders_arr immediately after this call
     *
     *
     * @param {String} color hex color
     * @param {GUI_node} nodes the list of nodes to draw
     */
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
        //		ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.rect(left, top, w, h);
        ctx.fillStyle = bg_color;
        ctx.fill();
        ctx.lineWidth = stroke_thickness;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
        //		ctx.translate(-0.5, -0.5);
    };
    /**
     * This function is too slow
     *
     * @deprecated
     */
    Render_screen.prototype.draw_image_blend_color = function (left, top, x, y, val, icon) {
        var ctx = this._offscreen_ctx;
        /*this.offscreenContext.beginPath();
        this.offscreenContext.rect(left + x*<?php echo $BOX_PIXEL_WIDTH;?>, top + y*<?php echo $BOX_PIXEL_WIDTH;?>, <?php echo $BOX_PIXEL_WIDTH;?>, <?php echo $BOX_PIXEL_WIDTH;?>);
        this.offscreenContext.fillStyle = '#'+val+val+val;
        this.offscreenContext.fill();
        this.offscreenContext.lineWidth = 1;
        this.offscreenContext.strokeStyle = 'steelblue';
        this.offscreenContext.stroke();
        
        this.offscreenContext.globalCompositeOperation = "multiply";*/
        ctx.drawImage(icon, left, top);
    };
    /**
     * Draws an icon at given position
     *
     * @param {int} left
     * @param {int} top
     * @param {int} width
     * @param {int} height
     */
    Render_screen.prototype.draw_icon = function (left, top, width, height, icon) {
        var ctx = this._offscreen_ctx;
        ctx.drawImage(icon.img(), left, top, width, height);
    };
    /**
     * draws an image to a context
     *
     * @param {Object} image_canvas image canvas element
     * @param {JSON} img_rect x, y, w, h
     * @param {JSON} target_rect x, y, w, h
     */
    Render_screen.prototype.draw_image_ctx = function (image_canvas, img_rect, target_rect) {
        var ctx = this._offscreen_ctx;
        ctx.drawImage(image_canvas, img_rect.x, img_rect.y, img_rect.w, img_rect.h, target_rect.x, target_rect.y, target_rect.w, target_rect.h);
    };
    /**
     * Used internally to draw the text above the rest
     */
    Render_screen.prototype.draw_text_buffer = function () {
        var ctx = this._offscreen_ctx;
        //		ctx.translate(0.5, 0.5);
        for (var i = 0; i < this._text_buffer.length; ++i) {
            var tb = this._text_buffer[i];
            ctx.font = tb.size() + "px " + tb.font();
            ctx.fillStyle = tb.color();
            ctx.fillText(tb.text(), tb.x(), tb.y());
        }
        //		ctx.translate(-0.5, -0.5);
        this._text_buffer = [];
    };
    /**
     * Adds rendered text to the text draw buffer
     *
     * @param {int} x
     * @param {int} y
     * @param {String} font name of font
     * @param {int} size font size
     * @param {String} color RGB hexcolor
     * @param {String} str the text string to draw
     */
    Render_screen.prototype.draw_text_color = function (x, y, font, size, color, str) {
        var txt = new Render_text(str, font, color, size, x, y);
        this._text_buffer.push(txt);
    };
    /**
     * Adds rendered text to the text draw buffer as white text
     *
     * @param {int} x
     * @param {int} y
     * @param {int} size
     * @param {String} str
     */
    Render_screen.prototype.draw_text = function (x, y, size, str) {
        var txt = new Render_text(str, '#ffffff', size, x, y);
        this._text_buffer.push(txt);
    };
    /**
     * Draws a line from one point to another
     *
     * @param {int} x0
     * @param {int} y0
     * @param {int} x1
     * @param {int} y1
     * @param {int} thickness in pixels
     * @param {String} color RGB hexcolor
     */
    Render_screen.prototype.draw_line = function (x0, y0, x1, y1, thickness, color) {
        var ctx = this._offscreen_ctx;
        //		ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
        //        ctx.translate(-0.5, -0.5);
    };
    /**
     * Draws a circle from the middle x,y position with a radius
     *
     * @param {int} x middle x
     * @param {int} y middle y
     * @param {float} radius
     * @param {int} stroke_width
     * @param {String} inner_color RGB hexcolor
     * @param {String} stroke_color RGB hexcolor
     */
    Render_screen.prototype.draw_circle = function (x, y, radius, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        //		ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
        //		ctx.translate(-0.5, -0.5);
    };
    /**
     * Draws a circle with an inner caption
     *
     * @deprecated
     *
     * @param {number} x middle x
     * @param {number} y middle y
     * @param {number} radius
     * @param {number} stroke_width
     * @param {String} inner_color RGB hexcolor
     * @param {String} stroke_color RGB hexcolor
     * @param {String} text
     * @param {number} font_size
     */
    Render_screen.prototype.draw_circle_caption = function (x, y, radius, stroke_width, inner_color, stroke_color, text, font, font_size) {
        if (font_size === void 0) { font_size = 16; }
        var ctx = this._offscreen_ctx;
        this.draw_circle(x, y, radius, stroke_width, inner_color, stroke_color);
        ctx.font = font_size + "px " + font;
        var w = ctx.measureText(text).width / 2;
        this.draw_text_color(x - w, y, font_size, 'white', text);
    };
    /**
     * Measures the text width on the canvas
     *
     * @param {String} text the string to "draw"
     */
    Render_screen.prototype.calc_text_width = function (text) {
        var ctx = this._offscreen_ctx;
        //ctx.font = font;
        return ctx.measureText(text).width;
    };
    /**
     * draws a polygon
     *
     * @param {Array<JSON>} points [{x:x, y:y}, ...]
     * @param {number} stroke_width
     * @param {String} inner_color RGB hexcolor
     * @param {String} stroke_color RGB hexcolor
     * @param {String} text
     * @param {number} font_size
     *
     */
    Render_screen.prototype.draw_fill_points = function (points, stroke_width, inner_color, stroke_color) {
        if (points.length < 3) {
            return false;
        }
        var ctx = this._offscreen_ctx;
        //		ctx.translate(0.5, 0.5);
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
        //		ctx.translate(-0.5, -0.5);
    };
    /**
     * draws a fill path of 3 points
     *
     * @param {JSON} p0 first point
     * @param {JSON} p1 second point
     * @param {JSON} p2 third point
     * @param {number} stroke_width
     * @param {String} inner_color RGB hexcolor
     * @param {String} stroke_color RGB hexcolor
     *
     */
    Render_screen.prototype.draw_fill_path = function (p0, p1, p2, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        //		ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.fillStyle = inner_color;
        ctx.fill();
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
        //		ctx.translate(-0.5, -0.5);
    };
    Render_screen.prototype.draw_triangle = function (x, y, height, stroke_width, inner_color, stroke_color) {
        var ctx = this._offscreen_ctx;
        //        ctx.translate(0.5, 0.5);
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
        //        ctx.translate(-0.5, -0.5);
    };
    return Render_screen;
}());
;
