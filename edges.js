class Edges {
  constructor() {
    // this.e = e;
    this.e = [];
  }
  add(edge) {
    this.e.splice(this.e.length, 0, edge);
    console.log(this.e);
  }
  sym() {
    const sym = new MakeEdge(this.e.data[1], this.e.data[0]);
    return sym;
  }
}

class MakeEdge {
  constructor(org, dest) {
    this.org = org;
    this.dest = dest;
    this.ONEXT = null;
    this.DNEXT = null;
    this.LNEXT = null;
    this.RNEXT = null;
  }

  data() {
    const data = [org, dest];
    return data;
  }
  // sym() {
  //   const sym = [dest, org];
  //   return sym;
  // }
  ccw(v1, v2, v3) {
    let ccw = false;
    let a = p5.Vector.sub(v2,v1);
    let b = p5.Vector.sub(v3,v2);
    const det = a.x * b.y - a.y * b.x;
    if (det < 0) {
      ccw = true;
    }
    return ccw;
  }
  cleave(lnext) {
    let dir = this.dest.x == lnext.org.x && this.dest.y == lnext.org.x;
    if (!this.LNEXT) {
      this.LNEXT = lnext;
      lnext.ONEXT = this;
    } else {
      console.log(this.ccw(this.org, this.dest, lnext.dest));
      //console.log(lnext.dest);
      if (this.ccw(this.org, this.dest, lnext.dest)) {
        const temp = this.LNEXT;
        this.DNEXT = temp;
        this.LNEXT = lnext;
        lnext.ONEXT = this;
        lnext.RNEXT = this.DNEXT;
        lnext.cleave(this.DNEXT);
      } else if (!this.DNEXT){
        this.DNEXT = lnext;
        lnext.LNEXT = this;
      } else if (!this.ccw(this.DNEXT.org, this.DNEXT.dest, lnext.dest)) {
        this.DNEXT = lnext;
        lnext.LNEXT = this;
      }
      console.log("But boss... we already got one");
    }
  }
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
