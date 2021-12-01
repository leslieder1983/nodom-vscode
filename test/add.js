const nodom=require('../dist/nodom.cjs');
const Md =nodom.Module;
let a=` {
    
       data() {
         return {
          a:1,
          add:{}
         }
       }
       template() {
           return \`
           <if  cond='aa' x-animation=  e-change=></if>
           \`
       }
       add(){
    
       }
    }
    `
  let res=  eval('(function(){return class Exp extends Md'+a+'})()');
  let r=Reflect.construct(res,[]);
  console.log(r);