module.exports = class Orbital {
    constructor(atom1, atom2) {
        this.atom1 = atom1;
        this.atom2 = atom2;

        // assign to atom 2 as well
        if (atom2 && atom2 !== atom1)
            atom2.assignEmptyOrbital(this);
    }

    get isEmpty() {
        return !(this.atom1 || this.atom2);
    }

    toString() {
        return (
    `{
        'atom1': ${this.atom1 && this.atom1.atomicSymbol}-${this.atom1 && this.atom1.id},
        'atom2': ${this.atom2 && this.atom2.atomicSymbol}-${this.atom2 && this.atom2.id}
    }`);
    }

    
}