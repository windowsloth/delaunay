/*************************DELAUNAY TRIANGULATION*******************************/
/****************( as desribed in Guibas & Stolfi (1985) )*********************/

// An implimentation of the divide-and-conquer algorithim for calculating a
// delaunay triangulation from a set of points, as outlined in PRIMITIVES
// FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI
// DIAGRAMS (1985).

// Originally written for use with p5.js, although I tried to write it while
// avoiding p5 as much as possible to in theory make it relatively adaptable.

//My comments will be written normally, comments from the original paper will be
//included as well, although they will be paraphrased slightly to account for
// differences in the naming of variables and functions.
// These comments will be written in ALL CAPS for clarity.

function delaunay(points) {
// The function receives a set of points (sorted by x value in ascending order)
// and returns two edges: the left-most and right-most edge of the convex hull
// formed by the set of points.
  let leftedge;
  let rightedge;

  if (points.length == 2) {
//  LET THE TWO POINTS BE TWO SITES, IN SORTED ORDER. CREATE AN EDGE, a, FROM
//  THE FIRST POINT TO THE SECOND.
    const a = new MakeEdge();
    a.setup(points[0], points[1], edges);
    leftedge = a;
    rightedge = a.opposite;
  } else if (points.length == 3) {
//  LET THE THREE POINTS BE THREE SITES, IN SORTED ORDER.
//  CREATE EDGE a CONNECTING POINT 0 TO POINT 1, AND EDGE b CONNECTING POINT 1
 // TO POINT 2.
    const a = new MakeEdge();
    const b = new MakeEdge();
    a.setup(points[0], points[1], edges);
    b.setup(points[1], points[2], edges);
    a.opposite.cleave(b);
//  THEN CLOSE THE TRIANGLE.
    const c = b.connect(a, edges);
//  The following if statements ensure that the triangle's points are sorted in
//  counter-clockwise order, which is important for orienting the edges, and to
//  make sure that the incircle() test will work properly.
    if (rightof(points[2], a)) {
      leftedge = c.opposite;
      rightedge = c;
    } else {
      leftedge = a;
      rightedge = b.opposite;
    }
  } else if (points.length >= 4) {
//  LET l AND r BE THE LEFT AND RIGHT HALVES OF THE SET OF POINTS.
    const split = Math.floor(points.length / 2);
    let l = points.slice(0, split);
    let r = points.slice(split, points.length);
//  We'll recursively run this function again on each half, continuing to divide
//  until we're working with just sets of 2 or 3 points, and then we'll put each
//  of those sets together into bigger and bigger polygons until we've just got
//  one big, juicy polygon, which is the delaunay triangulation of our starting
//  set of points.
    const lefthalf = delaunay(l);
    const righthalf = delaunay(r);
    let leftoutside = lefthalf[0];
    let leftinside = lefthalf[1];
    let rightinside = righthalf[0];
    let rightoutside = righthalf[1];
//  COMPUTE THE LOWER COMMON TANGENT OF l AND r.
//
//  Eseentially, just make sure that the right edge of the left half
//  (leftinside) and the left edge of the right half (rightinside) are
//  on the proper sides of whatever polgons they are on, or if they are just
//  lone edges, that they are oriented properly with in relation to each other.
    while(true) {
      if (!rightof(rightinside.start, leftinside)) {
        leftinside = leftinside.lnext;
      } else if (rightof(leftinside.start, rightinside)) {
        rightinside = rightinside.rprev;
      } else {
        break;
      }
    }
//  CREATE THE FIRST CROSS EDGE base FROM rightinside.start TO leftinside.start
//
//  Connect the two halves based on those lower tangent points we found and
//  oriented in the last step. Then, lets see if base, the connecting edge we
//  just drew, can be considered the new leftoutside or rightoutside edge of the
//  larger hull that we're in the process of creating by combining l and r (the
//  left and right halves of the set of points).
    let base = rightinside.opposite.connect(leftinside, edges);
    if (leftinside.start == leftoutside.start) {
      leftoutside = base.opposite;
    }
    if (rightinside.start == rightoutside.start) {
      rightoutside = base;
    }
    while (true) {
//    THIS IS THE MERGE LOOP.
//    LOCATE THE FIRST l POINT (lmaybe.end) TO BE ENCOUNTERED BY THE RISING
//    BUBBLE, AND DELETE l EDGES OUT OF base.end THAT FAIL THE CIRCLE TEST.
//
//    The rising bubble is a way of visualizing what's going on in this step,
//    but essentially we are finding the first point from the left-side polygon,
//    l, that we encounter if we travel directly up from edge base. If we draw a
//    circle that passes through the start point of base, the end point of base,
//    and that first point in l (which is the endpoint of lmaybe), we want that
//    circle to have no other points from l within it.
//
//    If the endpoint of the next edge of l that we hit when traveling around
//    lmaybe's startpoint does in fact fall within the circle, then that next
//    edge becomes lmaybe and we run the test again until either the circle is
//    free of points, or we run out of edges in l that are above edge base.
      let lmaybe = base.opposite.onext;
      while(rightof(lmaybe.end, base)
        && incircle(base.end, base.start, lmaybe.end, lmaybe.onext.end)) {
        let temp = lmaybe.onext;
        lmaybe.destroy(edges);
        lmaybe = temp;
      }
//    SYMMETRICALLY, LOCATE THE FIRST r POINT TO BE HIT, AND DELETE r EDGES
//
//    Do the same thing, except instead of checking the endpoint of next edge
//    with our circle, we're checking the previous edge. Again, it's the same
//    steps that we did for lmaybe, we just need to mirror them for rmaybe.
      let rmaybe = base.oprev;
      while(rightof(rmaybe.end, base)
        && incircle(base.end, base.start, rmaybe.end, rmaybe.oprev.end)) {
        let temp = rmaybe.oprev
        rmaybe.destroy(edges);
        rmaybe = temp;
      }
//    IF BOTH lmaybe AND rmaybe ARE INVALID, THEN base IS THE UPPER COMMON
//    TANGENT.
//
//    If we run out of edges on both sides that are above the base, then we must
//    be dealing with the top-most edge, and we can break out of our loop.
      if (!valid(lmaybe, base) && !valid(rmaybe, base)) {
        break;
      }
//    THE NEXT CROSS EDGE IS TO BE CONNECTED TO EITHER lmaybe.end OR rmaybe.end.
//    IF BOTH ARE VALID, THEN CHOOSE THE APPROPRIATE ONE USING THE incircle
//    TEST.
//
//    We want our cross eges to zig-zag their way up as they connect the
//    polygons, filling in a series of triangles that connect l and r.
//    Sometimes, both lmaybe and rmaybe will be valid, and in that case, we
//    see which one is closer to base by seeing if rmaybe is within the circle
//    that passes through lmaybe.end, lmaybe.start, and rmaybe.start.
      if (rightof(lmaybe.end, base)) {
        if (rightof(rmaybe.end, base)
          && incircle(lmaybe.end, lmaybe.start, rmaybe.start, rmaybe.end)) {
          base = rmaybe.connect(base.opposite, edges);
        } else {
          base = base.opposite.connect(lmaybe.opposite, edges);
        }
      } else {
        base = rmaybe.connect(base.opposite, edges);
      }
//    Now all that's left is to return what the left and right-most edges of the
//    resulting polygon are.
      leftedge = leftoutside;
      rightedge = rightoutside;
    }
  }
  return [leftedge, rightedge];
}
// All of the functions below are various tests used throughout the algorithm,
// or at least this implimentation of it.
//
// A test to determine if thre points are in counter clockwise order around
// their centroid. To be honest, I almost definitely wrote something wrong here,
// because I was rarely able to get reliable results. Because of this, I
// generally determine counter-clockwise oritenation using a differnt version of
// the rightof/leftof tests described in the paper to see where a point falls
// compared to a given edge, and then re-ordering the points as necessary.
function ccw(a, b, c) {
  return (a[0] * (b[1] - c[1]) - a[1] * (b[0] - c[0])
    + (b[0] * c[1] - b[1] * c[0])) < 0;
}
// Here is that aforementioned "different version of the rightof/leftof tests."
// We just take the cross product of the vector going from edge e.start to e.end
// and the vector going from e.start to point p. If we get a positive result (or
// a vector facing up using the right hand rule), then we can say that p is on
// the right of edge e.
function rightof(p, e) {
  let x = [e.end[0] - e.start[0], e.end[1] - e.start[1]];
  let y = [p[0] - e.start[0], p[1] - e.start[1]];
  return x[0] * y[1] - x[1] * y[0] > 0;
}
// This function returns true if point d falls within the circle abc
// (assuming points abc are sorted in counter-clockwise order).
function incircle(a, b, c, d) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  const cx = c[0];
  const cy = c[1];
  const dx = d[0];
  const dy = d[1];
