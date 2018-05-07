import { Pt, PtLike, Group, GroupLike } from "./Pt";
import { Bound } from "./Bound";
/**
 * A `World` stores and manages `Body` and `Particle` for 2D physics simulation
 */
export declare class World {
    private _lastTime;
    protected _gravity: Pt;
    protected _friction: number;
    protected _damping: number;
    protected _bound: Bound;
    protected _particles: Particle[];
    protected _bodies: Body[];
    protected _names: {
        p: {};
        b: {};
    };
    protected _drawParticles: (p: Particle, i: number) => void;
    protected _drawBodies: (p: Body, i: number) => void;
    /**
     * Create a `World` for 2D physics simulation
     * @param bound a rectangular bounding box defined by a Group
     * @param friction a value between 0 to 1 where 1 means no friction. Default is 1
     * @param gravity a number of a Pt to define gravitational force. Using a number is a shorthand to set `new Pt(0, n)`. Default is 0.
     */
    constructor(bound: Group, friction?: number, gravity?: PtLike | number);
    gravity: Pt;
    friction: number;
    damping: number;
    /**
     * Get the number of bodies
     */
    readonly bodyCount: number;
    /**
     * Get the number of particles
     */
    readonly particleCount: number;
    /**
     * Get a body in this world by index or string id
     * @param id numeric index of the body, or a string id that associates with it.
     */
    body(id: number | string): Body;
    /**
     * Get a particle in this world by index or string id
     * @param id numeric index of the particle, or a string id that associates with it.
     */
    particle(id: number): Particle;
    /**
     * Update this world one time step
     * @param ms change in time in milliseconds
     */
    update(ms: number): void;
    /**
     * Draw particles using the provided function
     * @param fn a function that draws particles passed in the parameters `(particles, index)`.
     */
    drawParticles(fn: (p: Particle, i: number) => void): void;
    /**
     * Draw bodies using the provided function
     * @param fn a function that draws bodies passed in the parameters `(bodies, index)`.
     */
    drawBodies(fn: (p: Body, i: number) => void): void;
    /**
     * Add a particle or body to this world.
     * @param p `Particle` or `Body` instance
     * @param name optional name, which can be referenced in `body()` or `particle()` function to retrieve this back.
     */
    add(p: Particle | Body, name?: string): this;
    /**
     * Remove either body or particle from this world. Support removing a range and negative index.
     * @param which Either "body" or "particle"
     * @param index Start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
     * @param count Number of items to remove. Default is 1.
     */
    remove(which: "body" | "particle", index: number, count?: number): this;
    /**
     * Static function to calculate edge constraints between 2 particles.
     * @param p1 particle 1
     * @param p2 particle 1
     * @param dist distance between particles
     * @param stiff stiffness between 0 to 1.
     * @param precise use precise distance calculation. Default is `false`.
     */
    static edgeConstraint(p1: Particle, p2: Particle, dist: number, stiff?: number, precise?: boolean): Particle;
    /**
     * Static function to calculate bounding box constraints.
     * @param p particle
     * @param rect bounding box defined by a Group
     * @param damping damping between 0 to 1, where 1 means no damping. Default is 0.75.
     */
    static boundConstraint(p: Particle, rect: Group, damping?: number): void;
    /**
     * Internal integrate function
     * @param p particle
     * @param dt time changed
     * @param prevDt previous change in time, optional
     */
    protected integrate(p: Particle, dt: number, prevDt?: number): Particle;
    /**
     * Internal function to update particles
     */
    protected _updateParticles(dt: number): void;
    /**
     * Internal function to update bodies
     */
    protected _updateBodies(dt: number): void;
}
/**
 * Particle is a Pt that has radius and mass. It's usually added into `World` to create physics simulations.
 */
export declare class Particle extends Pt {
    protected _mass: number;
    protected _radius: number;
    protected _force: Pt;
    protected _prev: Pt;
    protected _body: Body;
    protected _lock: boolean;
    protected _lockPt: Pt;
    /**
     * Create a particle
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    constructor(...args: any[]);
    mass: number;
    radius: number;
    /**
     * Get previous position
     */
    previous: Pt;
    /**
     * Get current accumulated force
     */
    force: Pt;
    /**
     * Get the body of this particle, if any.
     */
    body: Body;
    /**
     *
     */
    lock: boolean;
    /**
     * Get the change in position since last time step
     */
    readonly changed: Pt;
    /**
     * Set a new position, and update previous and lock states if needed.
     */
    position: Pt;
    /**
     * Set the size of this particle. This sets both the radius and the mass.
     * @param r `radius` value, and also set `mass` to the same value.
     */
    size(r: number): this;
    /**
     * Add to the accumulated force
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    addForce(...args: any[]): Pt;
    /**
     * Verlet integration
     * @param dt change in time
     * @param friction friction from 0 to 1, where 1 means no friction
     * @param lastDt optional last change in time
     */
    verlet(dt: number, friction: number, lastDt?: number): this;
    /**
     * Hit this particle with an impulse
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     * @example `hit(10, 20)`, `hit( new Pt(5, 9) )`
     */
    hit(...args: any[]): this;
    /**
     * Check and respoond to collisions between two particles
     * @param p2 another particle
     * @param damp damping value between 0 to 1, where 1 means no damping.
     */
    collide(p2: Particle, damp?: number): void;
    toString(): string;
}
/**
 * Body consists of a group of `Particles` and edge constraints. It is usually added into a `World` to create physics simulations
 */
export declare class Body extends Group {
    protected _cs: Array<number[]>;
    protected _stiff: number;
    protected _locks: {
        [index: string]: Particle;
    };
    protected _mass: number;
    /**
     * Create an empty Body, this is usually followed by `init` to populate the Body. Alternatively, use static function `fromGroup` to create and initate a body directly.
     */
    constructor();
    /**
     * Create and populate a body with a group of Pts.
     * @param list a group of Pts
     * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
     * @param autoLink Automatically create links between the Pts. This usually works for regular convex polygons. Default is true.
     * @param autoMass Automatically calculate the mass based on the area of the polygon. Default is true.
     */
    static fromGroup(list: GroupLike, stiff?: number, autoLink?: boolean, autoMass?: boolean): Body;
    /**
     * Initiate a body
     * @param list a group of Pts
     * @param stiff stiffness value from 0 to 1, where 1 is the most stiff. Default is 1.
     */
    init(list: GroupLike, stiff?: number): this;
    /**
     * Get mass of this body.
     */
    mass: number;
    /**
     * Automatically calculate `mass` to body's polygon area.
     */
    autoMass(): this;
    /**
     * Create a linked edge between two points
     * @param index1 first point by index
     * @param index2 first point by index
     * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
     */
    link(index1: number, index2: number, stiff?: number): this;
    /**
     * Automatically create links for all the points to preserve the initial body shape. This usually works for regular convex polygon.
     * @param stiff optionally stiffness value between 0 to 1, where 1 is the most stiff.
     */
    linkAll(stiff: number): void;
    /**
     * Return a list of all the linked edges as line segments.
     * @returns an array of Groups, each of which represents an edge
     */
    linksToLines(): Group[];
    /**
     * Recalculate all edge constraints
     */
    processEdges(): void;
    /**
     * Check and respond to collisions between two bodies
     * @param b another body
     */
    processBody(b: Body): void;
    /**
     * Check and respond to collisions between this body and a particle
     * @param b a particle
     */
    processParticle(b: Particle): void;
}
