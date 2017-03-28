import Pt from "./Pt";

export default class Pts {

  protected vs:Pt[];

  constructor() {
    this.vs = [];
  }

  public pt(x:number, y:number, z:number) {
    this.vs.push( new Pt(x, y, z) );
  }


}
