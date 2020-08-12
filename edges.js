class Edges {
  constructor() {
    // this.e = e;
    this.S = [];
  }
  add(org, dest) {
    const e = new MakeEdge();
    e.DATA = this.S[org].SYM.DATA;
    //e.DATA = this.S[this.S.length - 1].SYM.DATA;
    e.sym(dest);
    //e.cleave(this.S[this.S.length -1]);
    e.cleave(this.S[org].SYM);

    if (this.S[org].LNEXT = this.S[org].SYM) {
      this.S[org].LNEXT = e;
    }
    e.cleave(this.S[org].LNEXT);

    this.S.splice(this.S.length, 0, e);
  }
  connect(a, b) {
    const e = new MakeEdge();
    e.setup(a.SYM().DATA, b.DATA);
    e.cleave(a.LNEXT());
    e.SYM().cleave(b);
    this.S.splice(this.S.length, 0, e);

  //   const e = new MakeEdge();
  //   e.DATA = a.SYM.DATA;
  //   e.sym(b.DATA);
  //   //e.DATA = a.SYM.DATA;
  // //  e.SYM.DATA = b.DATA;
  //   e.cleave(a.LNEXT);
  //   e.SYM.cleave(b);
  //   this.S.splice(this.S.length, 0, e);
  }
  destroy(e) {
    e.cleave(e.SYM().LNEXT());
    e.SYM().cleave(e.SYM().OPREV());
    for (e of this.S) {
      if (e.DATA = id) {
        this.S.splice(this.S.indexOf(id, 0), 1);
      }
    }

    // //there's almost no way this works
    // let id = e.DATA;
    // e.cleave(e.SYM.LNEXT);
    // e.SYM.cleave(e.SYM.SYM.LNEXT);
    // for (e of this.S) {
    //   if (e.DATA = id) {
    //     this.S.splice(this.S.indexOf(id, 0), 1);
    //   }
    // }
  }
  swap(e) {
    //same for this
    let a = e.SYM.LNEXT;
    let b = e.SYM.SYM.LNEXT;
    e.cleave(a);
    e.SYM.cleave(b);
    e.cleave(a.LNEXT);
    e.SYM.cleave(b.LNEXT);
    e.DATA = a.SYM.DATA;
    e.SYM.DATA = b.DATA;
  }
  show() {
    for (let edge of this.S) {
      strokeWeight(1);
      stroke(255);
      line(edge.DATA[0],edge.DATA[1],edge.SYM().DATA[0],edge.SYM().DATA[1]);
    }
  }
}

class MakeEdge {
  constructor() {
    /*this.DATA = null;
    this.SYM = null;
    this.ONEXT = this;
    //this.OPREV = this;
    this.LNEXT = null;
    //this.RNEXT = this.SYM;*/

    this.DATA = null;
    this.NEXT = null;
    this.r = [this, null, null, null];
    //this.f = [];
  }
  setup(org, dest) {
    this.DATA = org;
    const sym = new MakeEdge();
    sym.DATA = dest;
    this.r[2] = sym;
    sym.r[2] = this;
    sym.NEXT = sym;
    this.NEXT = this;

    const rot = new MakeEdge();
    const rotsym = new MakeEdge();
    this.r[1] = rot;
    this.r[3] = rotsym;
    sym.r[1] = rotsym;
    sym.r[3] = rot;

    rot.r[2] = rotsym;
    rotsym.r[2] = rot;
    rot.NEXT = rotsym;
    rotsym.NEXT = rot;
    rot.r[1] = sym;
    rot.r[3] = this;
    rotsym.r[1] = this;
    rotsym.r[3] = sym;
  }
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
    //return this.r[1].NEXT.ROT();
    return this.ROT().NEXT.ROT();
  }
  LNEXT() {
    return this.INVROT().ONEXT().ROT();
  }
  RPREV() {
    return this.SYM().ONEXT();
  }

  // sym(dest) {
  //   this.SYM = new MakeEdge();
  //   this.SYM.DATA = dest;
  //   this.SYM.SYM = this;
  //   this.LNEXT = this.SYM;
  //   this.SYM.LNEXT = this;
  // }
  cleave(e) {
    //const newONEXT = e.ONEXT(0);
    //const currONEXT = this.ONEXT(0);
    const newONEXT = e.ONEXT();
    const currONEXT = this.ONEXT();
    this.NEXT = newONEXT;
    e.NEXT = currONEXT;

    const alphaONEXT = e.ONEXT().ROT().ONEXT();
    const betaONEXT = this.ONEXT().ROT().ONEXT();
    // this.ONEXT().r[1] = alphaONEXT;
    // e.ONEXT().r[1] = betaONEXT;
    this.ONEXT().ROT().NEXT = alphaONEXT;
    e.ONEXT().ROT().NEXT = betaONEXT;

    //this.ONEXT(0) = newONEXT;
    //e.ONEXT = currONEXT;

    // const newONEXT = e.ONEXT;
    // const currONEXT = this.ONEXT;
    // this.ONEXT = newONEXT;
    // e.ONEXT = currONEXT;
  }


  // sym() {
  //   const sym = new MakeEdge();
  //   sym.data =  dest;
  // }
  // ccw(v1, v2, v3) {
  //   let ccw = false;
  //   let a = p5.Vector.sub(v2,v1);
  //   let b = p5.Vector.sub(v3,v2);
  //   const det = a.x * b.y - a.y * b.x;
  //   if (det < 0) {
  //     ccw = true;
  //   }
  //   return ccw;
  // }
  // cleave(lnext) {
  //   let dir = this.dest.x == lnext.org.x && this.dest.y == lnext.org.x;
  //   if (!this.LNEXT) {
  //     this.LNEXT = lnext;
  //     lnext.ONEXT = this;
  //   } else {
  //     console.log(this.ccw(this.org, this.dest, lnext.dest));
  //     //console.log(lnext.dest);
  //     if (this.ccw(this.org, this.dest, lnext.dest)) {
  //       const temp = this.LNEXT;
  //       this.DNEXT = temp;
  //       this.LNEXT = lnext;
  //       lnext.ONEXT = this;
  //       lnext.RNEXT = this.DNEXT;
  //       lnext.cleave(this.DNEXT);
  //     } else if (!this.DNEXT){
  //       this.DNEXT = lnext;
  //       lnext.LNEXT = this;
  //     } else if (!this.ccw(this.DNEXT.org, this.DNEXT.dest, lnext.dest)) {
  //       this.DNEXT = lnext;
  //       lnext.LNEXT = this;
  //     }
  //     console.log("But boss... we already got one");
  //   }
  //}
  show() {
    // let curr = this;
    //   do {
    //     strokeWeight(1);
    //     line(curr.LNEXT.org.x,curr.LNEXT.org.y,curr.LNEXT.dest.x,curr.LNEXT.dest.y);
    //     curr = curr.LNEXT;
    //   } while (curr.LNEXT && curr.LNEXT !== this);
    // strokeWeight(1);
    // line(this.org.x, this.org.y, this.dest.x, this.dest.y);
    strokeWeight(1);
    if (this.LNEXT) {
      stroke(255,0,0);
      line(this.dest.x, this.dest.y, this.LNEXT.dest.x, this.LNEXT.dest.y);
    }
    if (this.DNEXT) {
      stroke(0,255,0);
      line(this.dest.x,this.dest.y,this.DNEXT.dest.x, this.DNEXT.dest.y);
    }
  }
}
