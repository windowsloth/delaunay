# delaunay

## Overview

This is me trying my hand at implimenting a divide-and-conquer algorithm for creating Delaunay triangulations from a set of points. The algorithm in question is the one described in Guibas and Stolfi's 1985 paper *PRIMITIVES FOR THE MANIPULATION OF GENERAL SUBDIVISIONS AND THE COMPUTATION OF VORONOI DIAGRAMS.*

It is written in JavaScript, but with the intention of being used with p5.js. I tried to make it relatively easy to use outside of that framework by not using any p5 methods, so there are no p5 Vectors to be found&mdash;all coordinates are stored as arrays. To visualize a triangulation with p5, create a sketch that looks something like the following:

```javascript
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

### i. The Quad-Edge Data Structure

The core concept that the algorithm relies upon, and the actual meat of the paper, is the quad-edge data structure. It is laid out in a pretty verbose and relatively obtuse way befitting an academic paper, but I think it's actually more straightforward than it might seem at first blush.

Let's think about an edge. When we talk about edges we're typically talking about the side of a shape/polygon, in other words, a line connecting two points. Here, we're thinking of edges as subdivisions of a surface.

![A simple edge on a surface](../media/edge.png)

Now, if we had a few edges joined together to form a polygon, we can see how those edges divide the surface to form the face of our polygon.

![We think of 2D shapes like this triangle as having 1 face](../media/polygon.png)

However, we let's focus on that one lone edge. If we imagine that surface it's sitting on as a sphere, rather than a flat plane, we can see how although it is sitting on the surface, it isn't dividing that surface into a left face and a right face, or into the face of a polygon. Instead, it's an edge surrounded by one continuous face.

![A sphere has one face, and this edge doesn't subdivide that face on its own](../media/sphere.png)

Let's think about how to describe our edge. What information do we need/want to know about it? Well for starters, this particular edge has a start point and an end point. It is important to note that in this case, those start and end points are different! We could also have an edge where the start and end points are the same, in which case we can think of it as a loop. Notice that in this case, we do actually subdivide the plane into two faces&mdash;the area within the loop, and the area outside of it. This will be important later.

![See how the looped edge divides the sphere into two faces; one within the loop, the other without](../media/loop.png)

Back to our edge with the distinct start and end points. What if we change our perspective? We could also imagine this edge as going in the opposite direction, from the end point to the start point. In Guibas and Stolfi's paper, this edge that goes from end to start is referred to as ``` e.Sym ``` , where ``` e ``` is the edge going from the start to end. In my code for the algorithm, I have used the name ``` opposite ``` instead, since I personally found it to be more legible. I will mention other similar naming changes I made here and there as we continue, but for the purposes of this explanation I will be using Guibas and Stolfi's naming conventions, and will go into more detail regarding the names I used once we start going through the algorithm itself.

![What was once a lonely edge can now be thought of as two edges: the original edge, and it's opposite](../media/esym.png)

An analogy used in the paper is to think of ourselves as a bug sitting on a twig. The twig is our edge, and on one end it connects to a larger series of branches, while on the other it splits off into smaller twigs and leaves. If we turn our little bug body around, we're still looking at the same twig with the same connections to various leaves and branches and other twigs. It's just that our *orientation* has changed,  and we now have a different frame of reference when it comes to how all those leaves and branches are connected to our twig.

Guibas and Stolfi introduce another way of looking at our edge via this analogy, where we (as the bug) don't change our orientation, but instead crawl around to the underside of the twig. We're facing the same way, but our frame of reference has gain changed via this *flip.* We can, however, move on from this concept since we don't actually need to worry about flip for this application.

![If you were a bug, what kind of bug would you be?](../media/bug.png)

>We can picture the orientation and direction of an edge ``` e ``` as a small bug sitting on the surface over the midpoint of the edge and facing along it. Then the operation ``` e.Sym ``` corresponds to the bug making a half turn on the same spot, and ``` e.Flip ``` corresponds to the bug hanging upside down from the other side of the surface, but still at the same point of the edge and facing the same way. (Guibas & Stolfi, 1985)

Returning to the idea of faces, our edge does have a face on either side of it. As we went through, it might be only one face on both sides, but there is a face we can reference regardless. Now, we're currently drawing a diagram by drawing lines that represent connections between points. But we could instead draw the *dual* of this diagram by drawing lines that represent the connections between faces.
This is where that idea of a loop comes in. Since our edge has only one face on either side, the dual of our edge can be represented as another looped edge.

![This idea gets a little bit abstract, but maybe this picture helps](../erot.png)

Since this dual edge connects the faces on either side of ``` e ```, we can think of it as being a 90 degree, counter-clockwise rotation around ``` e ``` to go from the face on the right to the one on the left (Note that by default, we will be going in a counter-clockwise direction when thinking about these edges). Guibas and Stolfi refer to this dual as ``` e.Rot ```. If we take ``` e.Rot ``` and go anther 90 degrees, we wind up with ``` e.Sym ```. We can rotate again, and now we're going from the left face to the right face. We can call this ``` e.Rot-1 ``` (I used ``` invrot ``` for "inverse rot"). Finally one more rotation brings us right back to ``` e ```.

![Here we have our e and e.Sym, along with e.Rot and the inverse of e.Rot](../invrot.png)

These 4 edges/concepts that make up ``` e ``` are what make up the quad part of the quad edge structure.

### ii. Navigating Via Edges

Now it's time to start think about the way our edge could be related to any other edges that might be part of the diagram. Well, to get to another edge we need a reference point to travel around. One reference point we could use is the start (or *origin*) point of edge ``` e ```, or ``` e.Org ```. If we travel counter-clockwise around ``` e.Org ```, we can refer to the next edge we encounter that shares that origin as ``` e.Onext ```. Alternatively we could travel counter clockwise around the face on the left-hand side of ``` e ```. This would take us to ``` e.Lnext ```.

![The next edge as we rotate counter clockwise around the origin of e is called Onext. Going counter-clockwise around the left face gives us Lnext](../onextlnext.png)

However, we can still take these little walks around the origin or around the left face with our lone edge, it's just that if ``` e ``` has no connections, ``` e.Onext == e ``` and ``` e.Lnext == e.Sym ```. Notice how we can re-orient ourselves using these navigation keywords, instead of just reversing our orientation! The fact that context affects the results we get in this way will be extremely important as we continue.

![If we travel in circles around the same edge, we can encounter it in different orientations](../lonenext.png)

We could also travel in the other direction, though! What if we don't want the next edge around the origin, and instead we go clockwise to find the previous edge? Well, that would be represented by ``` e.Oprev ```. We also have ``` e.Lprev ``` by going clockwise around the left face. We can also get ``` e.Dnext ``` and ```e.DPrev ``` or even ``` e.Rprev ``` and ``` e.Rnext ``` by circling the end point (or *destination*; ``` e.Dest ```) or the right face, respectively.

![These things go both ways. As above, so below.](../oprevlprev.png)

If ``` e ``` is part of a diagram with other edges, we can start to define its relationship to said other edges using only a few pieces of information: our *origin*, the *dual*, and the *next* edge. With just those three things, we can determine where all those other navigation keywords will lead us. For this to work, *next* refers to ``` e.Onext ```. Let's start by trying to figure out what ``` e.Oprev ``` would be. We want to go counter clockwise around our origin, but we could also re-orient ourselves a few times and think about our edge a from a few different angles. Remember, ``` e.Rot ``` is an edge too, so it also has a *dual*, and it also has a *next* edge, which also a *dual*, and so on. In fact, if we look at ``` e.Rot.Onext.Rot ```, we can see that it gives us ``` e.Oprev ```. It's also worth noting that for a lone edge, ``` e.Oprev == e == e.Onext ```.

![See how we can use Rot and Next to get from one edge to another?](../navigating.png)

Rather than breaking each different navigation keyword down, here is how all the ones we will be using simplify down. See if you can visualize of how each of them works based one what we've discussed so far.

* ``` e.Oprev == e.Rot.Onext.Rot ```
* ``` e.Lnext == e.Rot-1.Onext.Rot ```
* ``` e.Rprev == e.Sym.Onext ```

Also note that for a lone edge:

* ``` e.Oprev == e.Onext == e ```
* ``` e.Lnext == e.Rnext == e.Sym ```

We still have to get our *destination*, and to do that we just have to remember that ``` e.Sym.Org == e.Dest ```, since ``` e.Sym ``` is just ``` e ``` with the start and end points switched. There is, however, one last wrinkle. If our edge is a loop, then some of these rules are a bit different:

* ``` e.Oprev == e.Onext == e.Sym ```
* ``` e.Lnext == e.Rnext == e ```

Now that we've taken a quick look at the fact that we can do a fair amount with just those three core pieces of information about an edge, I can start getting into how I went about implementing it.

### iii. Defining an Edge

>Each part ``` e[r] ``` of an edge record contains two fields, ``` Data ``` and ``` Next ```. The ``` Data ``` field is used to hold geometrical and other nontopological information about the edge... (Guibas & Stolfi, 1985)

>The ``` Next ``` field of ``` e[r] ``` contains a reference to the edge ``` e.Rot[r].Onext ```.  (Guibas & Stolfi, 1985)

>The first operator is denoted by ``` e&#8592;MakeEdge[] ```. It takes no parameters, and returns an edge ``` e ``` of a newly created data structure representing a subdivision of the sphere. (Guibas & Stolfi, 1985)

