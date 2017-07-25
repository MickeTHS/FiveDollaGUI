/**
 * checks if rect_a fully contains rect_b
 */
var a_rect_contains_b = function(rect_a, rect_b) {
    if ((rect_b.x + rect_b.w) < (rect_a.x + rect_a.w)
        && (rect_b.x) > (rect_a.x)
        && (rect_b.y) > (rect_a.y)
        && (rect_b.y+rect_b.h) < (rect_a.y+rect_a.h) ) {
        return true;
    }
    return false;
}

/**
 * makes a collision detection basically
 */
var a_overlaps_b = function(rect_a, rect_b) {
    if (rect_a.x < rect_b.x + rect_b.w &&
        rect_a.x + rect_a.w > rect_b.x &&
        rect_a.y < rect_b.y + rect_b.h &&
        rect_a.h + rect_a.y > rect_b.y) {
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
