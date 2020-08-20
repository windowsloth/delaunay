/***********************QUAD-EDGE DATA STRUCTURE*******************************/
/****************( as desribed in Guibas & Stolfi (1985) )*********************/

// An implimentation of the quad-edge data structure as outlined in PRIMITIVES
// FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI
// DIAGRAMS (1985).
//
// Originally written for use with p5.js, although I tried to write it while
// avoiding p5 as much as possible to in theory make it relatively adaptable.
//
// My comments will be written normally, comments from the original paper will
// be included as well, although they will be paraphrased slightly to account
// for differences in the naming of variables and functions.
// These comments will be written in ALL CAPS for clarity.

class Edges {
  constructor() {
//  Create an arra to store all of the edges we create.
//  Edges are added manually at the time of writing, but this may be changed so
//  that it occurs as part of the setup() method in MakeEdge.
    this.S = [];
  }

  connect(a, b) {
    const e = new MakeEdge();
    e.setup(a.SYM().DATA, b.DATA);
    e.cleave(a.LNEXT());
    e.SYM().cleave(b);
    this.S.splice(this.S.length, 0, e);
    return e;
  }

  destroy(e) {
    e.cleave(e.OPREV());
    e.SYM().cleave(e.SYM().OPREV());
//  Rather than simply disconnecting the edge from its former neighbors, we also
//  must remove it from our array since it is no longer needed.
    if (this.S.indexOf(e) == -1) {
      this.S.splice(this.S.indexOf(e.SYM()), 1);
    } else {
      this.S.splice(this.S.indexOf(e), 1);
    }
  }

  show() {
//  A p5.js function that shows all of the edges. May be removed since it can be
//  done just easily in a p5.js sketch outside of this class.
    for (let edge of this.S) {
      strokeWeight(1);
      stroke(255);
      line(edge.DATA[0],edge.DATA[1],edge.SYM().DATA[0],edge.SYM().DATA[1]);
    }
  }
}

class MakeEdge {
  constructor() {
//  "Each part e [r] of an edge record contains two fields, DATA and NEXT.
//  The DATA field is used to hold geometrical and other nontopological
//  information about the edge..." (Pg 92, Guibas and Stolfi, 1985)
//
//  Each each edge e, we have a start point and an end point. The start point is
//  stored in DATA. As for the end point, we can also imagine another edge,
//  called e.SYM in the paper, that has the opposite start and end points that e
//  does. In other words, e's endpoint is e.SYM's start point and vice versa.
//
//  These edges also have a strict dual, which connects the faces on either side
//  e/e.SYM. The paper refers to the dual of e as e.ROT, and imagines it as a
//  90-degree counter-clockwise rotation of e.
//
//  The array r represents the 4 possible positions that we can rotate e into.
//  r[0] == e
//  r[1] == e.ROT
//  r[2] == e.SYM (since this would be a full 180 degree turn)
//  r[3] == e.ROT^-1 (represented here as INVERSE_ROT)
//
//  Finally, the NEXT property represents the next edge that would we would
//  encounter while traveling in a counter-clockwise direction around the left
//  face of the edge. However, since this edge has only just been created, and
//  we have not defined its relationship to any other edges yet, it does not
//  actually have two distinct faces on either side. It might be helpful to
//  imagine the edge drawn on a sphere; as long as the start and end points of
//  the edge are not equal to each other, it does not subdivide the sphere into
//  two faces. Instead, there is just one continuous face surrounding the edge.
//  Because of this, the next edge we would encounter if we go counter-clockwise
//  is e.SYM, or the opposite orientation of our original edge.

    this.DATA = null;
    this.NEXT = null;
    this.r = [this, null, null, null];
  }

