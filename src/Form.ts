// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Space} from "./Space";
import {Pt, PtLike, GroupLike} from "./Pt";

export class Font {
  public size:number;
  public lineHeight:number;
  public face:string;
  public style:string;
  public weight:string;
  

  constructor( size=12, face="sans-serif", weight="", style="", lineHeight=1.5 ) {
    this.size = size;
    this.face = face;
    this.style = style;
    this.weight = weight;
    this.lineHeight = lineHeight;
  }

  // "italic small-caps bold 12px arial"
  get value():string { return `${this.style} ${this.weight} ${this.size}px/${this.lineHeight} ${this.face}` };
}


export abstract class Form {

  protected _filled = true;
  public get filled():boolean { return this._filled; }
  public set filled( b:boolean ) { this._filled = b; }
  
  protected _stroked = true;
  public get stroked():boolean { return this._stroked; }
  public set stroked( b:boolean ) { this._stroked = b; }

  protected _font:Font = new Font();
  public get currentFont():Font { return this._font; }

  public abstract get space():Space;

  public abstract reset(): this;

  public abstract fill( c:string|boolean ):this;

  public abstract stroke( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this;


}