// An example of how to calculate the determinant is included here solely
// because I am apparently completely incapable of remembering how to do
// Laplace expansion. I'd like to take this oppurtunity to apologize for not
// being a better student back in the 10th grade. Sorry, Mr. Refield.
//
//       |[a, b, c]|
// |M| = |[d, e, f]| = a(ei - fh) - b(di - fg) + c(dh - eg)
//       |[g, h, i]|
//
// And here is the matrix we'll be calculating the determinant of for this test:
//
// |(ABCD)|
//
//  = |[ax, ay, (ax^2) + (ay^2), 1]|
//    |[bx, by, (bx^2) + (by^2), 1]
//    |[cx, cy, (cx^2) + (cy^2), 1]
//    |[dx, dy, (dx^2) + (dy^2), 1]
//
//    [ax - dx, ay - dy, ((ax - dx)^2) + ((ay - dy)^2)]
//  = [bx - dx, by - dy, ((bx - dx)^2) + ((by - dy)^2)]
//    [cx - dx, cy - dy, ((cx - dx)^2) + ((cy - dy)^2)]
  const ei = (by - dy) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fh = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cy - dy);
  const di = (bx - dx) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fg = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cx - dx);
  const dh = (bx - dx) * (cy - dy);
  const eg = (by - dy) * (cx - dx);

  const $a = (ax - dx) * (ei - fh);
  const $b = (ay - dy) * (di - fg);
  const $c = (Math.pow(ax - dx, 2) + Math.pow(ay - dy, 2)) * (dh - eg);
	return ($a - $b + $c) < 0;
}
// This tests if line a is above line b. This is only really used to determine
// if lmaybe or rmaybe are actually above base. As previously noted, this makes
// use of the ccw test in the original paper, but I was having difficulties with
// that version of the test, and used this one that I was able to quickly get
// more reliable results from.
function valid(a, b) {
  return rightof(a.end, b);
}
// Added for debugging purposes, this visualizes the circumcircle of 3 points.
function circcirc(a, b, c) {
  const p1 = createVector(a[0], a[1]);
  const p2 = createVector(b[0], b[1]);
  const p3 = createVector(c[0], c[1]);

  const denom = 2 * pow(
    p5.Vector.cross(p5.Vector.sub(p1, p2), p5.Vector.sub(p2, p3)).mag(), 2);
  const alpha = (pow(p5.Vector.sub(p2, p3).mag(), 2)
    * p5.Vector.sub(p1, p2).dot(p5.Vector.sub(p1, p3))) / denom;
  const beta = (pow(p5.Vector.sub(p1, p3).mag(), 2)
    * p5.Vector.sub(p2, p1).dot(p5.Vector.sub(p2, p3))) / denom;
  const gamma = (pow(p5.Vector.sub(p1, p2).mag(), 2)
    * p5.Vector.sub(p3, p1).dot(p5.Vector.sub(p3, p2))) / denom;

  const center = p5.Vector.add(
    p5.Vector.mult(p1, alpha), p5.Vector.mult(p2, beta)).add(
    p5.Vector.mult(p3, gamma));
  point(center.x, center.y);

  const rad = (p5.Vector.sub(p1, p2).mag() * p5.Vector.sub(p2, p3).mag()
    * p5.Vector.sub(p3, p1).mag())
    / (2 * p5.Vector.cross(p5.Vector.sub(p1, p2), p5.Vector.sub(p2, p3)).mag());
  noFill();
  circle(center.x, center.y, rad * 2);
}
// This quick quicksort function below is just used to order the points prior to
// passing them to the delaunay function. It takes an array of coordinates, and
// a boolean that tells it to sort the array by either x or y values in
// ascending order (true for x, false for y).
function quicksort(arr, start, end, xy) {
  if (start >= end) {
    return;
  }
  let index = partition(arr, start, end, xy);
  quicksort(arr, start, index - 1, xy);
  quicksort(arr, index + 1, end, xy);
}
function partition(arr, start, end, xy) {
  let pivotval;
  if (xy) {
    pivotval = arr[end][0];
  } else {
    pivotval = arr[end][1];
  }
  let pivotindex = start;
  for (let i = start; i < end; i++) {
    if (xy) {
      if (arr[i][0] < pivotval) {
        swap(arr, i, pivotindex);
        pivotindex++;
      }
    } else {
      if (arr[i][1] < pivotval) {
        swap(arr, i, pivotindex);
        pivotindex++;
      }
    }
  }
  swap(arr, end, pivotindex);
  return pivotindex;
}
function swap (arr, a, b) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
