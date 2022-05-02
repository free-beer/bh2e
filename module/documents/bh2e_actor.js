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
        const actorData = this.data;
        const data      = actorData.data;
        const flags     = (actorData.flags.bh2e || {});

        this._prepareCharacterData(actorData);
    }

    _prepareCharacterData(actorData) {
        if(actorData.type === "character") {
            let data      = actorData.data;
        }
    }
}
