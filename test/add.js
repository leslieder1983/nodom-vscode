const Nodom = require('nodom3.3/dist/nodom.cjs.js');
const elements=[...Nodom.DefineElementManager.elements.keys()].map((v)=>{return v.toLowerCase()});
const directives = [...Nodom.DirectiveManager.directiveTypes.keys()];
console.log(elements,directives);