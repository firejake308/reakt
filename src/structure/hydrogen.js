let Atom = require('./atom')

module.exports = class Hydrogen extends Atom {
    constructor() {
        super('H');
    }

    get valence() {
        return 1;
    }

    assignEmptyOrbital(electrons) {
        if (!this.orbitals[0].isEmpty)
            throw 'No Empty Orbitals';
        this.orbitals[0] = electrons;
    }
}