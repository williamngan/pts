import {Vector} from "vectorious";

// Augment the Vectorious typing
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
// https://stackoverflow.com/questions/42941806/typescript-custom-types-package-for-types-react-router/42943237


declare module "vectorious" {

  interface Vector {
    constructor(...args:any[]);
    data:Float64Array;
    x: number;
    y: number;
    z: number;
    w: number;
    length: number;
    add(...args:any[]): this;
    subtract(...args:any[]): this;
    scale(scalar:number): this;
    normalize():this;
    project (vector: Vector): this;
    set (index: number, value: number): this;
    combine (vector: Vector): this;
    push (value: number): this;
    map (callback: (element: number) => number): this;
    each (callback: (element: number) => void): this;
  }
  
}