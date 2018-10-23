let Atom = require('./atom');

module.exports = class Carbon extends Atom {
    constructor() {
        super('C');
    }

    get valence() {
        return 4;
    }

    /**
     * Returns the degree of this carbon, as in whether it is primary,
     * secondary, tertiary, or quaternary, as a number
     */
    getDegree() {
        return this.orbitals.reduce((accumulator, orbital) => {
            let other = (orbital.atom1 === this) ? orbital.atom2 : orbital.atom1;
            if (other.atomicSymbol === 'C')
                return accumulator + 1;
            else
                return accumulator;
        }, 0);
    }

    /**
     * Returns a hydrogen attached to this carbon
     */
    getAttachedHydrogen() {
        for (let orbital of this.orbitals) {
            let other = (orbital.atom1 === this) ? orbital.atom2 : orbital.atom1;
            if (other.atomicSymbol === 'H')
                return other;
        }
        throw 'No Hydrogens attached to this carbon';
    }
}
