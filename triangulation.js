let complexity = 4;
const set = [];
//const edges = [];
//const syms = [];
const edges = new Edges();

function setup() {
  noLoop();
  randomSeed(117);

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
    a.DATA = n[0];
    a.sym(n[1]);
    edges.S.splice(edges.S.length, 0, a);
    le = a;
    re = a.SYM;
  } else if (n.length == 3) {
    const a = new MakeEdge();
    const b = new MakeEdge();
    a.DATA = n[0];
    a.sym(n[1]);
    b.DATA = n[1];
    b.sym(n[2]);
    a.SYM.cleave(b);
    edges.S.splice(edges.S.length, 0, a);
    edges.S.splice(edges.S.length, 0, b);
    edges.connect(b, a);
    if (ccw(n[0], n[1], n[2])) {
      le = a;
      re = b.SYM;
    } else if (ccw(n[0], n[2], n[1])) {
      le = edges.S[edges.S.length - 1].SYM;
      re = edges.S[edges.S.length - 1];
    }
    // edges.S.splice(edges.S.length, 0, a);
    // edges.S.splice(edges.S.length, 0, b);
  } else if (n.length >= 4) {
    const split = Math.floor(points.length / 2);
    let l = points.splice(0, split);
    let r = points;
    //delaunay(l);
    le = delaunay(l);
    //delaunay(l);
    re = delaunay(r);
    let ldo = le[0];
    let ldi = le[1];
    let rdi = re[0];
    let rdo = re[1];
    //console.log(leftof(re.DATA, le));
    while (leftof(rdi.DATA, ldi) || rightof(ldi.DATA,rdi)) {
      if (leftof(rdi.DATA, ldi)) {
        ldi = ldi.LNEXT;
      } if (rightof(ldi.DATA, rdi)) {
        rdi = rdi.SYM.ONEXT;
      } else {
        break;
      }
    }
    edges.connect(rdi.SYM, ldi);
    let base1 = edges.S[edges.S.length - 1];
    if (ldi.DATA == ldo.DATA) {
      ldo = base1.SYM;
    }
    if (rdi.DATA == rdo.DATA) {
      ldo = base1;
    }

    //MERGE LOOP BEGINS HERE!!
    let lcand = base1.SYM.ONEXT;
    // console.log(lcand);
    // stroke(255,0,0);
    // line(lcand.DATA[0],lcand.DATA[1],lcand.SYM.DATA[0],lcand.SYM.DATA[1]);
    if (valid(lcand, base1)) {
      console.log("hell yeah, brother")
      if (incircle(base1.SYM.DATA, base1.DATA, lcand.SYM.DATA, lcand.DATA)) {
        // let temp = lcand.ONEXT;
        // edges.destroy(lcand);
        // lcand = temp;
      }
      // do {
      //
      // } while(incircle(base1.SYM.DATA, base1.DATA, lcand.SYM.DATA, lcand.DATA));
    }

    let rcand = base1.SYM.LNEXT;
    // stroke(255,0,0);
    // line(rcand.DATA[0],rcand.DATA[1],rcand.SYM.DATA[0],rcand.SYM.DATA[1]);

    le = ldo;
    re = rdo;
  }
  return [le, re];
  //edges.show();
}

