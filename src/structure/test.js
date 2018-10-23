let Carbon = require('./carbon')
let Hydrogen = require('./hydrogen')
let Molecule = require('./molecule')

let m = new Molecule('butane');
console.log(m.molecularFormula);
let m2 = new Molecule('but-2-ene');
console.log(m2.molecularFormula);


/*let c = new Carbon();
let h1 = new Hydrogen();
let h2 = new Hydrogen();
let h3 = new Hydrogen();
let h4 = new Hydrogen();

c.addBond(h1);
c.addBond(h2);
c.addBond(h3);
c.addBond(h4);

console.log(c);
console.log(c.orbital1 === h1.orbital1);*/