## The Algorithm

What follows is a brief explanation of the algorithm as far as I understand it. The paper itself offers extensive proofs and much more detailed explanations, so if you're curious I strongly recommend reading it. Unfortunately, my institutional knowledge of math of any kind, let alone computational geometry, ends with whatever basic calculus I learned by the end of high school, so a fair amount of what's going on in the proofs goes over my head. That being said, I think I was able to understand how it works even if I don't fully grasp the why.

The code itself also contains relatively extensive comments, more for my own reference than anyone else's. I know I'll come back to this in a few months having forgotten everything I learned, so I tried to make retracing my steps as straightforward as possible. This explanation here is relatively long and is broken up into a few sections.

* [i. The Quad-Edge Data Structure](#i-the-quad-edge-data-structure)
* [ii. Navigating Via Edges](#ii-navigating-via-edges)
* [iii. Defining an Edge](#iii-defining-an-edge)
* [iv. The Divide-and-Conquer Algorithm](#iv-the-divide-and-conquer-algorithm)

The first section is a look at the data structure we'll be using in the algorithm and how it is explained in the Guibas and Stolfi paper. Tje second section examines the relationships between edges within the quad-edge structure. The third section focuses on actually coding that data structure, and the fourth section goes step-by-step through the algorithm and breaks down how I pieced the code together.

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

![This idea gets a little bit abstract, but maybe this picture helps](../media/erot.png)

Since this dual edge connects the faces on either side of ``` e ```, we can think of it as being a 90 degree, counter-clockwise rotation around ``` e ``` to go from the face on the right to the one on the left (Note that by default, we will be going in a counter-clockwise direction when thinking about these edges). Guibas and Stolfi refer to this dual as ``` e.Rot ```. If we take ``` e.Rot ``` and go anther 90 degrees, we wind up with ``` e.Sym ```. We can rotate again, and now we're going from the left face to the right face. We can call this ``` e.Rot-1 ``` (I used ``` invrot ``` for "inverse rot"). Finally one more rotation brings us right back to ``` e ```.

![Here we have our e and e.Sym, along with e.Rot and the inverse of e.Rot](../media/invrot.png)

These 4 edges/concepts that make up ``` e ``` are what make up the quad part of the quad edge structure.

### ii. Navigating Via Edges

Now it's time to start think about the way our edge could be related to any other edges that might be part of the diagram. Well, to get to another edge we need a reference point to travel around. One reference point we could use is the start (or *origin*) point of edge ``` e ```, or ``` e.Org ```. If we travel counter-clockwise around ``` e.Org ```, we can refer to the next edge we encounter that shares that origin as ``` e.Onext ```. Alternatively we could travel counter clockwise around the face on the left-hand side of ``` e ```. This would take us to ``` e.Lnext ```.

![The next edge as we rotate counter clockwise around the origin of e is called Onext. Going counter-clockwise around the left face gives us Lnext](../media/onextlnext.png)

However, we can still take these little walks around the origin or around the left face with our lone edge, it's just that if ``` e ``` has no connections, ``` e.Onext == e ``` and ``` e.Lnext == e.Sym ```. Notice how we can re-orient ourselves using these navigation keywords, instead of just reversing our orientation! The fact that context affects the results we get in this way will be extremely important as we continue.

![If we travel in circles around the same edge, we can encounter it in different orientations](../media/lonenext.png)

We could also travel in the other direction, though! What if we don't want the next edge around the origin, and instead we go clockwise to find the previous edge? Well, that would be represented by ``` e.Oprev ```. We also have ``` e.Lprev ``` by going clockwise around the left face. We can also get ``` e.Dnext ``` and ```e.DPrev ``` or even ``` e.Rprev ``` and ``` e.Rnext ``` by circling the end point (or *destination*; ``` e.Dest ```) or the right face, respectively.

![These things go both ways. As above, so below.](../media/oprevrprev.png)

If ``` e ``` is part of a diagram with other edges, we can start to define its relationship to said other edges using only a few pieces of information: our *origin*, the *dual*, and the *next* edge. With just those three things, we can determine where all those other navigation keywords will lead us. For this to work, *next* refers to ``` e.Onext ```. Let's start by trying to figure out what ``` e.Oprev ``` would be. We want to go counter clockwise around our origin, but we could also re-orient ourselves a few times and think about our edge a from a few different angles. Remember, ``` e.Rot ``` is an edge too, so it also has a *dual*, and it also has a *next* edge, which also a *dual*, and so on. In fact, if we look at ``` e.Rot.Onext.Rot ```, we can see that it gives us ``` e.Oprev ```. It's also worth noting that for a lone edge, ``` e.Oprev == e == e.Onext ```.

![See how we can use Rot and Next to get from one edge to another?](../media/navigation.png)

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

The edges of our triangulation will exist as instances of the ``` MakeEdge ``` class. Here, I'll briefly go over this class and the methods we'll be using before finally diving into the actual algorithm. The constructor for ``` MakeEdge ``` looks like this:

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

For starters, lets make method to encapsulate some of those basic definitions we'll need to do, starting with giving ``` e ``` an origin and a destination, or for our purposes ``` start ``` and ``` end ```. This method will accept two pieces of information (for our purposes, coordinates representing two points from our set) for ``` start ``` and ``` end ```, as well as an array to store our edge in. The way the algorithm is set up in [triangulation.js](/triangulation.js), it assumes there is an array is called ``` edges ```, just as a default.

```javascript
setup(start, end, arr) {
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

Again, each element of ``` r ``` is a different number of times to do ``` Rot ```, and as discussed earlier, ``` e.rot.rot ``` gives us ``` e.Sym ```. Let's go and fill in those last two slots of ``` r ``` with our dual. Remember that the dual is a loop! That means we need to establish things a bit differently:

```javascript
setup(start, end) {
  this.DATA = start;
  sym = new MakeEdge();
  sym.DATA = end;
  this.r[2] = sym;
  sym.r[2] = this;
  this.NEXT = sym;
  sym.NEXDT = this;

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
```

And finally, we will need to add this edge into our ``` edges ``` array, so we'll include this last line:

```javascript
arr.push(this);
```

Before getting to the other methods that we'll need to use, let's briefly cover the different getters that we'll use to get all of our navigation references. The naming is all pretty self explanatory, they're the same keywords discussed previously, but the way we find some of them might not be totally obvious. The proofs for how/why all of them work the way they do can be found in the text of the paper, but with the other information I've gone over here you can sort of work your way through how everything fits together visually too.

```javascript
get rot() {
  return this.r[1];
}
get opposite() {
  return this.r[2];
}
get invrot() {
  return this.r[3];
}
get start() {
  return this.DATA;
}
get end() {
  return this.opposite.DATA;
}
get lnext() {
   return this.invrot.onext.rot;
}
get oprev() {
  return this.rot.NEXT.rot;
}
get onext() {
  return this.NEXT;
}
get rprev() {
  return this.opposite.onext;
}
```

The only real difference here is that for rest of the program, I am using ``` opposite ``` rather than ``` sym ```. I think it's more intuitive and makes some of the more complicated operations/relationships more legible. I also recognize that using ``` sym ``` as a variable name in ``` setup() ``` is a potentially problematic inconsistency, but it doesn't bother me enough to change it (at least not at the time of writing).

The other methods we'll be using will all be operating on existing edges; joining them together, creating new edges to connect existing ones, or deleting existing ones that are not part of the final triangulation. The first of these methods is ``` cleave() ```. In the original paper, it is referred to as ``` splice ```, but because ``` splice() ``` is an existing array method that is also being used in the context of our edges, I decided to go with ``` cleave ```.

>Indeed, ``` Splice ``` is its own inverse: if we perform ``` Splice[a, b] ``` twice in a row we will get back the same subdivision.

This method operates on an edge, and accepts another edge as a parameter. All it does is swap the ``` Onext ``` values for both the two edges and their ``` .rot ``` s. If edges ``` a ``` and ``` b ``` were both created seperately, but share a start point, ``` a.cleave(b); ``` will link them together so that instead of ``` a.onext ``` referring back to ``` a ```, it will now point to ``` b ```, and vice versa. This also works if there are already two edges sharing an origin and we are adding a third edge to the party, by trading ``` NEXT ``` values we can build a "chain" of edges all centered around one starting point.

However, if those edges were already part of a chain&mdash;if they were already cleaved together&mdash;then swapping ``` NEXT ``` values will remove the edge we are operating on from the chain. By breaking that link, we remove the ties that edge has to the other edges around it. Since the word cleave means both to join tightly and to split apart, I thought it was a fitting name for a function that is, as the paper says, its own invervse.

```javascript
cleave(e) {
  const newONEXT = e.onext;
  const currONEXT = this.onext;
  this.NEXT = newONEXT;
  e.NEXT = currONEXT;

  const alphaONEXT = e.onext.rot.onext;
  const betaONEXT = this.onext.rot.onext;
  this.onext.rot.NEXT = alphaONEXT;
  e.onext.rot.NEXT = betaONEXT;
}
```

The variables ``` alphaONEXT ``` and ``` betaONEXT ``` are placeholder's that simply refer to the ``` .rot ``` values of the two edges being operated on.

The next method is ``` connect() ```. It can be slightly confusing, since ``` cleave ``` is in a way connected edges together via their references, but connect takes two seperate edges and creates a new, third edge that joins the two together. It accepts an edge and an array to store the result as its parameters.

```javascript
connect(a, arr) {
  const e = new MakeEdge();
  e.setup(this.end, a.start, arr);
  e.cleave(this.lnext);
  e.opposite.cleave(a);
  return e;
}
```

To break that down: we create a new edge, ``` e ``` with a new instance of ``` MakeEdge ```, and then use ``` setup ``` to assign the start point as the end point of the edge we are actually operating on, and the endpoint as the start point of the edge that has been passed in. Then, we cleave the new edge two the original edges so that they all link up properly, and return the result. Now we have a brand new edge that is linked to the edges it connects to!

But what if we no longer need an edge? What if a new edge we've added makes an old edge invalid for the final triangulation? Well, that's what the final method, ``` destroy() ``` is for. In the original paper it is called ``` deleteEdge ```. There is no concrete reason for changing it, it just sounds cooler this way. ``` destroy() ``` accepts an array as its only parameter.

```javascript
destroy(arr) {
  this.cleave(this.oprev);
  this.opposite.cleave(this.opposite.oprev);
  if (arr.indexOf(this) == -1) {
    arr.splice(arr.indexOf(this.opposite), 1);
  } else {
    arr.splice(arr.indexOf(this), 1);
  }
}
```

As you can probably tell, it functions quite similarly to connect, making use of ``` cleave() ``` to modify links between edges. However, because of the dual nature of ``` cleave ```, this time we are removing an edge from an existing group. Once that is done, we also need to remove it from the array that is storing all the edges, so we search for both the edge and remove it. Note that we did not need to add the edge directly in ``` connect() ```, since that is done when ``` setup() ``` is called.

Now that we have these methods established, we can start putting everything together. It's time to move on to the algorithm itself!

### iv. The Divide-and-Conquer Algorithm

The algorithm itself is called using the function ``` delaunay() ```, which accepts an array of points. It is imporant to note that these points should be sorted by x-value in ascending order! I use a quicksort to do this after generating an array of random points, but you can set up your set of points however works best for you. This function will also ultimately return the left-most and right-most edges of the convex hull formed by the set of points.

Our first task is to determine how many points we are dealing with here and if necessary to start dividing, since this is a divide-and-conquer approach. We want to work with sets of two or three points to start with, so if our array is four points or greater, we will split it into two arrays and recursively call the function again on each half. We also ned to return those left-most and right-most edges, so let's declare those variables now as well:

```javascript
delaunay(points) {
  let leftedge;
  let rightedge;

  if (points.length == 2) {
    //...
  } else if (points.length == 3) {
    //...
  } else if (points.length >= 4) {
    const split = Math.floor(points.length / 2);
    let l = points.slice(0, split);
    let r = points.slice(split + 1, points.length);
    leftedge = delaunay(l);
    rightedge = delaunay(r);
  }
}
```

Eventually, we will get down to only groups of two or three points, at which point we can start building edges between them, and then we will start merging those smaller chunks into larger and larger shapes. If we only have two points, then we can just connect them from left to right.

```javascript
if (points.length == 2) {
  const a = new MakeEdge();
  a.setup(points[0], points[1], edges);
  leftedge = a;
  rightedge = a.opposite;
}
```

Note that since two points only forms one edge, we have to use ``` a.opposite ``` in addition to just ``` a ``` in order to return two different edges. The procedure for three points is a bit more complicated. We start out by simply connecting the points in order of x value (``` point[0] ``` to ``` point[1] ```, ``` point[1] ``` to ``` point[2] ```, ``` point[2] ``` to back to ``` point[0] ```), but then we need to make sure we return the proper ``` leftedge ``` and ``` rightedge ``` values. We do this by testing ``` point[2] ``` to see if it is on the right side or the left side of the edge formed by ``` point[0] ``` and ``` point[1] ```. In effect, this tells us if drawing the edges in order of x value arranges the sides in a counter-clockwise order around their centroid. This is important because we want to know which edges are the outside edges, and also which way those edges are oriented.

The original paper uses a specific counter clockwise test, but I had issues getting it work reliably (most likely due to my having done the math involved incorrectly), but I didn't spend too much time struggling with it because there is another way to test for the same information. We can take the cross product of the vectors formed by the ``` start ``` and ``` end ``` values of the edges in question and determine their how they are arranged based on whether or not the result is negative. This is a test we actually will wind up needing later, so let's write it as a function. The way I've written it, it accepts an edge and a point, and returns true if the point is on the right side of the edge.

```javascript
function rightof(p, e) {
  let x = [e.end[0] - e.start[0], e.end[1] - e.start[1]];
  let y = [p[0] - e.start[0], p[1] - e.start[1]];
  return x[0] * y[1] - x[1] * y[0] > 0;
}
```

Now that we have this test, let's create the edges between our three points, and then make use of the test to figure out which edges we need to return:

```javascript
else if (points.length == 3) {
  const a = new MakeEdge();
  const b = new MakeEdge();
  a.setup(points[0], points[1], edges);
  b.setup(points[1], points[2], edges);
  a.opposite.cleave(b);
  const c = b.connect(a, edges);
  if (rightof(point[2], a)) {
    leftedge = c.opposite;
    rightedge = c
  } else {
    leftedge = a;
    rightedge = b.opposite;
  }
}
```

This also takes care of the rare event where the three points are collinear, in which case we would want to return ``` a ``` and ``` b.opposite ```. This concept of making sure we return the correct edges in the correct orientation comes up a few times in this algorithm; we always want to make sure we're keeping track of the orientation of the edges we're working with because that affects how we use the edge references to navigate through the triangulation. Since the algorithm is recursive, we wind up doing a lot of these steps many times, and we need to make sure the references we are using will always be correct.

For example, now that we've figured out what to do with one two/three point groups, we can start to set up the process of merging them together. If we have two groups of points next to each other, we need to find the *inside edges,* or the sides of the shapes that are facing one another. We're also going to find the outside edges, since those will come back into play later, when we come back to ``` leftedge ``` and ``` rightedge ```.

```javascript
else if (points.length >= 4) {
  const split = Math.floor(points.length / 2);
  let l = points.slice(0, split);
  let r = points.slice(split + 1, points.length);
  const lefthalf = delaunay(l);
  const righthalf = delaunay(r);

  let leftoutside = lefthalf[0];
  let leftinside = lefthalf[1];
  let rightinside = righthalf[0];
  let rightoutside = righthalf[1];
}
```

To clarify, we've got the ``` leftedge ``` returned by the triangulation of the left half of our set of points stored in ``` leftoutside ``` and the ``` rightedge ``` of stored in ``` leftinside ```, and the same for the right half of the points. Now that we've specified which edges are on the inside and need to be connected, we need to make sure that we have them both oriented in the proper way. In this case, finding that orientation will also allow us to find the lowest point on the inside edge of both shapes.

```javascript
 while(true) {
  if (!rightof(rightinside.start, leftinside)) {
    leftinside = leftinside.lnext;
  } else if (rightof(leftinside.start, rightinside)) {
    rightinside = rightinside.rprev;
  } else {
    break;
  }
}
```

This while loop will run until both of the edges are oriented properly. It just rewrites the values of ``` leftinside ``` and ``` rightinside ``` by looping around the two shapes formed by the left and right half of the points until eventually it finds the bottom most edges. This is why we need to make sure to return the correct values for ``` leftedge ``` and ``` rightedge ```, otherwise loops like this won't work correctly. This was actually the last step I debugged before I got the program working fully for the first time, I had this loop set up incorrectly, but it would still solve the triangulation with smaller sets of points. The issues didn't present themselves until there were more edges to work with, and more places for something to get oriented wrong and throw off the whole balance.

But now that we've established our lowest point (our lowest common tangent, to use the terminology that Guibas and Stolfi use), it's almost time to start begin merging the shapes. This step will actually loop over and over until all the connecting edges between the shapes have been drawn, and it can be a little bit hard to visualize what's happening, so I'll explain it briefly here and then dive into each individual sub-step.

First, we connect the lower common tangents, and set the values of ``` leftedge ``` and ``` rightedge ``` if necessary, since occasionally this first connecting edge (which we'll call ``` base ```) qualifies as being one of those two outer edges. Then, we need to figure out where the next connection will be drawn. We know it will need to have one endpoint that belongs to either the left half or the right half, and since we're trying to draw triangles, it will need to connect to one of the endpoints of ``` base ```. The way Guibas and Stolfi explain how we determine which point from which half of the set we use is by visualizing a circle where ``` base ``` is the diameter. If we were to start making that circle larger while keeping the endpoints of ``` base ``` on its perimeter, the first point we encounter from our set will be one of the points for our new connection, and whichever side of ``` base ``` connects to the opposite half will be the other. This new edge, that goes from one side of ``` base ``` to a point on the opposite half of the shape then becomes the new ``` base ```. They refer to this as the *rising bubble,* and we can see visually how it might look below.

![This is the so-called rising bubble](../media/risingbubble.gif)

Then this step is repeated until there are no more points for the bubble to encounter (in other words, once we've reached the top edge). That's all there is to it!

Of course, coding this is a little bit more abstract than just drawing circles, but we will need to think about circles a little bit. One of the side effects of connecting our two halves means that some of the edges we drew in previous steps are not actually valid for the final triangulation. Sometimes the point we wind up finding with our rising bubble has edges attached to it that will need to be deleted. Guibas and Stolfi have a test called the ``` incircle ``` test that we will be using as one of the ways to help determine if we will need to delete any edges. Let's quickly write a function for this test.

This function receives a four points, the first three make up a triangle sorted in counter-clockwise order (another spot where making sure our orientation is correct is important!) and the fourth being the point we want to test. If that fourth point is within the circle formed by the first three points, the test will return false. If it returns true, then the fourth point is not within the circle. Mathematically, all this test entails is taking the determinant of the following matrix:

```
| x1, y1, (x1^2) + (y1^2), 1 |
| x2, y2, (x2^2) + (y2^2), 1 |
| x3, y3, (x3^2) + (y3^2), 1 |
| x4, y4, (x4^2) + (y4^2), 1 |

  | x1 - x4, y1 - y4, ((x1 - x4)^2) + ((y1 - y4)^2) |
= | x2 - x4, y2 - y4, ((x2 - x4)^2) + ((y2 - y4)^2) |
  | x3 - x4, y3 - y4, ((x3 - x4)^2) + ((y3 - y4)^2) |
```

The code I am using for this test looks like this:

```javascript
function incircle(a, b, c, d) {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  const cx = c[0];
  const cy = c[1];
  const dx = d[0];
  const dy = d[1];

  const ei = (by - dy) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fh = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cy - dy);
  const di = (bx - dx) * (Math.pow(cx - dx, 2) + Math.pow(cy - dy, 2));
  const fg = (Math.pow(bx - dx, 2) + Math.pow(by - dy, 2)) * (cx - dx);
  const dh = (bx - dx) * (cy - dy);
  const eg = (by - dy) * (cx - dx);

  const $a = (ax - dx) * (ei - fh);
  const $b = (ay - dy) * (di - fg);
  const $c = (Math.pow(ax - dx, 2) + Math.pow(ay - dy, 2)) * (dh - eg);
  return ($a - $b + $c) < 0;
}
```

This test will be one of the criteria we use to evaluate edges we can connect our ``` base ``` to, and we can use to help determine if any conflicting edges will need to be deleted. If that brief overview wasn't particularly clear, that's okay, we're going to dive in and go step by step now. We need to start by finding ``` base ```.

```javascript
let base = rightinside.opposite.connect(leftinside, edges);
if (leftinside.start == leftoutside.start) {
  leftoutside = base.opposite;
}
if (rightinside.start == rightoutside.start) {
  rightoutside = base;
}
```

Again, we just connect the two lower points that we discovered previously, and then modify our outside edge variables as needed. Note that ``` base ``` always has its ``` start ``` point on the right half of the shape, and its ``` end ``` on the left. Then, the merge loop truly begins. We'll start be checking out the left half of the shape and finding our possible connection there.

```javascript
while (true) {
  let lmaybe = base.opposite.onext;
}
```

Picking the ``` onext ``` edge from ``` base ``` gives us an edge on the inside edge of the left side of the shape. Now, just because it is the ``` next ``` edge, does not mean it is actually the edge we want! There might be another point not along the inside edge that we would encounter first with our rising bubble, or depending on how the edges are configured, the ``` next ``` edge from ``` base.opposite ``` (the next edge to share its origin) could be below ``` base ```, in which case it wouldn't work for us. We'll need to test for both of these possibilities. First, we'll come back to that ``` rightof() ``` test, and make sure that ``` lmaybe.end ``` is, in fact, to the right of ``` base ```. If it is, that means ``` lmaybe ``` is above ``` base ```. Second, we'll see if the ``` next ``` edge from ``` lmaybe ``` is within the circle formed by ``` base.end ```, ``` base.start ```, and ``` lmaybe.end ```. If it is within that circle, then it will become our new ``` lmaybe ```, and we need to delete the old ``` lmaybe ``` from the array. The image below illustrates an instance where ``` lmaybe ``` is valid, but will be removed and replaced with ``` lmaybe.onext ```.

![Here is a picture of how that might look](../media/lmaybe.png)

```javascript
while (rightof(lmaybe.end, base)
  && incircle(base.end, base.start, lmaybe.end, lmaybe.onext.end)) {
  lmaybe.destroy(edges);
  lmaybe = lmaybe.onext;
}
```

Now we can repeat those steps on the right side. We're doing exactly the same things, we simply have to use different navigation references.

```javascript
let rmaybe = base.oprev
while(rightof(rmaybe.end, base)
  && incircle(base.end, base.start, rmaybe.end, rmaybe.oprev.end)) {
  rmabye.destroy(edges);
  rmaybe = rmaybe.onext;
}
```

This is actually where we'll want to build ourselves an escape from the merge loop, since we can very easily wind up with two invalid edges for ``` lmaybe ``` and ``` rmaybe ```, in which case our merge is done.

```javascript
if (!rightof(lmaybe.end, base) && !rightof(rmaybe.end, base)) {
  break;
}
```

But of course, one or even both of our two possible edges might be valid possibilities. If they're both valid, how will we choose? Well in theory, we want to pick the edge that the rising bubble would encounter first. We can do this by using ``` incircle() ``` again; if the circle formed by (for example) ``` lmaybe ``` and ``` base ``` contains ``` rmaybe ```, then ``` rmaybe ``` would be the first edge encountered. In that case, we'd connect ``` rmaybe ``` to ``` base ```, and then have the resulting edge be the new ``` base ```.

```javascript
if (rightof(lmaybe.end, base)) {
  if (rightof(rmaybe.end, base)
    && incircle(lmaybe.end, base.end, base.start, rmaybe.end)) {
    base = rmaybe.connect(base.opposite, edges);
  } else {
    base = base.opposite.connect(lmaybe.opposite, edges);
  }
} else {
  base = rmaybe.connect(base.opposite, edges);
}
```

To quickly go over that again, if the left possibility is valid, then check if the right possibility is also valid. If so, then test if the right possibility is within the circle formed by the left possibility and ``` base ```. If it does, then connect ``` base ``` to ``` rmaybe ```. If both possibilities are valid, but the right one does not fall inside the circle, then we can connect ``` lmaybe ``` to ``` base ```. If the left possibility wasn't valid to begin with, then the right possibility must have been (otherwise we would have exited the loop already), so we can go with that.

Then all we have to do is close the loop, set ``` leftedge ``` to ``` leftoutside ``` and ``` rightedge ``` to ```rightoutside ```, and return those values! That's all there is to it. There's a fair amount going on, and it can be hard to keep track of which edge is facing what way, but the actual resulting code isn't that long or complicated. Once the data structure is set up properly, it all comes together in a pretty nicely. The paper does also propose an incremental algorithm, but I haven't yet tried to get that working. I will update this page if I decide to take that on.
