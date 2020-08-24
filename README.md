# delaunay

[Click here for a very simple interactive demo](/index.html);

## Overview

This is me trying my hand at implimenting a divide-and-conquer algorithm for creating Delaunay triangulations from a set of points. The algorithm in question is the one described in Guibas and Stolfi's 1985 paper *PRIMITIVES FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI DIAGRAMS.* It works quite well: with an entirely new set of points being generated every frame, I was able to still get 60fps until I increased the number of points to 200, where things start to slow down (However, with 500 points I was getting around 30fps).

It is written in JavaScript, but with the intention of being used with p5.js. I tried to make it relatively easy to use outside of that framework by not using any p5 methods, so there are no p5 Vectors to be found&mdash;all coordinates are stored as arrays. To visualize a triangulation with p5, create a sketch that looks something like the following:

```javascript
const complexity = 24;
const set = [];
const edges = [];

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
  for (let edge of edges) {
    strokeWeight(1);
    stroke(0);
    line(edge.start[0], edge.start[1], edge.end[0], edge.end[1]);
  }
}

function draw() {
}
```

Note that the only things that need to be done in the sketch itself are to set up an array of points ``` set ``` with a size determined by ``` complexity ```, and to set up an array to store all of the edges calculated by the triangulation algorithm. By default, the algorithm asssumes this array will be called ``` edges ```, but this can be modified by changing the array that is passed to some of the MakeEdge methods within the algorithm. My best attempt at explaining the algorithm and the data structure it is based on, along with a lengthy explanation of my thought process when it came to implementing it can be found [here.](/explanation.md)
