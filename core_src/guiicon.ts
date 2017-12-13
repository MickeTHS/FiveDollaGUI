	
import { Rect } from './guimath';
import { Point } from './guimath';
import { FDGMath } from './guimath';
import { Anchor } from './guitypes';
import { BackgroundImage } from './guitypes';
import { MouseButton } from './guitypes';
import { State } from './guitypes';
import { IconStyle } from './guitypes';


export class GUI_atlas {

    private _image: HTMLImageElement;
    private _name: string;
    private _icons: { [key: string] : {rect: { x: number, y: number, w: number, h: number }, image: HTMLImageElement }};


    /**
     * @param {Image} image preloaded image
     * @param {String} name name of the atlas
     */
    constructor(image, name) {
        this._image = image;
        this._name = name;
        this._icons = {};
    }

    atlas_to_color(color, name) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(this._image, 0, 0 );
        
        var target_canvas = document.createElement('canvas');
        var target_ctx = target_canvas.getContext('2d');
        
        var id = target_ctx.createImageData(1,1);
        

        target_ctx.beginPath();
        target_ctx.rect(0, 0, this._image.width, this._image.height);
        target_ctx.fillStyle = "black";
        target_ctx.fill();
        
        target_ctx.fillStyle = color;

        //canvas.getContext('2d').getImageData(x, y, 1, 1).data;

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

    }

    define_icon(name, rect) {
        this._icons[name] = { rect: rect, image: this._image };
    }

    get(name) {
        return this._icons[name];
    }
};

export class GUI_icon {
    private _elem_id:   string;
    private _name:      string;
    private _img:       HTMLImageElement;
    private _rect:      Rect; 

	constructor(elem_id, name) {
		
	}

	id() { return this._elem_id; }
	name() { return this._name; }
    img() { return this._img; }
    rect() { return this._rect; }

};