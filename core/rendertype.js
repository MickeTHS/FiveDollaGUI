var _rt_ids = 0;

const RT_SQUARE         = 0;
const RT_POLYGON        = 1;
const RT_BORDER_SQUARE  = 2;
const RT_BORDER_POLY    = 3;
const RT_TEXT           = 4;
const RT_ICON           = 5;

class Render_type {
    /**
     * @param {number} id a unique id for the render type
     * @param {number} type RT_SQUARE RT_POLYGON RT_BORDER_SQUARE RT_BORDER_POLY
     * @param {String} color bg or text color
     * @param {number} border_thickness thickness of border in pixels
     * @param {String} border_color color of border
     */
    constructor(id, type, color, border_thickness = 0, border_color = '#000') {
        this.id = id;
        this.type = type;
        this.color = color;
        this.border_thickness = border_thickness;
        this.border_color = border_color;
        

        this._nodes = {};
    }

    /**
     * removes the node
     * 
     * @param {GUI_node} gui_node
     * 
     * @returns {GUI_node} returns the node if successfully popped, else null if not here
     */
    pop_node(gui_node) {
        for (gui_node.id() in this._nodes) {
            return null;
        }

        var node = this._nodes[gui_node.id()];

        delete this._nodes[gui_node.id()];

        return node;
    }

    /**
     * Adds a node to the renderpass
     * 
     * @param {GUI_node} gui_node node to add, so it will be rendered
     */
    add_node(gui_node) {
        this._nodes[gui_node.id()] = gui_node;
    }

    /**
     * Removes the node from the render type
     * 
     * @param {GUI_node} gui_node node to remove, if found
     */
    remove_node(gui_node) {
        if (gui_node.id() in this._nodes) {
            delete this._nodes[gui_node.id()];
        }
        else {

        }
    }

    draw(renderer) {
        if (this.type == RT_SQUARE) {
            renderer.draw_no_border_box_assoc(this.color, this._nodes);
        }
        else if (this.type == RT_BORDER_SQUARE) {
            renderer.draw_borders_assoc(this.border_color, this.border_thickness, this._nodes);
        }
        else if (this.type == RT_POLYGON) {
            renderer.draw_no_border_poly_assoc(this.color, this._nodes);
        }
        else if (this.type == RT_BORDER_POLY) {
            renderer.draw_borders_poly_assoc(this.border_color, this.border_thickness, this._nodes);
        }
        else if (this.type == RT_TEXT) {
            renderer.draw_text_assoc(this.color, this._nodes);
        }
        else if (this.type == RT_ICON) {
            renderer.draw_icon_assoc(this.color, this._nodes);
        }
    }

    print() {
        var info = [];

        for (var k in this._nodes) {
            var n = this._nodes[k];
            info.push({id: n.id()});
        }

        console.log(JSON.stringify(info));
    }
}

class Render_type_handler {
    constructor(renderer) {
        // we keep a list of ordered renderpasses so we can determine which order to draw certain elements
        this._render_types = [];

        for (var i = 0; i < 6; ++i) {
            this._render_types.push({});
        }
        
        this._renderer = renderer;
    }

    /**
     * Adds a new Render_type or returns existing
     * 
     * @param {String} background_color bg color
     */
    add_icon() {
        for (var k in this._render_types[5]) {
            var rt = this._render_types[5][k];

            if (rt.type == RT_ICON) {
                return rt;
            }
        }
        
        var rt = new Render_type(_rt_ids++, RT_ICON, null, null, null);

        this._render_types[5][rt.id] = rt;

        return rt;
    }


    /**
     * Adds a new Render_type or returns existing
     * 
     * @param {String} background_color bg color
     */
    add_square(background_color) {
        for (var k in this._render_types[0]) {
            var rt = this._render_types[0][k];

            if (rt.type == RT_SQUARE && rt.color == background_color) {
                return rt;
            }
        }
        
        var rt = new Render_type(_rt_ids++, RT_SQUARE, background_color, null, null);

        this._render_types[0][rt.id] = rt;

        return rt;
    }

    /**
     * 
     * Adds a new Render_type or returns existing
     * 
     * 
     * @param {String} background_color bg color
     */
    add_polygon(background_color) {
        for (var k in this._render_types[0]) {
            var rt = this._render_types[0][k];

            if (rt.type == RT_POLYGON && rt.color == background_color) {
                return rt;
            }
        }
        
        var rt = new Render_type(_rt_ids++, RT_POLYGON, background_color, null, null);

        this._render_types[0][rt.id] = rt;

        return rt;
    }

