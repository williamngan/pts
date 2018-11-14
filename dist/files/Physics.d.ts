/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group, Bound } from "./Pt";
import { PtLike, GroupLike } from "./Types";
export declare class World {
    private _lastTime;
    protected _gravity: Pt;
    protected _friction: number;
    protected _damping: number;
    protected _bound: Bound;
    protected _particles: Particle[];
    protected _bodies: Body[];
    protected _pnames: string[];
    protected _bnames: string[];
    protected _drawParticles: (p: Particle, i: number) => void;
    protected _drawBodies: (p: Body, i: number) => void;
    constructor(bound: Group, friction?: number, gravity?: PtLike | number);
    bound: Bound;
    gravity: Pt;
    friction: number;
    damping: number;
    readonly bodyCount: number;
    readonly particleCount: number;
    body(id: number | string): any;
    particle(id: number | string): any;
    bodyIndex(name: string): number;
    particleIndex(name: string): number;
    update(ms: number): void;
    drawParticles(fn: (p: Particle, i: number) => void): void;
    drawBodies(fn: (p: Body, i: number) => void): void;
    add(p: Particle | Body, name?: string): this;
    private _index;
    removeBody(from: number | string, count?: number): this;
    removeParticle(from: number | string, count?: number): this;
    static edgeConstraint(p1: Particle, p2: Particle, dist: number, stiff?: number, precise?: boolean): Particle;
    static boundConstraint(p: Particle, rect: Group, damping?: number): void;
    protected integrate(p: Particle, dt: number, prevDt?: number): Particle;
    protected _updateParticles(dt: number): void;
    protected _updateBodies(dt: number): void;
}
export declare class Particle extends Pt {
    protected _mass: number;
    protected _radius: number;
    protected _force: Pt;
    protected _prev: Pt;
    protected _body: Body;
    protected _lock: boolean;
    protected _lockPt: Pt;
    constructor(...args: any[]);
    mass: number;
    radius: number;
    previous: Pt;
    force: Pt;
    body: Body;
    lock: boolean;
    readonly changed: Pt;
    position: Pt;
    size(r: number): this;
    addForce(...args: any[]): Pt;
    verlet(dt: number, friction: number, lastDt?: number): this;
    hit(...args: any[]): this;
    collide(p2: Particle, damp?: number): void;
    toString(): string;
}
export declare class Body extends Group {
    protected _cs: Array<number[]>;
    protected _stiff: number;
    protected _locks: {
        [index: string]: Particle;
    };
    protected _mass: number;
    constructor();
    static fromGroup(list: GroupLike, stiff?: number, autoLink?: boolean, autoMass?: boolean): Body;
    init(list: GroupLike, stiff?: number): this;
    mass: number;
    autoMass(): this;
    link(index1: number, index2: number, stiff?: number): this;
    linkAll(stiff: number): void;
    linksToLines(): Group[];
    processEdges(): void;
    processBody(b: Body): void;
    processParticle(b: Particle): void;
}
