const NODE_NOT_INSIDE = 0;
const NODE_FULLY_INSIDE = 2;
const NODE_PARTIALLY_INSIDE = 1;

/**
 * internal class used to optimize the drawing to canvas
 * 
 * @class
 */
class GUI_quad {
    /**
     * 
     * @param {Renderer} renderer the renderer
     * @param {JSON} rect x, y, w, h
     */
    constructor(renderer, rect, id) {
        //this._rect      = { x: offset_x, y: offset_y, w: width, h: height };
        
        this._renderer  = renderer;
        this._changed   = false;
        this._rect      = rect;

        this._layers    = {};

        this._bg_color = '#000000';
        this._id       = id;
    }

    /**
     * @returns {boolean} grid id
     */
    id() {
        return this._id;
    }

    /**
     * 
     * @returns {JSON} x, y, w, h
     */
    rect() {
        return this._rect;
    }

    /**
     * if the quad has any elements with a change inside, returns true
     * 
     * @returns {boolean}
     */
    is_changed() {
        return this._changed;
    }

    /**
     * calculate if the node is inside the quad
     * 
     * @param {GUI_node} gui_node the gui node to add
     */
    calc_node_inside(gui_node) {
        if (a_rect_contains_b(this._rect, gui_node.rect())) {
            return NODE_FULLY_INSIDE;
        }

        if (a_overlaps_b(this._rect, gui_node.rect())) {
            return NODE_PARTIALLY_INSIDE;
        }

        return NODE_NOT_INSIDE;
    }

    /**
     * Add GUI_node to the quad
     * 
     * @param {GUI_node} gui_node the gui node to add
     */
    add_node(gui_node, layer = 'default') {
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
    nodes(layer = 'default') {
        return this._layers[layer];
    }

    /**
     * if set to true, will force the quad to draw
     * @param {boolean} changed true to force draw, false to force it to not draw
     */
    set_changed(changed) {
        this._changed = changed;
    }

    /**
     * sets the background color for the quad 
     * 
     * @param {String} color hex rgb with leading #
     */
    set_bg_color(color) {
        this._bg_color = color;
    }

    /**
     * Returns the GUI_node we can find at the given x and y coordinate
     * 
     * @param {number} x
     * @param {number} y
     * @returns {Map<GUI_node>} the GUI_node we found, null if nothing
     */
    get_nodes_at_pos(x, y, layer = 'default') {
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
     * 
     * main draw function for quad
     * 
     * @param {String} layer layer identifier
     * @param {boolean} swap if we should swap buffer (false means you make another later drawcall)
     */
    draw(layer = 'default', swap = true) {
        if (!this.is_changed()) {
            return;
        }

        this.set_changed(false);
        
        this._renderer.draw_box(this._rect.x, this._rect.y, this._rect.w, this._rect.h, this._bg_color, this._bg_color, 0);

        // draw each node
        for (var k in this._layers[layer]) {
            this._layers[layer][k].draw(false);
        }

        
        //console.log('x:' + this._rect.x +' y:'+ this._rect.y  + ' w:' + this._rect.w +' h:'+  this._rect.h);
        // swap the buffer for the rect
        this._renderer.swap_buffer(this._rect);
    }
}
