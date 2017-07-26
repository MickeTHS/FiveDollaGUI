var _debug = false;

/**
 * Checks if a point is inside a polygon
 */
var p_poly = function(vertices, testx, testy) {
    var nvert = vertices.length;

    var i, j, c = 0;
    for (i = 0, j = nvert-1; i < nvert; j = i++) {
        if ( ((vertices[i].y>testy) != (vertices[j].y>testy)) &&
        (testx < (vertices[j].x-vertices[i].x) * (testy-vertices[i].y) / (vertices[j].y-vertices[i].y) + vertices[i].x) )
        c = !c;
    }
    return c;
}

/**
 * checks if rect_a fully contains rect_b
 */
var a_rect_contains_b = function(rect_a, rect_b) {
    if (_debug) {
        if ((rect_b.x + rect_b.w) < (rect_a.x + rect_a.w))
            console.log('ok1');
        if ( (rect_b.x) > (rect_a.x))
            console.log('ok2');
        if ((rect_b.y) > (rect_a.y))
            console.log('ok3');
        if ( (rect_b.y+rect_b.h) < (rect_a.y+rect_a.h) ) 
            console.log('ok4');
    
    }
    

    if ((rect_b.x + rect_b.w) < (rect_a.x + rect_a.w)
        && (rect_b.x) > (rect_a.x)
        && (rect_b.y) < (rect_a.y)
        && (rect_b.y+rect_b.h) < (rect_a.y+rect_a.h) ) {
        return true;
    }
    return false;
}

/**
 * makes a collision detection basically
 */
var a_rect_overlaps_b = function(rect_a, rect_b) {

    if (rect_a.x < rect_b.x + rect_b.w && //ok
        rect_a.x + rect_a.w > rect_b.x && //ok
        rect_a.y < rect_b.y + rect_b.h && //ok
        rect_a.h + rect_a.y > rect_b.y) { //
        return true;
    }

    return false;
}

/**
 * generates and returns a random hex color
 * 
 * @returns {String} hex color with # sign
 */
var random_hex_color = function() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}


var rect_center_to_topleft = function(rect) {
    return { x: rect.x - rect.w/2, y: rect.y - rect.h/2, w: rect.w, h: rect.h };
}

var rect_topleft_to_center = function(rect) {
    return { x: rect.x + rect.w/2, y: rect.y + rect.h/2, w: rect.w, h: rect.h };
}


/**
 * 
 * gets the smallest number in array of or property name
 * 
 * 
 * @param {Array<JSON>} array array of values
 * @param {String} prop_name the key for the value to check: example: 'x' if JSON is [{x: -3, y: 2}, {x: 10, y: 5}], returns -3
 * @returns {number} the smallest number in the array
 */
var min_arr = function(array, prop_name) {
    var min = Number.POSITIVE_INFINITY;

    for (var i = 0; i < array.length; ++i) {
        if (array[i][prop_name] < min) {
            min = array[i][prop_name];
        }
    }

    return min;
}

/**
 * 
 * gets the largest number in array of or property name
 * 
 * 
 * @param {Array<JSON>} array array of values
 * @param {String} prop_name the key for the value to check: example: 'x' if JSON is [{x: -3, y: 2}, {x: 10, y: 5}], returns 10
 * @returns {number} the largest number in the array
 */
var max_arr = function(array, prop_name) {
    var max = Number.NEGATIVE_INFINITY;

    for (var i = 0; i < array.length; ++i) {
        if (array[i][prop_name] > max) {
            max = array[i][prop_name];
        }
    }

    return max;
}

/**
 * Helper function to determine point in triangle
 * 
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
var sign = function (x0, y0, x1, y1, x2, y2) {
    return (x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2);
}

/**
 * Determine is the point x and y is inside a triangle with the given corners 0,1,2
 * 
 * @param {number} x point
 * @param {number} y point
 * @param {number} x0 corner0
 * @param {number} y0 corner0
 * @param {number} x1 corner1
 * @param {number} y1 corner1
 * @param {number} x2 corner2
 * @param {number} y2 corner2
 * 
 * @returns {boolean}
 */
var point_in_triangle = function(x, y, x0, y0, x1, y1, x2, y2) {
    var b1 = sign(x, y, x0, y0, x1, y1) < 0.0;
    var b2 = sign(x, y, x1, y1, x2, y2) < 0.0;
    var b3 = sign(x, y, x2, y2, x0, y0) < 0.0;

    return ((b1 == b2) && (b2 == b3));
}
