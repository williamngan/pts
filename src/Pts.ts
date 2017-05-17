import {Pt} from "./Pt";

export class Pts {

  protected vecs:Pt[] = [];
  protected names:string[] = [];

  constructor() {
    
  }

  public push( pt:Pt, name?:string ):this {
    this.vecs.push( pt );
    this.names.push( name || "field"+this.vecs.length );
    return this;
  }

  public pop():Array<any> {
    var dv = this.vecs.pop();
    var dn = this.names.pop();
    return [dv, dn];
  }

  public slice( start:number, end?:number ):Array<any> {
    var dv = this.vecs.slice( start, end );
    var dn = this.names.slice(start, end)
    return [dv, dn];
  } 
}
