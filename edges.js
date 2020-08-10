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
    e.DATA = a.SYM.DATA;
    e.SYM.DATA = b.DATA;
    this.S.splice(this.S.length, 0, e);
    this.cleave(e, a.LNEXT);
    this.cleave(e.SYM, b);
  }
  show() {
    for (let edge of this.S) {
      line(edge.DATA[0],edge.DATA[1],edge.SYM.DATA[0],edge.SYM.DATA[1]);
    }
  }
}

class MakeEdge {
  constructor() {
    this.DATA = null;
    this.SYM = null;
    this.ONEXT = this;
    //this.OPREV = this;
    this.LNEXT = null;
    //this.RNEXT = this.SYM;
  }
  sym(dest) {
    this.SYM = new MakeEdge();
    this.SYM.DATA = dest;
    this.SYM.SYM = this;
    this.LNEXT = this.SYM;
    this.SYM.LNEXT = this;
  }
  cleave(e) {
    const newONEXT = e.ONEXT;
    const currONEXT = this.ONEXT;
    this.ONEXT = newONEXT;
    e.ONEXT = currONEXT;
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
