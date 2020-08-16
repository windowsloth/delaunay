class Edges {
  constructor() {
    // this.e = e;
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
    console.log("let's delete some crap");
    if (this.S.indexOf(e) == -1) {
      // stroke(255,0,0);
  	  // line(e.DATA[0], e.DATA[1], e.SYM().DATA[0], e.SYM().DATA[1]);
      console.log(this.S.indexOf(e.SYM()));
      this.S.splice(this.S.indexOf(e.SYM()), 1);
    } else {
      // stroke(255,0,0);
  	  // line(e.DATA[0], e.DATA[1], e.SYM().DATA[0], e.SYM().DATA[1]);
      console.log(this.S.indexOf(e));
      this.S.splice(this.S.indexOf(e), 1);
    }
    // for (let i = 0; i < this.S.length; i++) {
    //   if (e == this.S[i]) {
    //   	console.log("I'm deleting this one");
    //   	console.log(e);
    //     console.log(this.S[i]);
	  //     stroke(255,0,0);
	  //     //line(e.DATA[0], e.DATA[1], e.SYM().DATA[0], e.SYM().DATA[1]);
    //     this.S.splice(i, 1);
    //   }
    // }
  }
  swap(e) {
    //May or may not work?
    let a = e.OPREV();
    let b = e.SYM.OPREV();
    e.cleave(a);
    e.SYM().cleave(b);
    e.cleave(a.LNEXT());
    e.SYM().cleave(b.LNEXT());
    e.DATA = a.SYM().DATA;
    e.SYM().DATA = b.DATA;
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
    this.DATA = null;
    this.NEXT = null;
    this.r = [this, null, null, null];
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
    this.r[3] = rotsym;//rot;
    sym.r[1] = rotsym;
    sym.r[3] = rot;//rotsym;

    rot.r[2] = rotsym;
    rotsym.r[2] = rot;
    rot.NEXT = rotsym;
    rotsym.NEXT = rot;
    rot.r[1] = sym;
    rot.r[3] = this;
    rotsym.r[1] = this;
    rotsym.r[3] = sym;

    // const rot = new MakeEdge();
    // const rotsym = new MakeEdge();
    // this.r[1] = rot;
    // this.r[3] = rotsym;
    // sym.r[1] = rotsym;
    // sym.r[3] = rot;
    //
    // rot.r[2] = rotsym;
    // rotsym.r[2] = rot;
    // rot.NEXT = rot;
    // rotsym.NEXT = rotsym;
    // rot.r[1] = sym;
    // rot.r[3] = this;
    // rotsym.r[1] = this;
    // rotsym.r[3] = sym;
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
    //return this.ROT(3);
    //return this.ROT().SYM();
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
  cleave(e) {
    const newONEXT = e.ONEXT();
    const currONEXT = this.ONEXT();
    this.NEXT = newONEXT;
    e.NEXT = currONEXT;

    const alphaONEXT = e.ONEXT().ROT().ONEXT();
    const betaONEXT = this.ONEXT().ROT().ONEXT();
    this.ONEXT().ROT().NEXT = alphaONEXT;
    e.ONEXT().ROT().NEXT = betaONEXT;
  }
}
