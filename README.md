# delaunay

## Overview

This is me trying my hand at implimenting a divide-and-conquer algorithm for creating delaunay triangulations from a set of points. The algorithm in question is the one described in Guibas and Stolfi's 1985 paper *PRIMITIVES FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI DIAGRAMS.*

It is written in JavaScript, but with the intention of being used with p5.js. I tried to make it relatively easy to use outside of that framework by not using any p5 methods, so there are no p5 Vectors to be found&mdash;all coordinates are stored as arrays. To visualize a triangulation with p5, create a sketch that looks something like the following:

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

## The Algorithm

What follows is a brief explanation of the algorithm as far as I understand it. The paper itslef offers extensive proofs and much more detailed explanations, so if you're curious I strongly recommend reading it. Unfortunately, my institutional knowledge of math of any kind, let alone computational geometry, ends with whatever basic calculus I learned in my senior year of high school, so a fair amount of whats goingon in the proofs goes over my head. That being said, I think I was able to understand how it works even if I don't fully grasp the why.

The code itself also contains relatively extensive comments, more for my own reference than anyone else's. I know I'll come back to this in a few months having forgotten everything I learned, so I tried to make retracing my steps as straightforward as possible.

### 1. The Quad-Edge Data Structure

The core concept that the algorithm relies upon, and the actual meat of the paper, is the quad-edge data structure. It is laid out in a pretty verbose and relatively obtuse way befitting an academic paper, but I think it's actually more straightforward than it might seem at first blush.

Let's think about an edge. When we talk about edges we're typically talking about the side of a shape/polygon, in other words, a line connecting two points. Here, we're thinking of edges as subdivisions of a surface.

