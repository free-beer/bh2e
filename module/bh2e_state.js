/**
 * A class that will be used to retain transient state for the system as opposed
 * to application state which gets recorded in Foundry.
 */
export class BH2eState {
    /**
     * Constructor that creates and empty state instance.
     */
    constructor() {
        this._root = {};
    }

    /**
     * Determines whether a current key exists within the state object.
     */
    exists(key) {
        let found   = true;
        let current = this._root;

        key.split(".").forEach((name) => {
            if(current && found) {
                if(current.hasOwnProperty(name)) {
                    current = current[name];
                } else {
                    found = false;
                }
            }
        });

        return(found);
    }

    /**
     * Fetches a named value from a state object, returning undefined if the
     * value is not set.
     */
    get(key, alternative=undefined) {
        let value = undefined;

        if(this.exists(key)) {
            let current = this._root;

            key.split(".").forEach((name) => {
                current = current[name];
            });
            value = current;
        } else {
            value = alternative;
        }

        return(value);
    }

    /**
     * Sets a named value within a state instance.
     */
    set(key, value) {
        let steps = key.split(".");
        let node  = this._root;

        steps.slice(0, steps.length - 1).forEach((name) => {
            if(!node.hasOwnProperty(name)) {
                node[name] = {};
            }
            node = node[name];
        });
        node[steps[steps.length - 1]] = value;
    }
}
