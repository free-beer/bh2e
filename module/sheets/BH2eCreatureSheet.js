import {deleteOwnedItem} from '../shared.js';

export default class BH2eCreatureSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes: ["bh2e", "sheet", "creature"],
                            height: 520,
                            template: "systems/bh2e/templates/sheets/creature-sheet.html",
                            width: 900}));
    }

    getData() {
        let data = super.getData();

        data.BH2E      = CONFIG.BH2E;
        data.config    = CONFIG.BH2E.configuration;
        data.abilities = data.items.filter(a => a.type === "ability");
        data.actions   = data.items.filter(i => i.type === "creature-attack");
        return(data);
    }

    activateListeners(html) {
        html.find(".bh2e-delete-item-icon").click(this._onDeleteItemClicked.bind(this));
        super.activateListeners(html);
    }

    _onDeleteItemClicked(event) {
        event.preventDefault();
        let element = event.currentTarget;
        if(element.dataset.id) {
            this.actor.deleteEmbeddedDocuments("Item", [element.dataset.id]);
        } else {
          console.error("Delete item called for but item id is not present on the element.");
        }
        return(false);
    }
}
