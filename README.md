# delaunay

## Overview

This is me trying my hand at implimenting a divide-and-conquer algorithm for creating delaunay triangulations from a set of points. The algorithm in question is the one described in Guibas and Stolfi's 1985 paper *PRIMITIVES FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI DIAGRAMS.*

It is written in JavaScript, but with the intention of being used with p5.js. I tried to make it relatively easy to use outside of that framework by not using any p5 Vector objects. To create a triangulation with p5, create a sketch that looks something like the following:

```
const complexity = 24;
const edges = new Edges();
const set = [];

function setup() {
  noLoop();
  createCanvas(500, 500);
  background(255);
  stroke(0);

  for (let i = 0; i < complexity; i ++) {
    const x = random(width);
    const y = random(height);
    set[i] = [x, y];
  }
  quicksort(set, 0, complexity - 1, true);
  delaunay(set);
  edges.show();
}

function draw() {
}
```

Note that the only things that need to be done in the sketch itself are to set up an array of points ``` set ``` with a size determined by ``` complexity ```, and to create a new Edges object, which will wind up storing all of the edges calculated by the triangulation algorithm.
