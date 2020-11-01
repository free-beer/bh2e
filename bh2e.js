import {BH2e} from './module/config.js';
import BH2eItemSheet from './module/sheets/BH2eItemSheet.js';
import BH2eCharacterSheet from './module/sheets/BH2eCharacterSheet.js';

async function preloadHandlebarsTemplates() {
	const paths = ["systems/bh2e/templates/partials/ability-details.hbs",
	               "systems/bh2e/templates/partials/ability-entry.hbs",
	               "systems/bh2e/templates/partials/armour-details.hbs",
	               "systems/bh2e/templates/partials/armour-entry.hbs",
	               "systems/bh2e/templates/partials/attribute-details.hbs",
	               "systems/bh2e/templates/partials/attribute-list.hbs",
	               "systems/bh2e/templates/partials/equipment-entry.hbs",
	               "systems/bh2e/templates/partials/weapon-details.hbs",
	               "systems/bh2e/templates/partials/weapon-entry.hbs"];
	return(loadTemplates(paths))
}

Hooks.once("init", function() {
	console.log("Initializing the Black Hack 2e System.");

    CONFIG.bh2e = BH2e;

    Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("bh2e", BH2eItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("bh2e", BH2eCharacterSheet, {makeDefault: true});

	// Load templates.
	preloadHandlebarsTemplates();
});