// function maketriangles(points) {
//   const n = [];
//   for (let i = 0; i < points.length; i++) {
//     n[i] = points[i];
//   };
//   strokeWeight(1);
//   if (n.length == 2) {
//     const a = new MakeEdge(n[0],n[1]);
//     edges.add(a);
//     //line(n[0].x, n[0].y, n[1].x, n[1].y);
//   } else if (n.length == 3) {
//     const a = new MakeEdge(n[0],n[1]);
//     const b = new MakeEdge(n[1],n[2]);
//     const c = new MakeEdge(n[2],n[0]);
//     edges.add(a);
//     a.cleave(b);
//     b.cleave(c);
//     c.cleave(a);
//     //edges.splice(edges.length,0,a);
//     //edges.splice(edges.length,0,b);
//     //line(n[0].x, n[0].y, n[1].x, n[1].y);
//     //line(n[1].x, n[1].y, n[2].x, n[2].y);
//     //line(n[0].x, n[0].y, n[2].x, n[2].y);
//   } else if (n.length >= 4) {
//     const split = Math.floor(points.length / 2);
//     let l = n.splice(0, split);
//     let r = n;
//     maketriangles(l);
//     maketriangles(r);
//   }
// }
//
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
  let det = false;
  const aei = a[0] * b[1];
  const bfg = a[1] * c[0];
  const cdh = b[0] * c[1];
  const ceg = b[1] * c[0];
  const bdi = a[1] * b[0];
  const afh = a[0] * c[1];
  if (aei + bfg + cdh - ceg - bdi - afh < 0) {
    det = true;
  }
  return det;
}
function rightof(x, e) {
  return ccw(x, e.SYM.DATA, e.DATA);
}
function leftof(x, e) {
  return ccw(x, e.DATA, e.SYM.DATA);
}
function incircle(a, b, c, d) {
  let det = false;

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
  // [ax - dx, ay - dy, Math.pow(ax - dx, 2) - Math.pow(ay - dy, 2)],
  // [bx - dy, by - dy, Math.pow(bx - dx, 2) - Math.pow(by - dy, 2)],
  // [cx - dx, cy - dy, Math.pow(cx - dx, 2) - Math.pow(cy - dy, 2)]
  const ei = (by - dy) * (Math.pow(cx - dx, 2) - Math.pow(cy - dy, 2));
  const fh = (Math.pow(bx - dx, 2) - Math.pow(by - dy, 2)) * (cy - dy);
  const di = (bx - dy) * (Math.pow(cx - dx, 2) - Math.pow(cy - dy, 2));
  const fg = (Math.pow(bx - dx, 2) - Math.pow(by - dy, 2)) * (cx - dx);
  const dh = (bx - dy) * (cy - dy);
  const eg = (by - dy) * (cx - dx);

  const $a = (ax - dx) * (ei - fh);
  const $b = (ay - dy) * (di - fg);
  const $c = (Math.pow(ax - dx, 2) - Math.pow(ay - dy, 2)) * (dh - eg);

  if ($a - $b + $c < 0) {
    det = true;
  }
  return true;
}
function valid(a, b) {
  let result = false;
  if (rightof(a.SYM.DATA, b) && ccw(a.SYM.DATA, b.SYM.DATA, b.DATA)) {
    return true;
  }
  return result;
}
//
// function ccw(a, b, c) {
//   // const v1 = p5.Vector.sub(a.org, a.dest);
//   // const v2 = p5.Vector.sub(b.org, b.dest);
//   // const det = v1.x * v2.y - v1.y * v2.x;
//   // if (det > 0) {
//   //   return true;
//   // } else {
//   //   return false;
//   // }
//   const cx = (a.org.x + b.org.x + c.org.x) / 3;
//   const cy = (a.org.y + b.org.y + c.org.y) /3;
//   const centroid = createVector(cx, cy);
//   let v1 = p5.Vector.sub(centroid, a.org);
//   let v2 = p5.Vector.sub(centroid, c.org);
//   const det = v1.x * v2.y - v1.y * v2.x;
//   if (det > 0) {
//     return true;
//   } else {
//     return false;
//   }
// }

/*class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor(head = null) {
    this.head = head;
  }
}*/

// class Edges {
//   constructor(e = null) {
//     this.e = e;
//   }
//
//   sym() {
//     const sym = new MakeEdge(e.data[1], e.data[0]);
//     return sym;
//   }
// }
//
// class MakeEdge {
//   constructor(org, dest) {
//     this.org = org;
//     this.dest = dest;
//     this.ONEXT = null;
//     this.LNEXT = null;
//   }
//
//   data() {
//     const data = [org, dest];
//     return data;
//   }
//
//   sym() {
//     const sym = [dest, org];
//     return sym;
//   }
//
//   join(onext) {
//     this.ONEXT = onext;
//     onext.LNEXT = this;
//   }
// }