    /**
     * 
     * Adds a new Render_type or returns existing
     * 
     * 
     * @param {number} border_thickness thickness of border in pixels
     * @param {String} border_color color of border
     */
    add_border(border_thickness, border_color) {
        for (var k in this._render_types[1]) {
            var rt = this._render_types[1][k];

            if (rt.type == RT_BORDER_SQUARE && rt.border_thickness == border_thickness && rt.border_color == border_color) {
                return rt;
            }
        }
        
        var rt = new Render_type(_rt_ids++, RT_BORDER_SQUARE, null, border_thickness, border_color);

        this._render_types[1][rt.id] = rt;

        return rt;
    }

    add_text(color) {
        for (var k in this._render_types[4]) {
            var rt = this._render_types[4][k];

            if (rt.type == RT_TEXT && rt.color == color) {
                return rt;
            }
        }
        console.log('added text');
        var rt = new Render_type(_rt_ids++, RT_TEXT, color);

        this._render_types[4][rt.id] = rt;

        return rt;
    }

    /**
     * 
     * Adds a new Render_type or returns existing
     * 
     * 
     * @param {number} border_thickness thickness of border in pixels
     * @param {String} border_color color of border
     */
    add_border_poly(border_thickness, border_color) {
        for (var k in this._render_types[1]) {
            var rt = this._render_types[1][k];

            if (rt.type == RT_BORDER_POLY && rt.border_thickness == border_thickness && rt.border_color == border_color) {
                return rt;
            }
        }
        
        var rt = new Render_type(_rt_ids++, RT_BORDER_POLY, null, border_thickness, border_color);

        this._render_types[1][rt.id] = rt;

        return rt;
    }

    /**
     * Removes the node from the render type
     * 
     * @param {GUI_node} node
     * @param {number} type RT_BORDER_POLY RT_BORDER_SQUARE RT_SQUARE RT_POLYGON
     */
    remove_node(node, type) {
        var layers = [];
        
        if (type == RT_BORDER_POLY || type == RT_BORDER_SQUARE) {
            layers.push(1,3);
            console.log('removing border');
        }
        else if (type == RT_SQUARE || type == RT_POLYGON) {
            layers.push(0,2);
        }
        else if (type == RT_TEXT) {
            layers.push(4);
        }


        for (var l = 0; l < layers.length; ++l) {
            for (var k in this._render_types[layers[l]]) {
                this._render_types[layers[l]][k].remove_node(node);
            }
        }
    }

    /**
     * Changes the rendering order for the node to be displayed behind
     * @param {GUI_node} gui_node
     */
    push_back(gui_node) {
        for(var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
                var n = this._render_types[i][k].pop_node(n);

                if (n != null) {
                    if (i == 0 || i == 1) {
                        console.error('Node is already the furthest back possible');
                    }
                    else {
                        this._render_types[i-2][k].add_node(n);
                    }
                }
            }
        }
    }

    /**
     * Changes the rendering order for the node to be displayed on top
     * 
     * @param {GUI_node} gui_node
     */
    push_to_front(gui_node) {
        for(var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
                var n = this._render_types[i][k].pop_node(n);

                if (n != null) {
                    if (i == 2 || i == 3) {
                        console.error('Node is already the furthest forward possible');
                    }
                    else {
                        this._render_types[i+2][k].add_node(n);
                    }                    
                }
            }
        }
    }

    remove_node_from_all(node) {
        for (var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
               this._render_types[i][k].remove_node(node);
            }
        }
    }


    get(id) {
        if (id in this._render_types) {
            return this._render_types[id];
        }

        return null;
    }

    draw() {
        for (var i = 0; i < this._render_types.length; ++i) {
            for (var k in this._render_types[i]) {
               this._render_types[i][k].draw(this._renderer);
            }
        }
    }

    print() {
        for (var i = 0; i < this._render_types.length; ++i) {
            var rt = this._render_types[i];

            for (var k in rt) {
                console.log('RenderType index ' + i + ' with rt key k: ' + k);
                rt[k].print();
            }
        }      
    }
}