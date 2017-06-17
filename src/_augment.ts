/*
import {Vector} from "vectorious";

// Augment the Vectorious typing
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
// https://stackoverflow.com/questions/42941806/typescript-custom-types-package-for-types-react-router/42943237


declare module "vectorious" {

  interface Vector {
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

  interface Matrix {
    add (matrix: Matrix): this;
    subtract (matrix: Matrix): this;
    scale (scalar: number): this;
    product (matrix: Matrix): this;
    multiply (matrix: Matrix): this;
    transpose (): this;
    inverse (): this;
    gauss (): this;
    lusolve (rhs: Matrix, ipiv: Int32Array): this;
    solve (rhs: Matrix|Vector): this;
    augment (matrix: Matrix): this;
    diag (): this;
    set (i: number, j: number, value: number): this;
    swap (i: number, j: number): this;
    map (callback: (element: number) => number): this;
    each (callback: (element: number) => void): this;
  }
  
}

*/