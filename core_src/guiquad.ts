import { Rect } from './guimath';
import { Point } from './guimath';
import { FDGMath } from './guimath';
import { Anchor } from './guitypes';
import { BackgroundImage } from './guitypes';
import { MouseButton } from './guitypes';
import { State } from './guitypes';
import { IconStyle } from './guitypes';
import { NodeOverlaps } from './guitypes';



import { GUI_icon } from './guiicon';
import { GUI_node } from './guinode';
import { Render_screen } from './render';



/**
 * internal class used to optimize the drawing to canvas
 * 
 * @class
 */
export class GUI_quad {
    private _renderer:      Render_screen;
    private _changed:       boolean;
    private _rect:          Rect;
    private _img_rect:      Rect;
    // correct due to pixel perfectness
    private _pp_rect:       Rect;

    private _layers:        { [key: string] : any };       

    private _bg_color:      string;
    private _id:            string;
    private _bg_image:      HTMLImageElement;


    /**
     * 
     * @param {Renderer} renderer the renderer
     * @param {JSON} rect x, y, w, h
     */
    constructor(renderer: Render_screen, rect: Rect, id: string) {
        //this._rect      = { x: offset_x, y: offset_y, w: width, h: height };
        
        this._renderer  = renderer;
        this._changed   = true;
        this._rect      = rect;
        this._img_rect  = { x: 0, y: 0, w: 0, h: 0 };
        // correct due to pixel perfectness
        this._pp_rect = { x: this._rect.x - 0.5, y: this._rect.y - 0.5, w: this._rect.w + 0.5, h: this._rect.w + 0.5 };

        this._layers    = {};

        this._bg_color = '#000000';
        this._id       = id;
        this._bg_image = null;
    }

    /**
     * @returns {string} grid id
     */
    id() : string {
        return this._id;
    }

    /**
     * 
     * @returns {JSON} x, y, w, h
     */
    rect() : Rect {
        return this._rect;
    }

    /**
     * if the quad has any elements with a change inside, returns true
     * 
     * @returns {boolean}
     */
    is_changed() : boolean {
        return this._changed;
    }

    get_node_with_id(id: number, layer: string = 'default') : GUI_node {
        if (!this._layers.hasOwnProperty(layer)) {
            return null;
        }

        if (id in this._layers[layer]) {
            return this._layers[layer][id];
        }
        return null;
    }

    /**
     * calculate if the node is inside the quad
     * 
     * @param {GUI_node} gui_node the gui node to add
     */
    calc_node_inside(gui_node: GUI_node) : NodeOverlaps {
        var bordered_rect = null;

        if (gui_node.shape() == 'polygon') {
            bordered_rect = gui_node.br();
        }
        else {
            bordered_rect = gui_node.ap_border_rect(Anchor.ANCHOR_TOPLEFT);
        }

        //console.log('r1: ' + bordered_rect.x + ', ' + bordered_rect.y + ', ' + bordered_rect.w + ', ' + bordered_rect.h);

        if (FDGMath.a_rect_contains_b(this._pp_rect, bordered_rect)) {
            return NodeOverlaps.NODE_FULLY_INSIDE;
        }

        if (FDGMath.a_rect_overlaps_b(this._pp_rect, bordered_rect)) {
            return NodeOverlaps.NODE_PARTIALLY_INSIDE;
        }

        return NodeOverlaps.NODE_NOT_INSIDE;
    }

    clear_nodes(layer: string = 'default') {
        if (!this._layers.hasOwnProperty(layer)) {
            this._layers[layer] = {};
        }
    }

    /**
     * Add GUI_node to the quad
     * 
     * @param {GUI_node} gui_node the gui node to add
     */
    add_node(gui_node: GUI_node, layer: string = 'default') {
        
        if (!this._layers.hasOwnProperty(layer)) {
            this._layers[layer] = {};
        }

        this.set_changed(true);

        this._layers[layer][gui_node.id()] = gui_node;
    }

    /**
     * get all nodes in this quads layer
     * 
     * @returns {Map<GUI_node>} nodes 
     */
    nodes(layer: string = 'default') : { [key: string] : [GUI_node] } {
        return this._layers[layer];
    }

    /**
     * if set to true, will force the quad to draw
     * @param {boolean} changed true to force draw, false to force it to not draw
     */
    set_changed(changed: boolean) {
        this._changed = changed;
    }

    /**
     * sets the background color for the quad 
     * 
     * @param {String} color hex rgb with leading #
     */
    set_bg_color(color: string) {
        this._bg_color = color;
    }

    /**
     * Returns the GUI_node we can find at the given x and y coordinate
     * 
     * @param {number} x
     * @param {number} y
     * @returns {Map<GUI_node>} the GUI_node we found, null if nothing
     */
    get_nodes_at_pos(x: number, y: number, layer: string = 'default') {
        var nodes = {};

        for (var k in this._layers[layer]) {
            
            var n = this._layers[layer][k].hit_test(x, y);

            if (n != null) {
                nodes[k] = n;
            }
        }

        return nodes;
    }
    
    /**
     * Sets a background image for the quad with the given clipping rect
     * 
     * @param {Image} image image object
     * @param {JSON} rect x, y, w, h
     */
    set_bg_image(image: HTMLImageElement, rect: Rect) {
        this._bg_image = image;
        this._img_rect = rect;
    }

    /**
     * 
     * main draw function for quad
     * 
     * @param {String} layer layer identifier
     * @param {boolean} swap if we should swap buffer (false means you make another later drawcall)
     */
    draw(layer: string = 'default', swap: boolean = true, force_draw: boolean = false) : boolean {
        if (!force_draw && !this.is_changed()) {
            return force_draw;
        }
        this._renderer.pre_draw();
        this.set_changed(false);

        if (this._bg_image != null) {
            //this._renderer.draw_image_ctx(this._bg_image, this._img_rect, this._rect);
        }
        else {
            this._renderer.draw_box(this._rect.x, this._rect.y, this._rect.w, this._rect.h, this._bg_color, this._bg_color, 0);
        }

        // draw each node
        for (var k in this._layers[layer]) {
            this._layers[layer][k].draw(false);
        }

        this._renderer.post_draw();

        // swap the buffer for the rect
        this._renderer.swap_buffer(this._rect);

        return force_draw;
    }

    print() {
        console.log('GUI_quad: ' + this.id());
        console.log('        : pp rect: ' + JSON.stringify(this._pp_rect));
    }
}
