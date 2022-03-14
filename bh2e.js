import {BH2eActor} from './module/documents/bh2e_actor.js';
import {BH2eItem} from './module/documents/bh2e_item.js';

import {BH2e} from './module/config.js';
import {BH2eState} from './module/bh2e_state.js';
import BH2eItemSheet from './module/sheets/BH2eItemSheet.js';
import BH2eCharacterSheet from './module/sheets/BH2eCharacterSheet.js';
import BH2eCombat from './module/bh2e_combat.js';
import BH2eCreatureSheet from './module/sheets/BH2eCreatureSheet.js';
import {logDamageRoll} from './module/chat_messages.js';
import {toggleAttributeTestDisplay} from './module/shared.js';

async function preloadHandlebarsTemplates() {
    const paths = ["systems/bh2e/templates/partials/ability-details.hbs",
                   "systems/bh2e/templates/partials/ability-entry.hbs",
                   "systems/bh2e/templates/partials/armour-details.hbs",
                   "systems/bh2e/templates/partials/armour-entry.hbs",
                   "systems/bh2e/templates/partials/attribute-details.hbs",
                   "systems/bh2e/templates/partials/attribute-list.hbs",
                   "systems/bh2e/templates/partials/background-tab.hbs",
                   "systems/bh2e/templates/partials/basics-tab.hbs",
                   "systems/bh2e/templates/partials/creature-ability-entry.hbs",
                   "systems/bh2e/templates/partials/creature-attack-entry.hbs",
                   "systems/bh2e/templates/partials/equipment-entry.hbs",
                   "systems/bh2e/templates/partials/prayer-entry.hbs",
                   "systems/bh2e/templates/partials/prayers-tab.hbs",
                   "systems/bh2e/templates/partials/spell-entry.hbs",
                   "systems/bh2e/templates/partials/spells-tab.hbs",
                   "systems/bh2e/templates/partials/toggle-collapse-widget.hbs",
                   "systems/bh2e/templates/partials/weapon-details.hbs",
                   "systems/bh2e/templates/partials/weapon-entry.hbs",
                   "systems/bh2e/templates/messages/attack-roll.hbs",
                   "systems/bh2e/templates/messages/attribute-test.hbs",
                   "systems/bh2e/templates/messages/cast-magic.hbs",
                   "systems/bh2e/templates/messages/damage.hbs",
                   "systems/bh2e/templates/messages/damage-roll.hbs",
                   "systems/bh2e/templates/messages/roll.hbs"];
    return(loadTemplates(paths))
}

async function runMigrations() {
    console.log("Running migrations...");
    updateCreatureHitPoints(game.actors);
    updateCharacterCoins(game.actors);
}

async function updateCharacterCoins(actors) {
    actors.forEach((actor) => {
        if(actor.type === "character") {
            let coins  = actor.data.data.coins;
            let update = false;

            console.log(`Checking if '${actor.name}' needs a coins update.`);
            if(!coins || !Number.isNumeric(coins)) {
                coins  = (coins ? parseInt(coins) : 0);
                update = true;
            }

            if(update) {
                console.log(`Updating coins for '${actor.name}'.`);
                actor.update({data: {coins: coins}});
            }
        }
    });
}

async function updateCreatureHitPoints(actors) {
    actors.forEach((actor) => {
        if(actor.type === "creature") {
            let hitPoints = actor.data.data.hitPoints;

            console.log(`Checking if '${actor.name}' needs an update.`);
            if(!hitPoints) {
                hitPoints = 5;
            }

            if(Number.isNumeric(hitPoints)) {
                console.log(`Updating hit points for '${actor.name}'.`);
                actor.update({data: {hitPoints: {max: hitPoints, value: hitPoints}}});
            }
        }
    });
}

Hooks.once("init", function() {
    let state = new BH2eState();

    console.log("Initializing the Black Hack 2e System.");

    game.bh2e = {BH2eActor, BH2eItem};

    CONFIG.BH2E = {configuration: BH2e, state: state};
    CONFIG.Actor.documentClass = BH2eActor;
    CONFIG.Combat.documentClass = BH2eCombat;
    CONFIG.Item.documentClass  = BH2eItem;

    window.bh2e  = {configuration: BH2e, state: state};

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("bh2e", BH2eItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("bh2e", BH2eCharacterSheet, {makeDefault: true, types: ["character"]});
    Actors.registerSheet("bh2e", BH2eCreatureSheet, {makeDefault: true, types: ["creature"]});

    // Load templates.
    preloadHandlebarsTemplates();

    Handlebars.registerHelper("attackKind", function(key) {
        return(game.i18n.localize(`bh2e.weapons.kinds.${key}`));
    });
    Handlebars.registerHelper("longAttributeName", function(key) {
        return(game.i18n.localize(`bh2e.fields.labels.attributes.${key}.long`));
    });
    Handlebars.registerHelper("rangeName", function(name) {
        return(game.i18n.localize(`bh2e.ranges.${name}`));
    });
    Handlebars.registerHelper("shortAttributeName", function(key) {
        return(game.i18n.localize(`bh2e.fields.labels.attributes.${key}.short`));
    });

    // Add hook functions.
    Hooks.on("renderChatMessage", (message, speaker) => {
        setTimeout(() => {
            let element = document.querySelector(`[data-message-id="${message.id}"]`);
            let node    = element.querySelector(".bh2e-roll-title");

            if(node) {
                node.addEventListener("click", toggleAttributeTestDisplay);
            }

            node = element.querySelector(".bh2e-damage-button");
            if(node) {
                node.addEventListener("click", logDamageRoll);
            }
        }, 250);
    });
});

Hooks.once("ready", function() {
    setTimeout(runMigrations, 500);
});