  setup(start, end) {
//  This method receives a start point and end point, and uses those to set up
//  the basic relationships this edge it will have to itself and its dual if it
//  is a lone edge.
    this.DATA = start;
    const sym = new MakeEdge();
    sym.DATA = end;
    this.r[2] = sym;
    sym.r[2] = this;
    sym.NEXT = sym;
    this.NEXT = this;
//  Now that we've defined the edge and its opposite orientation, we need to
//  define its dual.
    const rot = new MakeEdge();
    const rotsym = new MakeEdge();
    this.r[1] = rot;
    this.r[3] = rotsym;
    sym.r[1] = rotsym;
    sym.r[3] = rot;
//  As mentioned earlier, the faces on either side of e are technically actually
//  the same face. This means that the dual of e can be thought of as a loop, or
//  as an edge with that has a start point equal to its own end point, but that
//  seperates two distinct faces. In the case of our dual, those two faces are
//  e and e.SYM.
    rot.r[2] = rotsym;
    rotsym.r[2] = rot;
    rot.NEXT = rotsym;
    rotsym.NEXT = rot;
    rot.r[1] = sym;
    rot.r[3] = this;
    rotsym.r[1] = this;
    rotsym.r[3] = sym;
  }
// The following methods are all used to determine the various relationships
// that our edge has with itself/other edges. The methods themselves use names
// based upon the naming conventions used in the paper, but in order to increase
// legibility there are some getter functions that use different, hopefully more
// intuitive names.
  ROT(n) {
    return this.r[(n + 1) % 4];
  }
  ROT() {
    return this.r[1];
  }
  SYM(n) {
    return this.r[(n + 2) % 4];
  }
  SYM() {
    return this.r[2];
  }
  INVROT(n) {
    return this.r[(n + 3) % 4];
  }
  INVROT() {
    return this.r[3];
  }
  ONEXT(n) {
    return this.r[n].NEXT;
  }
  ONEXT() {
    return this.NEXT;
  }
  OPREV(n) {
    return this.r[(n + 1) % 4].NEXT.ROT();
  }
  OPREV() {
    return this.ROT().NEXT.ROT();
  }
  LNEXT() {
    return this.INVROT().ONEXT().ROT();
  }
  RPREV() {
    return this.SYM().ONEXT();
  }
// These getter methods are what will be used in the actual algorithm itself.
// The only major changes are that I am using start and end rather than org and
// dest, just because they're not that much longer as far as variable names go,
// but it's much more obvious what they mean.
  get start() {
    return this.DATA;
  }
  get end() {
    return this.SYM().DATA;
  }
  get opposite() {
    return this.SYM();
  }
  get lnext() {
    return this.LNEXT();
  }
  get oprev() {
    return this.OPREV();
  }
  get onext() {
    return this.ONEXT();
  }
  get rprev() {
    return this.RPREV();
  }

  cleave(e) {
//  "In this case SPLICE[a, b] splits the common origin of a and b in two
//  separate vertices and joins their left faces. If the origins are distinct
//  and the left faces are the same, the effect will be precisely the opposite:
//  the vertices are joined and the left faces are split. Indeed, Splice is its
//  own inverse: if we perform SPLICE[a, b] twice in a row we Will get back the
//  same subdivision." (Pg 96, Guibas and Stolfi, 1985)
//
//  Since "splice" is reserved in JavaScript for an array function, the splice
//  method described in Guibas and Stolfi's paper has here been renamed cleave.
//  I thought this worked fairly nicely, since cleave is its own antonym, and
//  means both to connect and to seperate.
//
//  This method accepts two edges, and sets them up their relationship to each
//  other, swapping each other's NEXT values. This either makes them next to
//  one another around the same origin, or it splits them up so they are no
//  longer next to one another.
    const newONEXT = e.ONEXT();
    const currONEXT = this.ONEXT();
    this.NEXT = newONEXT;
    e.NEXT = currONEXT;

    const alphaONEXT = e.ONEXT().ROT().ONEXT();
    const betaONEXT = this.ONEXT().ROT().ONEXT();
    this.ONEXT().ROT().NEXT = alphaONEXT;
    e.ONEXT().ROT().NEXT = betaONEXT;
  }
  
  connect(a, arr) {
    const e = new MakeEdge();
    e.setup(this.SYM().DATA, a.DATA);
    e.cleave(this.LNEXT());
    e.SYM().cleave(a);
    arr.splice(arr.length, 0, e);
    return e;
  }

  static.destroy(e, arr) {
    e.cleave(e.OPREV());
    e.SYM().cleave(e.SYM().OPREV());
//  Rather than simply disconnecting the edge from its former neighbors, we also
//  must remove it from our array since it is no longer needed.
    if (arr.indexOf(e) == -1) {
      arr.splice(arr.indexOf(e.SYM()), 1);
    } else {
      arr.splice(arr.indexOf(e), 1);
    }
  }
}