I started by creating a ``` MakeEdge ``` class with a few variables in the constructor:

```javascript
class MakeEdge {
  constructor () {
    this.DATA = null;
    this.NEXT = null;
    this.r = [this, null, null, null];
  }
}
```

We will use ``` this.DATA ``` to contain the coordinates of that represent ``` e.Org ```, and we will use ``` this.NEXT ``` to store ``` e.Onext ```. Each element of the array ``` this.r ``` contains a reference to one of the four possible positions we can get to using ``` Rot ```. ``` r[0] ``` is assigned to ``` e ```, and the other three elements will get filled in once we define some more information about this edge.

For starters, lets make method to encapsulate some of those basic definitions we'll need to do, starting with giving ``` e ``` an origin and a destination, or for our purposes ``` start ``` and ``` end ```:

```javascript
setup(start, end) {
  this.DATA = start;
  sym = new MakeEdge();
  sym.DATA = end;
}
```

See how we create a new ``` MakeEdge ``` object to represent ``` e.Sym ```. Now let's link them together so we can travel from one to the other using ``` Onext ``` and ``` Rot ```, since this is a lone edge (at least as far as we're concerned at this point).

```javascript
setup(start, end) {
  this.DATA = start;
  sym = new MakeEdge();
  sym.DATA = end;

  this.r[2] = sym;
  sym.r[2] = this;
  this.NEXT = sym;
  sym.NEXDT = this;
}
```

Again, each element of ``` r ``` is a different number of times to do ``` Rot ```, and as discussed earlier, ``` e.Rot.Rot ``` gives us ``` e.Sym ```. Let's go and fill in those last two slots of ``` r ``` with our dual. Remember that the dual is a loop! That means we need to establish things a bit differently:

```javascript
setup(start, end) {
  this.DATA = start;
  sym = new MakeEdge();
  sym.DATA = end;
  this.r[2] = sym;
  sym.r[2] = this;
  this.NEXT = sym;
  sym.NEXDT = this;


}
```
