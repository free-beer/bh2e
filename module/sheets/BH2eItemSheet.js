export default class BH2eItemSheet  extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return(foundry.utils.mergeObject(super.defaultOptions,
                                         {classes: ["bh2e", "sheet", "item"],
                                          height:  500,
                                          width:   700}));
    }

    /** @override */
    get template() {
        return(`systems/bh2e/templates/sheets/${this.item.type}-sheet.html`);
    }

    /** @override */
    getData() {
        const context  = super.getData();
        const itemData = context.item.system;

        context.bh2e   = CONFIG.BH2E;
        context.config = CONFIG.BH2E.configuration;
        context.data   = itemData.data;
        context.flags  = itemData.flags;

        return(context);
    }

    /** @override */
    setPosition(options={}) {
        const position   = super.setPosition(options);
        const sheetBody  = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;

        sheetBody.css("height", bodyHeight);
        return(position);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if(this.options.editable) {
            // TBD: Activate listeners here!!!
        }
    }
}
