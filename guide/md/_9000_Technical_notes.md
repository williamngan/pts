# Technical notes

### Typescript notes
While [`Pt`](#pt_pt) extends `Float32Array` and [`Group`](#pt_group) extends Array, typescript compiler at the moment (2.4.2) isn't smart enough to auto-cast the return type when you use an Array or Float32Array function. That means if you use typescript, you may need to recast some native Array functions such as `map` or `slice`.

```
let p:Pt = new Pt(1,2,3);
let p2 = p.map( (d) => d+1 ); // typescript thinks p2 is Float32Array
let p3 = p.map( (d) => d+1 ) as Pt; // type is now cast back to Pt
```