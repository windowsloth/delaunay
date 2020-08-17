# delaunay

## Overview

This is me trying my hand at implimenting a divide-and-conquer algorithm for creating Delaunay triangulations from a set of points. The algorithm in question is the one described in Guibas and Stolfi's 1985 paper *PRIMITIVES FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI DIAGRAMS.*

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

What follows is a brief explanation of the algorithm as far as I understand it. The paper itself offers extensive proofs and much more detailed explanations, so if you're curious I strongly recommend reading it. Unfortunately, my institutional knowledge of math of any kind, let alone computational geometry, ends with whatever basic calculus I learned in my senior year of high school, so a fair amount of what's going on in the proofs goes over my head. That being said, I think I was able to understand how it works even if I don't fully grasp the why.

The code itself also contains relatively extensive comments, more for my own reference than anyone else's. I know I'll come back to this in a few months having forgotten everything I learned, so I tried to make retracing my steps as straightforward as possible.

### 1. The Quad-Edge Data Structure

The core concept that the algorithm relies upon, and the actual meat of the paper, is the quad-edge data structure. It is laid out in a pretty verbose and relatively obtuse way befitting an academic paper, but I think it's actually more straightforward than it might seem at first blush.

Let's think about an edge. When we talk about edges we're typically talking about the side of a shape/polygon, in other words, a line connecting two points. Here, we're thinking of edges as subdivisions of a surface.

![A simple edge on a surface](/media/edge.png)

Now, if we had a few edges joined together to form a polygon, we can see how those edges divide the surface to form the face of our polygon.

![We think of 2D shapes like this triangle as having 1 face](/media/polygon.png)

However, we let's focus on that one lone edge. If we imagine that surface it's sitting on as a sphere, rather than a flat plane, we can see how although it is sitting on the surface, it isn't dividing that surface into a left face and a right face, or into the face of a polygon. Instead, it's an edge surrounded by one continuous face.

![A sphere has one face, and this edge doesn't subdivide that face on its own](/media/sphere.png)

Let's think about how to describe our edge. What information do we need/want to know about it? Well for starters, this particular edge has a start point and an end point. It is important to note that in this case, those start and end points are different! We could also have an edge where the start and end points are the same, in which case we can think of it as a loop. Notice that in this case, we do actually subdivide the plane into two faces&mdash;the area within the loop, and the area outside of it.
