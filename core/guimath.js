"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Math_radians(degrees) {
    return degrees * Math.PI / 180;
}
;
function Math_degrees(radians) {
    return radians * 180 / Math.PI;
}
;
var Point = (function () {
    function Point() {
    }
    return Point;
}());
exports.Point = Point;
;
var Rect = (function () {
    function Rect() {
    }
    return Rect;
}());
exports.Rect = Rect;
;
var FDGMath = (function () {
    function FDGMath() {
    }
    FDGMath.invert_points = function (points) {
        var tmp = [];
        for (var i = points.length - 1; i >= 0; --i) {
            tmp.push(points[i]);
        }
        for (var i = 0; i < tmp.length; ++i) {
            points[i] = tmp[i];
        }
    };
    FDGMath.line_intersection = function (Ax, Ay, Bx, By, Cx, Cy, Dx, Dy, point) {
        var distAB, theCos, theSin, newX, ABpos;
        if (Ax == Bx && Ay == By || Cx == Dx && Cy == Dy) {
            return false;
        }
        Bx -= Ax;
        By -= Ay;
        Cx -= Ax;
        Cy -= Ay;
        Dx -= Ax;
        Dy -= Ay;
        distAB = Math.sqrt(Bx * Bx + By * By);
        theCos = Bx / distAB;
        theSin = By / distAB;
        newX = Cx * theCos + Cy * theSin;
        Cy = Cy * theCos - Cx * theSin;
        Cx = newX;
        newX = Dx * theCos + Dy * theSin;
        Dy = Dy * theCos - Dx * theSin;
        Dx = newX;
        if (Cy == Dy) {
            return false;
        }
        ABpos = Dx + (Cx - Dx) * Dy / (Dy - Cy);
        point.x = Ax + ABpos * theCos;
        point.y = Ay + ABpos * theSin;
        return true;
    };
    FDGMath.inset_corner = function (a, b, c, d, e, f, point, insetDist) {
        var c1 = c, d1 = d, c2 = c, d2 = d, dx1, dy1, dist1, dx2, dy2, dist2, insetX, insetY;
        dx1 = c - a;
        dy1 = d - b;
        dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        dx2 = e - c;
        dy2 = f - d;
        dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist1 == 0. || dist2 == 0.)
            return;
        insetX = dy1 / dist1 * insetDist;
        a += insetX;
        c1 += insetX;
        insetY = -dx1 / dist1 * insetDist;
        b += insetY;
        d1 += insetY;
        insetX = dy2 / dist2 * insetDist;
        e += insetX;
        c2 += insetX;
        insetY = -dx2 / dist2 * insetDist;
        f += insetY;
        d2 += insetY;
        if (c1 == c2 && d1 == d2) {
            point.x = c1;
            point.y = d1;
            return;
        }
        var pp = { x: 0, y: 0 };
        if (FDGMath.line_intersection(a, b, c1, d1, c2, d2, e, f, pp)) {
            point.x = pp.x;
            point.y = pp.y;
        }
    };
    FDGMath.inset_polygon = function (points, insetDist) {
        var startX = points[0].x, startY = points[0].y, a, b, c, d, e, f;
        var i;
        var corners = points.length;
        if (corners < 3)
            return false;
        c = points[corners - 1].x;
        d = points[corners - 1].y;
        e = points[0].x;
        f = points[0].y;
        for (i = 0; i < corners - 1; i++) {
            a = c;
            b = d;
            c = e;
            d = f;
            e = points[i + 1].x;
            f = points[i + 1].y;
            FDGMath.inset_corner(a, b, c, d, e, f, points[i], insetDist);
        }
        FDGMath.inset_corner(c, d, e, f, startX, startY, points[i], insetDist);
        return true;
    };
    FDGMath.find_angle = function (p0, p1, c) {
        var p0c = Math.sqrt(Math.pow(c.x - p0.x, 2) +
            Math.pow(c.y - p0.y, 2));
        var p1c = Math.sqrt(Math.pow(c.x - p1.x, 2) +
            Math.pow(c.y - p1.y, 2));
        var p0p1 = Math.sqrt(Math.pow(p1.x - p0.x, 2) +
            Math.pow(p1.y - p0.y, 2));
        return Math.acos((p1c * p1c + p0c * p0c - p0p1 * p0p1) / (2 * p1c * p0c));
    };
    FDGMath.shrink_corner = function (p0, p1, c, dist) {
        var deg = FDGMath.find_angle(p0, p1, c) / 2.0;
        var x = 0;
        var y = 0;
        if (p0.x <= c.x && p1.x >= c.x && p0.y >= c.y && p1.y >= c.y) {
            console.log('case 1');
            if (p0.x - c.x > p1.x - c.x) {
                x = dist * Math.sin(deg - Math_radians(90));
            }
            else {
                x = dist * Math.sin(deg - Math_radians(90)) * -1.0;
            }
            y = dist * Math.cos(deg) * -1.0;
            console.log('x: ' + x + ', y: ' + y);
        }
        if (p0.x >= p1.x && p0.y >= p1.y) {
            x = dist * Math.cos(deg);
            y = dist * Math.sin(deg) * -1.0;
        }
        else if (p0.x <= p1.x && p0.y <= p1.y) {
            x = dist * Math.sin(deg) * -1.0;
            y = dist * Math.cos(deg);
        }
        else if (p0.x <= p1.x && p0.y >= p1.y) {
            x = dist * Math.cos(deg);
            y = dist * Math.sin(deg);
        }
        else if (p0.x >= p1.x && p0.y <= p1.y) {
            x = dist * Math.sin(deg) * -1.0;
            y = dist * Math.cos(deg) * -1.0;
        }
        else {
            console.log('ERROR IN SHRINK CORNER');
        }
        return { x: c.x + x, y: c.y + y };
    };
    FDGMath.p_poly = function (vertices, testx, testy) {
        var nvert = vertices.length;
        var i, j, c = false;
        for (i = 0, j = nvert - 1; i < nvert; j = i++) {
            if (((vertices[i].y > testy) != (vertices[j].y > testy)) &&
                (testx < (vertices[j].x - vertices[i].x) * (testy - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
                c = !c;
        }
        return c;
    };
    FDGMath.a_rect_contains_b = function (rect_a, rect_b) {
        if ((rect_b.x + rect_b.w) < (rect_a.x + rect_a.w)
            && (rect_b.x) > (rect_a.x)
            && (rect_b.y) < (rect_a.y)
            && (rect_b.y + rect_b.h) < (rect_a.y + rect_a.h)) {
            return true;
        }
        return false;
    };
    FDGMath.a_rect_overlaps_b = function (rect_a, rect_b) {
        if (rect_a.x < rect_b.x + rect_b.w &&
            rect_a.x + rect_a.w > rect_b.x &&
            rect_a.y < rect_b.y + rect_b.h &&
            rect_a.h + rect_a.y > rect_b.y) {
            return true;
        }
        return false;
    };
    FDGMath.random_hex_color = function () {
        var randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); });
        return randomColor;
    };
    FDGMath.rect_center_to_topleft = function (rect) {
        return { x: rect.x - rect.w / 2, y: rect.y - rect.h / 2, w: rect.w, h: rect.h };
    };
    FDGMath.rect_topleft_to_center = function (rect) {
        return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, w: rect.w, h: rect.h };
    };
    FDGMath.min_arr = function (array, prop_name) {
        var min = Number.POSITIVE_INFINITY;
        for (var i = 0; i < array.length; ++i) {
            if (array[i][prop_name] < min) {
                min = array[i][prop_name];
            }
        }
        return min;
    };
    FDGMath.max_arr = function (array, prop_name) {
        var max = Number.NEGATIVE_INFINITY;
        for (var i = 0; i < array.length; ++i) {
            if (array[i][prop_name] > max) {
                max = array[i][prop_name];
            }
        }
        return max;
    };
    FDGMath.calc_br = function (points) {
        var min_x = FDGMath.min_arr(points, 'x');
        var max_x = FDGMath.max_arr(points, 'x');
        var min_y = FDGMath.min_arr(points, 'y');
        var max_y = FDGMath.max_arr(points, 'y');
        var br = { x: min_x, y: min_y, w: max_x - min_x, h: max_y - min_y };
        return br;
    };
    FDGMath.point_in_rect = function (x, y, rect) {
        if (rect.x > x || rect.x + rect.w < x || rect.y > y || rect.y + rect.h < y) {
            return false;
        }
        return true;
    };
    FDGMath.sign = function (x0, y0, x1, y1, x2, y2) {
        return (x0 - x2) * (y1 - y2) - (x1 - x2) * (y0 - y2);
    };
    FDGMath.point_in_triangle = function (x, y, x0, y0, x1, y1, x2, y2) {
        var b1 = FDGMath.sign(x, y, x0, y0, x1, y1) < 0.0;
        var b2 = FDGMath.sign(x, y, x1, y1, x2, y2) < 0.0;
        var b3 = FDGMath.sign(x, y, x2, y2, x0, y0) < 0.0;
        return ((b1 == b2) && (b2 == b3));
    };
    return FDGMath;
}());
exports.FDGMath = FDGMath;
