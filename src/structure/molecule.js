let Carbon = require('./carbon');
let Hydrogen = require('./hydrogen');
let Orbital = require('./bond');

module.exports = class Molecule {
    constructor(iupacName) {
        this.atoms = [];
        this.iupacName = iupacName;

        // parse atoms from IUPAC name
        const parentRoots = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
        const numericalPrefices = ['di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa'];
        const numericalRegex = arrayToRegex(numericalPrefices);
        let functionalGroup = /.+(e)|(ol)$/.exec(iupacName)[1];
        let unsaturation = new RegExp('.+([aey]n)' + functionalGroup + '$').exec(iupacName)[1];
        let parent = new RegExp('.*' + arrayToRegex(parentRoots) + '(?:-.+-'+numericalRegex+'?)?' + unsaturation + functionalGroup + '$').exec(iupacName)[1];

        // DEBUG
        console.log(functionalGroup);
        console.log(unsaturation);
        console.log(parent);

        // generate parent chain
        this.atoms = generateCarbonChain(parentRoots.indexOf(parent) + 1);

        // handle alkenes
        if (unsaturation === 'en') {
            let expectedLocants;
            let numericalPrefix = '';
            try {
                numericalPrefix = new RegExp('.*' + parent + '-[\\d,]+-' + numericalRegex + '-' + unsaturation + functionalGroup + '$').exec(iupacName)[1];
                expectedLocants = numericalPrefices.indexOf(numericalPrefix) + 2;
            }
            catch(e) {
                if (e instanceof TypeError)
                    expectedLocants = 1;
                else throw e;
            }          
            // TODO if prefix is before parent chain
            let unsaturationLocantString = new RegExp('.*' + parent + '-((?:\\d,?)+)-' + numericalPrefix + unsaturation + functionalGroup + '$').exec(iupacName)[1];
            let unsaturationLocants = unsaturationLocantString.split(',').map(a => parseInt(a));

            if (expectedLocants !== unsaturationLocants.length)
                throw 'NameError: did not find expected number of unsaturation locants'

            // for each locant, rm H from C locant and C locant + 1
            // form double bond using electrons from one of the H's
            for(let locant of unsaturationLocants) {
                let c1 = this.getNthCarbon(locant);
                this.removeLeavingGroup(c1.getAttachedHydrogen(), c1);
                let c2 = this.getNthCarbon(locant + 1);
                this.moveElectrons(c2, c2.getAttachedHydrogen(), c1);
            }

        }
    }

    get molecularFormula() {
        let counts = new Map();
        for (let atom of this.atoms) {
            // increment count of element or set to 1
            let element = atom.atomicSymbol;
            counts.set(element, (counts.get(element) || 0) + 1);
        }

        let formula = '';
        for (let [element, count]  of counts) {
            formula += element
            if (count !== 1) 
                formula += count;
        }

        return formula;
    }

    getNthCarbon(n) {
        if (n < 1) throw RangeError('Carbon number must be at least 1');

        // cMap will use the carbon number as its index and the carbon atom as its value
        let cMap = [];
        
        // use the fact that the first carbon in the chain can only be
        // bonded to one other carbon
        for (const atom of this.atoms) {
            if (atom.atomicSymbol === 'C') {
                if (atom.getDegree() === 1) {
                    cMap[1] = atom;

                    // TODO the carbon connected to C1 must be C2
                    let lastAtom = null;
                    let currPos = 1;
                    let currAtom = cMap[currPos];
                    let endOfChain = false;
                    while(!endOfChain) {
                        const lastPos = currPos;
                        for (let orbital of currAtom.orbitals) {
                            let other = (orbital.atom1 === currAtom) ? orbital.atom2 : orbital.atom1;
                            // currently using the first new carbon as the next in the chain
                            if (other.atomicSymbol === 'C' && other !== lastAtom) {
                                cMap[++currPos] = other;
                                lastAtom = currAtom;
                                currAtom = other;
                                break;
                            }
                        }

                        // if, after going through all orbitals, currPos hasn't changed, then we are at the end of the chain
                        if (currPos === lastPos)
                            endOfChain = true;
                    }

                    // TODO with branching, numbering gets more complicated, but
                    // we'll ignore that for now and use the first bonded carbon
                }

                // we have found the chain, no need to keep looking for primary carbons
                break;
            }
        }

        if (n > cMap.length - 1)
            throw RangeError(`Cannot find C${n} in a ${cMap.length - 1}-carbon chain`);
        
        // for now, just return the first carbon that works
        // later, when we have branching, we'll have to find the first
        // carbon in the longest chain
        return cMap[n];
    }

    /**
     * Given an atom, removes it from the molecule and gives it all electrons in the bond
     * it had with the rest of the molecule
     * @param {Atom} leavingGroup the group (currently single atom) to remove from the molecule
     * @param {Atom} connectingAtom the atom that connects the LG to the rest of the molecule
     */
    removeLeavingGroup(leavingGroup, connectingAtom) {
        // check to make sure that atom is part of this molecule
        let sameAtom = this.atoms.reduce((prev, atom) => (atom === leavingGroup) ? atom : prev);
        if (sameAtom !== leavingGroup) {
            throw 'No Such Atom';
        }
        
        // break bond between connectingAtom and leavingGroup
        leavingGroup.orbitals.forEach((orbital) => {
            if (orbital.atom1 === connectingAtom) {
                orbital.atom1 = leavingGroup; // both e-'s now belong to LG
                // now we just have to alert connectingAtom that he's lost his e-'s
                connectingAtom.orbitals[connectingAtom.orbitals.indexOf(orbital)] = new Orbital(null, null);
            }
        });

        // remove atom from list
        this.atoms = this.atoms.filter((atom) => atom !== leavingGroup);

        // TODO remove entire group instead of just an atom
    }

    /**
     * Moves electrons from the orbital connecting `losingAtom` and connectingAtom to the
     * orbital connecting `gainingAtom` and `connectingAtom`
     * 
     * @param {Atom} connectingAtom the atom connecting the loser and the gainer
     * @param {Atom} losingAtom the atom that loses the electrons
     * @param {Atom} gainingAtom the atom that gains the electrons
     */
    moveElectrons(connectingAtom, losingAtom, gainingAtom) {
        connectingAtom.orbitals.forEach((orbital) => {
            if (orbital.atom1 === losingAtom || orbital.atom2 === losingAtom) {
                // gaining atom must have empty orbital
                try {
                    gainingAtom.assignEmptyOrbital(orbital); 
                } 
                catch (e) {
                    if (e === 'No Empty Orbitals')
                        throw `${gainingAtom.atomicSymbol}-${gainingAtom.id} has no empty orbitals`;
                }
                // update owner of electrons
                if (orbital.atom1 === losingAtom)
                    orbital.atom1 = gainingAtom;
                else if (orbital.atom2 === losingAtom)
                    orbital.atom2 = gainingAtom;
                // alert loser
                losingAtom.orbitals[losingAtom.orbitals.indexOf(orbital)] = new Orbital(null, null); 
                
                // TODO actually check other orbitals in case this is a rearrangement
                // but for now, we'll assume that leaving groups get deleted from the molecule automatically
                this.atoms = this.atoms.filter((atom) => atom !== losingAtom);
            }
        });
    }

    /**
     * Returns the IUPAC name of this molecule that was used to create it
     */
    toString() {
        return this.iupacName;
    }
}

/**
 * Takes an array of strings and produces the regex syntax for a single caputring
 * group that will capture any of the elements in the provided array
 * @param {Array<String>} arr 
 */
function arrayToRegex(arr) {
    let regex = '(';
    for (let i = 0; i < arr.length; i++) {
        regex += '(?:' + arr[i] + ')';
        if (i !== arr.length - 1)
            regex += '|';
    }
    regex += ')'
    return regex;
}

function generateCarbonChain(length) {
    if (length < 1)
        throw RangeError('Length of chain must be at least 1')
    
    const atoms = [new Carbon()];
    let currLength = 1;
    while (currLength < length) {
        // add carbons to chain
        let nextCarbon = new Carbon();
        atoms[atoms.length - 1].addBond(nextCarbon);
        atoms.push(nextCarbon);
        currLength++;
    }

    // fill in hydrogens
    for (let i = 0; i < length; i++) {
        const carbon = atoms[i];
        try {
            while (true) {
                const h = new Hydrogen();
                carbon.addBond(h);
                atoms.push(h);
            }
        } 
        catch(e) {
            if (e === 'No Empty Orbitals')
                continue;
            else throw e;
        }
    }

    return atoms;
}