export default class InfoDialog extends Dialog {
    static get defaultOptions() {
        return(foundry.utils.mergeObject(super.defaultOptions,
                                         {width: 450}));
    }

	constructor(settings) {
        let buttons = {close: {callback: () => {},
                               label: game.i18n.localize("bh2e.buttons.close")}};

        super(Object.assign({}, settings, {buttons: buttons}));
	}

    static build(element, options={}) {
        let settings = Object.assign({}, options);
        let data     = {description: element.dataset.description};

        if(data.description.trim() === "") {
            data.description = game.i18n.localize("bh2e.dialogs.info.empty")
        }

        settings.title = game.i18n.localize(`bh2e.dialogs.info.title`);

        return(renderTemplate("systems/bh2e/templates/dialogs/info-dialog.html", data)
                   .then((content) => {
                             settings.content = content;
                             return(new InfoDialog(settings));
                         }));   
    }
}
