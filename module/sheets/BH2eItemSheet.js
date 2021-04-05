export default class BH2eItemSheet  extends ItemSheet {
    get template() {
        let path = `systems/bh2e/templates/sheets/${this.item.data.type}-sheet.html`;
        console.log("Returning a template path of '" + path +"'.");
        return(path);
    }

    getData() {
        let data = super.getData();
        data.bh2e   = CONFIG.bh2e;
        data.config = CONFIG.bh2e.configuration;
        return(data);
    }
}
