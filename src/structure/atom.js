let Orbital = require('./bond')

module.exports = class Atom {
    constructor(atomicSymbol) {
        // properties for all atoms
        this.atomicSymbol = atomicSymbol;
        this.orbitals = [new Orbital(null, null), new Orbital(null, null), new Orbital(null, null), new Orbital(null, null)];
        this.id = Math.floor(Math.random() * 2147000);

        // abstract methods and properties
        if (this.valence === undefined) {
            throw new Error('Valence was not defined for ' + this);
        }
    }

    assignEmptyOrbital(electrons) {
        let emptyIndex = -1;
        for(let i = 0; i < this.orbitals.length; i++) {
            const orbital = this.orbitals[i];
            if (orbital.isEmpty) {
                emptyIndex = i;
                break;
            }
        }
        if (emptyIndex === -1)
            throw 'No Empty Orbitals';
        this.orbitals[emptyIndex] = electrons;
    }

    addBond(otherAtom) {
        this.assignEmptyOrbital(new Orbital(this, otherAtom));
    }

    addLonePair() {
        this.assignEmptyOrbital(new Orbital(this, this));
    }

    get formalCharge() {
        let numElectronsOwned = 0;
        for (let orbital of this.orbitals) {
            if (orbital.atom1 === this)
                numElectronsOwned++;
            if (orbital.atom2 === this)
                numElectronsOwned++;
        }
        return this.valence - numElectronsOwned;
    }

    toString() {
        return this.atomicSymbol;
    }
}