// Converts from degrees to radians.
function Math_radians(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
function Math_degrees (radians) {
  return radians * 180 / Math.PI;
};

export class Point {
    public x: number;
    public y: number;
};

export class Rect {
    public x: number;
    public y: number;
    public w: number;
    public h: number;
};

export class FDGMath {
    /**
     * Changes the list of points to be from clockwise to counter clockwise, or the other way around
     */
    public static invert_points (points: [Point]) {
        var tmp = [];

        for (var i = points.length-1; i >= 0; --i) {
            tmp.push(points[i]);
        }

        for (var i = 0; i < tmp.length; ++i) {
            points[i] = tmp[i];
        }
    }

    public static line_intersection (
        Ax: number, Ay: number,
        Bx: number, By: number,
        Cx: number, Cy: number,
        Dx: number, Dy: number,
        point: Point) : boolean {

        var  distAB: number, theCos: number, theSin: number, newX: number, ABpos: number;

        //  Fail if either line is undefined.
        if (Ax==Bx && Ay==By || Cx==Dx && Cy==Dy) {
            return false;
        }

        //  (1) Translate the system so that point A is on the origin.
        Bx-=Ax; By-=Ay;
        Cx-=Ax; Cy-=Ay;
        Dx-=Ax; Dy-=Ay;

        //  Discover the length of segment A-B.
        distAB=Math.sqrt(Bx*Bx+By*By);

        //  (2) Rotate the system so that point B is on the positive X axis.
        theCos=Bx/distAB;
        theSin=By/distAB;
        newX=Cx*theCos+Cy*theSin;
        Cy  =Cy*theCos-Cx*theSin; Cx=newX;
        newX=Dx*theCos+Dy*theSin;
        Dy  =Dy*theCos-Dx*theSin; Dx=newX;

        //  Fail if the lines are parallel.
        if (Cy==Dy) {
            return false;
        }

        //  (3) Discover the position of the intersection point along line A-B.
        ABpos=Dx+(Cx-Dx)*Dy/(Dy-Cy);

        //  (4) Apply the discovered position to line A-B in the original coordinate system.
        point.x=Ax+ABpos*theCos;
        point.y=Ay+ABpos*theSin;

        //  Success.
        return true; 
    }

    //  Given the sequentially connected points (a,b), (c,d), and (e,f), this
    //  function returns, in (C,D), a bevel-inset replacement for point (c,d).
    //
    //  Note:  If vectors (a,b)->(c,d) and (c,d)->(e,f) are exactly 180° opposed,
    //         or if either segment is zero-length, this function will do
    //         nothing; i.e. point (C,D) will not be set.

    public static inset_corner (
    a: number, b: number,   //  previous point
    c: number, d: number,   //  current point that needs to be inset
    e: number, f: number,   //  next point
    point: Point,   //  storage location for new, inset point
    insetDist: number) {     //  amount of inset (perpendicular to each line segment)

        var  c1=c, d1=d, c2=c, d2=d, dx1, dy1, dist1, dx2, dy2, dist2, insetX, insetY;

        //  Calculate length of line segments.
        dx1=c-a; dy1=d-b; dist1=Math.sqrt(dx1*dx1+dy1*dy1);
        dx2=e-c; dy2=f-d; dist2=Math.sqrt(dx2*dx2+dy2*dy2);

        //  Exit if either segment is zero-length.
        if (dist1==0. || dist2==0.) return;

        //  Inset each of the two line segments.
        insetX= dy1/dist1*insetDist; a+=insetX; c1+=insetX;
        insetY=-dx1/dist1*insetDist; b+=insetY; d1+=insetY;
        insetX= dy2/dist2*insetDist; e+=insetX; c2+=insetX;
        insetY=-dx2/dist2*insetDist; f+=insetY; d2+=insetY;

        //  If inset segments connect perfectly, return the connection point.
        if (c1==c2 && d1==d2) {
            point.x=c1; point.y=d1; return; 
        }

        var pp = {x: 0, y: 0};

        //  Return the intersection point of the two inset segments (if any).
        if (FDGMath.line_intersection(a,b,c1,d1,c2,d2,e,f,pp)) {
            point.x=pp.x; point.y=pp.y; 
        }
    }


    //  public-domain code by Darel Rex Finley, 2007
    //  See diagrams at http://alienryderflex.com/polygon_inset
    public static inset_polygon (points: [Point], insetDist: number) : boolean {

        var startX=points[0].x, startY=points[0].y, a, b, c, d, e, f;
        var i;
        var corners = points.length;

        //  Polygon must have at least three corners to be inset.
        if (corners < 3) return false;

        //  Inset the polygon.
        c=points[corners-1].x; d=points[corners-1].y; e=points[0].x; f=points[0].y;
        for (i=0; i<corners-1; i++) {
            a=c; b=d; c=e; d=f; e=points[i+1].x; f=points[i+1].y;
            FDGMath.inset_corner(a,b,c,d,e,f,points[i],insetDist); 
        }
            
        FDGMath.inset_corner(c,d,e,f,startX,startY,points[i],insetDist); 

        return true;
    }


    /**
     * Calculates the angle (in radians) between two vectors pointing outward from one center
     *
     * @param {JSON} p0 first point
     * @param {JSON} p1 second point
     * @param {JSON} c center point
     */
    public static find_angle (p0: Point, p1: Point, c: Point) : number {
        var p0c = Math.sqrt(Math.pow(c.x-p0.x,2)+
                            Math.pow(c.y-p0.y,2)); // p0->c (b)   
        var p1c = Math.sqrt(Math.pow(c.x-p1.x,2)+
                            Math.pow(c.y-p1.y,2)); // p1->c (a)
        var p0p1 = Math.sqrt(Math.pow(p1.x-p0.x,2)+
                            Math.pow(p1.y-p0.y,2)); // p0->p1 (c)
        return Math.acos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c));
    }


    /**
     * assumes 3 points where polygon has been drawn clockwise
     * 
     * @param {JSON} p0 first point
     * @param {JSON} p1 second point
     * @param {JSON} c center point
     * @param {JSON} dist the distance to shrink 
     * 
     * @returns {JSON} x,y absolute coordinate
     */
    public static shrink_corner (p0: Point, p1: Point, c: Point, dist: number) : Point {
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
        else if (p0.x <= p1.x && p0.y >= p1.y) { // ok
            x = dist * Math.cos(deg);
            y = dist * Math.sin(deg);
        }
        else if (p0.x >= p1.x && p0.y <= p1.y) { //ok!
            x = dist * Math.sin(deg) * -1.0;
            y = dist * Math.cos(deg) * -1.0;
        }
        else {
            console.log('ERROR IN SHRINK CORNER');
        }

        return { x: c.x + x, y: c.y + y};
    }

    /**
     * Checks if a point is inside a polygon
     */
    public static p_poly (vertices: [Point], testx: number, testy: number) : boolean {
        var nvert = vertices.length;

        var i, j, c = false;
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
    public static a_rect_contains_b (rect_a: Rect, rect_b: Rect) : boolean {
        
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
    public static a_rect_overlaps_b (rect_a: Rect, rect_b: Rect) : boolean {

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
    public static random_hex_color () : string {
        //return '#'+Math.floor(Math.random()*16777215).toString(16);
        //return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        //return '#444444';

        var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

        return randomColor;
    }


    public static rect_center_to_topleft(rect: Rect) : Rect {
        return { x: rect.x - rect.w/2, y: rect.y - rect.h/2, w: rect.w, h: rect.h };
    }

    public static rect_topleft_to_center (rect: Rect) : Rect {
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
    public static min_arr(array: [any], prop_name: string) : number {
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
    public static max_arr (array: [any], prop_name: string) : number {
        var max = Number.NEGATIVE_INFINITY;

        for (var i = 0; i < array.length; ++i) {
            if (array[i][prop_name] > max) {
                max = array[i][prop_name];
            }
        }

        return max;
    }

    /** Calculate and return the boundingrect for polygon or path
     * 
     * @returns {Array<JSON>} {x,y,w,h}
     */
    public static calc_br(points: [Point]) {
        var min_x = FDGMath.min_arr(points, 'x');
        var max_x = FDGMath.max_arr(points, 'x');
        var min_y = FDGMath.min_arr(points, 'y');
        var max_y = FDGMath.max_arr(points, 'y');

        var br = {x: min_x, y: min_y, w: max_x - min_x, h: max_y - min_y};

        return br;
    }

    public static point_in_rect(x: number, y: number, rect: Rect) : boolean {
        if (rect.x > x || rect.x + rect.w < x || rect.y > y || rect.y + rect.h < y) {
            return false;
        }
        
        return true;
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
    public static sign (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) : number {
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
    public static point_in_triangle (x: number, y: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) : boolean {
        var b1 = FDGMath.sign(x, y, x0, y0, x1, y1) < 0.0;
        var b2 = FDGMath.sign(x, y, x1, y1, x2, y2) < 0.0;
        var b3 = FDGMath.sign(x, y, x2, y2, x0, y0) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    }
}
