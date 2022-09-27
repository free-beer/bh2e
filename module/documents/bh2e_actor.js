export class BH2eActor extends Actor {
    /** @override */
    prepareData() {
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
    }

    /** @override */
    prepareDerivedData() {
        const actorData = this.system;
        const data      = actorData.data;
        const flags     = (this.flags.bh2e || {});

        this._prepareCharacterData(actorData);
    }

    _prepareCharacterData(actorData) {
    }
}
