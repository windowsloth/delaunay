
let complexity = 14;
const set = [];
const edges = new Edges();

function setup() {
  noLoop();
  //randomSeed(7272);

  createCanvas(500, 500);
  background(0);
  stroke(255);
  strokeWeight(5);

  for (let i = 0; i < complexity; i ++) {
    let x = random(50, width - 50);
    let y = random(50, height - 50);
    set[i] = createVector(x,y);
  }
}
function draw() {
  quicksort(set, 0, complexity - 1, true);
  //console.log(set);
  for (p of set) {
    point(p.x, p.y);
  }

  console.log(delaunay(set));
  //delaunay(set);
  console.log(edges);
  edges.show();
}

function delaunay(points) {
  const n = [];
  let le;
  let re;

  for (p of points) {
    let arr = [p.x, p.y]
    n.splice(n.length, 0, arr);
  }
  if (n.length == 2) {
    const a = new MakeEdge();
    a.setup(n[0], n[1]);
    edges.S.splice(edges.S.length, 0, a);
    le = a;
    re = a.SYM();
  } else if (n.length == 3) {
    const a = new MakeEdge();
    const b = new MakeEdge();
    a.setup(n[0], n[1]);
    b.setup(n[1], n[2]);
    a.SYM().cleave(b);
    edges.S.splice(edges.S.length, 0, a);
    edges.S.splice(edges.S.length, 0, b);
    const c = edges.connect(b, a);
    if (ccw(n[0], n[1], n[2]) /*leftof(c.DATA, a)*/) {
      le = a;
      re = b.SYM();
    } else if (ccw(n[0], n[2], n[1])) {
      // le = edges.S[edges.S.length - 1].SYM();
      // re = edges.S[edges.S.length - 1];
      le = c.SYM();
      re = c;
    }
  } else if (n.length >= 4) {
    const split = Math.floor(points.length / 2);
    let l = points.splice(0, split);
    let r = points;
    le = delaunay(l);
    re = delaunay(r);
    let ldo = le[0];
    let ldi = le[1];
    let rdi = re[0];
    let rdo = re[1];
    
    while(true) {
      if (leftof(rdi.DATA, ldi)) {
        console.log("flip le");
        ldi = ldi.LNEXT();
      } else if (rightof(ldi.DATA, rdi)) {
        console.log("fleepo");
        rdi = rdi.RPREV();
      } else {
        break;
      }
    }

    // line(ldi.DATA[0], ldi.DATA[1], ldi.SYM().DATA[0], ldi.SYM().DATA[1]);
    // circle(ldi.DATA[0], ldi.DATA[1], 5);

    let base1 = edges.connect(rdi.SYM(), ldi);
    //let base1 = edges.S[edges.S.length - 1];
    // stroke(0,255,0);
    // line(base1.DATA[0], base1.DATA[1], base1.SYM().DATA[0], base1.SYM().DATA[1]);
    // circle(ldi.DATA[0], ldi.DATA[1], 10);
    // stroke(255, 0, 0);
    // circle(ldo.DATA[0], ldo.DATA[1], 10);
    if (ldi.DATA == ldo.DATA /*|| ldi.SYM().DATA == ldo.DATA*/) {
      ldo = base1.SYM();
    }
    if (rdi.DATA == rdo.DATA /*|| rdi.SYM().DATA == rdo.DATA*/) {
      rdo = base1;
    }
    // console.log(base1);
    // console.log(base1.OPREV());
    // circcirc(base1.SYM().DATA, base1.DATA, base1.OPREV().SYM().DATA);

  //   //console.log(base1);
    //MERGE LOOP BEGINS HERE!!
    let exit = false;
    while (!exit) {

    let lcand = base1.SYM().ONEXT();
    // stroke(255,0,0);
    // line(lcand.DATA[0],lcand.DATA[1],lcand.SYM().DATA[0],lcand.SYM().DATA[1]);
    //if (valid(lcand, base1)) {
      while(valid(lcand, base1) && incircle(base1.SYM().DATA, base1.DATA, lcand.SYM().DATA, lcand.ONEXT().SYM().DATA)) {
        console.log("moving lcand!");
        console.log(lcand);
        let temp = lcand.ONEXT();
        edges.destroy(lcand);
        lcand = temp;
      }
    //}
      
    let rcand = base1.OPREV();
    // stroke(255,0,0);
    // line(rcand.DATA[0],rcand.DATA[1],rcand.SYM().DATA[0],rcand.SYM().DATA[1]);
    // console.log(rcand);
    //if (valid(rcand, base1)) {
      while(valid(rcand, base1) && incircle(base1.SYM().DATA, base1.DATA, rcand.SYM().DATA, rcand.OPREV().SYM().DATA)) {
        //circle(rcand.OPREV().SYM().DATA[0], rcand.OPREV().SYM().DATA[1], 10);
        console.log("moving rcand!");
        let temp = rcand.OPREV();
        edges.destroy(rcand);
        rcand = temp;
      }
    //}
    console.log("Is rcand valid?" + valid(rcand, base1));
    //console.log(ccw(rcand.SYM().DATA, base1.SYM().DATA, base1.DATA));

    console.log("quick!" + valid(lcand, base1));
    console.log("quick!" + valid(rcand, base1));
    if (!valid(lcand, base1) && !valid(rcand, base1)) {
      exit = true;
      console.log("done!");
      break;
    }
      
    if (valid(lcand, base1)) {
      if (valid(rcand, base1) && incircle(lcand.SYM().DATA, lcand.DATA, rcand.DATA, rcand.SYM().DATA)) {
        console.log("rcand wins");
        edges.connect(rcand, base1.SYM());
        base1 = edges.S[edges.S.length - 1];
      } else {
        console.log("lcand wins");
        edges.connect(base1.SYM(), lcand.SYM());
        base1 = edges.S[edges.S.length - 1];
      }
    } else {
      console.log("rcand wins but lets make sure it's valid: " + valid(rcand, base1));
      edges.connect(rcand, base1.SYM());
      base1 = edges.S[edges.S.length - 1];
    }

    le = ldo;
    re = rdo;
  }

  }
  return [le, re];
  //edges.show();
}

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
    pivotval = arr[end].x;
  } else {
    pivotval = arr[end].y;
  }
  let pivotindex = start;
  for (let i = start; i < end; i++) {
    if (xy) {
      if (arr[i].x < pivotval) {
        swap(arr, i, pivotindex);
        pivotindex++;
      }
    } else {
      if (arr[i].y < pivotval) {
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

function ccw(a, b, c) {
  //console.log((a[0] * (b[1] - c[1]) - a[1] * (b[0] - c[0]) + (b[0] * c[1] - b[1] * c[0])) < 0)
  return (a[0] * (b[1] - c[1]) - a[1] * (b[0] - c[0]) + (b[0] * c[1] - b[1] * c[0])) < 0;
  //return(incircle(a, b, c, 1));
  /*if (aei + bfg + cdh - ceg - bdi - afh < 0) {
    det = true;
  }
  return det;*/
  //return (aei + bfg + cdh - ceg - bdi - afh) > 0;
}
function rightof(p, e) {
  let x = [e.SYM().DATA[0] - e.DATA[0], e.SYM().DATA[1] - e.DATA[1]];
  let y = [p[0] - e.DATA[0], p[1] - e.DATA[1]];
  return x[0] * y[1] - x[1] * y[0] > 0;
}
function leftof(p, e) {
  let x = [e.SYM().DATA[0] - e.DATA[0], e.SYM().DATA[1] - e.DATA[1]];
  let y = [p[0] - e.DATA[0], p[1] - e.DATA[1]];
  return x[0] * y[1] - x[1] * y[0] < 0;
}
// function rightof(x, e) {
//   return ccw(x, e.SYM().DATA, e.DATA);
// }
// function leftof(x, e) {
//   return ccw(x, e.DATA, e.SYM().DATA);
// }
function incircle(a, b, c, d) {
//Need to change the name or something here bc its not intuitive
//Returns true if point d falls within the circle abc
//Assuming abc are sorted in counter-clockwise order
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  const cx = c[0];
  const cy = c[1];
  const dx = d[0];
  const dy = d[1];
  //Determinant calculation example included here b/c I can never remember it
  //       |[a, b, c]|
  // |M| = |[d, e, f]| = a(ei - fh) - b(di - fg) + c(dh - eg)
  //       |[g, h, i]|
  //
  // [ax - dx, ay - dy, Math.pow(ax - dx, 2) + Math.pow(ay - dy, 2)]
  // [bx - dx, by - dy, Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)]
  // [cx - dx, cy - dy, Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2)]

  const ei = (by - dy) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fh = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cy - dy);
  const di = (bx - dx) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fg = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cx - dx);
  const dh = (bx - dx) * (cy - dy);
  const eg = (by - dy) * (cx - dx);

  const $a = (ax - dx) * (ei - fh);
  const $b = (ay - dy) * (di - fg);
  const $c = (Math.pow(ax - dx, 2) + Math.pow(ay - dy, 2)) * (dh - eg);
	//console.log($a - $b + $c);
  /*if ($a - $b + $c > 0) {
    det = false;
  }
  return det;*/

  // stroke(255);
  // strokeWeight(.5);
  // circcirc(a, b, c);
  // if($a - $b + $c < 0) {
  //   stroke(255, 0, 0);
  //   strokeWeight(10);
  //   point(d[0], d[1]);
  // } else {
  //   stroke(0, 255, 0);
  //   strokeWeight(10);
  //   point(d[0], d[1]);
  // }
	return ($a - $b + $c) < 0;
}
function valid(a, b) {
  let result = false;
  if (rightof(a.SYM().DATA, b)/* && ccw(a.SYM().DATA, b.SYM().DATA, b.DATA)*/) {
    result = true;
  }
  return result;
}


function circcirc(a, b, c) {
  // const p1 = createVector(a.DATA[0], a.DATA[1]);
  // const p2 = createVector(b.DATA[0], b.DATA[1]);
  // const p3 = createVector(c.DATA[0], c.DATA[1]);
  const p1 = createVector(a[0], a[1]);
  const p2 = createVector(b[0], b[1]);
  const p3 = createVector(c[0], c[1]);

  const denom = 2 * pow(p5.Vector.cross(p5.Vector.sub(p1, p2), p5.Vector.sub(p2, p3)).mag(), 2);
  const alpha = (pow(p5.Vector.sub(p2, p3).mag(), 2) * p5.Vector.sub(p1, p2).dot(p5.Vector.sub(p1, p3))) / denom;
  const beta = (pow(p5.Vector.sub(p1, p3).mag(), 2) * p5.Vector.sub(p2, p1).dot(p5.Vector.sub(p2, p3))) / denom;
  const gamma = (pow(p5.Vector.sub(p1, p2).mag(), 2) * p5.Vector.sub(p3, p1).dot(p5.Vector.sub(p3, p2))) / denom;

  const center = p5.Vector.add(p5.Vector.mult(p1, alpha), p5.Vector.mult(p2, beta)).add(p5.Vector.mult(p3, gamma));
  console.log(center);
  point(center.x, center.y);

  const rad =(p5.Vector.sub(p1, p2).mag() * p5.Vector.sub(p2, p3).mag() * p5.Vector.sub(p3, p1).mag()) / (2 * p5.Vector.cross(p5.Vector.sub(p1, p2), p5.Vector.sub(p2, p3)).mag());
  noFill();
  console.log(rad);
  circle(center.x, center.y, rad * 2);
}
