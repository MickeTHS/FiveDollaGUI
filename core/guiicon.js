"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GUI_atlas = (function () {
    function GUI_atlas(image, name) {
        this._image = image;
        this._name = name;
        this._icons = {};
    }
    GUI_atlas.prototype.atlas_to_color = function (color, name) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(this._image, 0, 0);
        var target_canvas = document.createElement('canvas');
        var target_ctx = target_canvas.getContext('2d');
        var id = target_ctx.createImageData(1, 1);
        target_ctx.beginPath();
        target_ctx.rect(0, 0, this._image.width, this._image.height);
        target_ctx.fillStyle = "black";
        target_ctx.fill();
        target_ctx.fillStyle = color;
        for (var y = 0; y < this._image.height; ++y) {
            for (var x = 0; x < this._image.width; ++x) {
                var px = context.getImageData(x, y, 1, 1).data;
                if (px[0] > 200) {
                    target_ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        var atlas = new GUI_atlas(target_canvas, name);
        return atlas;
    };
    GUI_atlas.prototype.define_icon = function (name, rect) {
        this._icons[name] = { rect: rect, image: this._image };
    };
    GUI_atlas.prototype.get = function (name) {
        return this._icons[name];
    };
    return GUI_atlas;
}());
exports.GUI_atlas = GUI_atlas;
;
var GUI_icon = (function () {
    function GUI_icon(elem_id, name) {
    }
    GUI_icon.prototype.id = function () { return this._elem_id; };
    GUI_icon.prototype.name = function () { return this._name; };
    GUI_icon.prototype.img = function () { return this._img; };
    GUI_icon.prototype.rect = function () { return this._rect; };
    return GUI_icon;
}());
exports.GUI_icon = GUI_icon;
;
