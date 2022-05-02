import AttackRollDialog from '../dialogs/attack_roll_dialog.js';
import {castMagic,
        castMagicAsRitual,
        prepareMagic,
        unprepareMagic} from '../magic.js';
import {deleteOwnedItem,
        findActorFromItemId,
        generateDieRollFormula,
        initializeCharacterSheetUI,
        interpolate,
        onTabSelected} from '../shared.js';
import {logAttackRoll,
        logAttributeTest,
        logUsageDieRoll} from '../chat_messages.js';

export default class BH2eCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {classes:  ["bh2e", "sheet", "character"],
                            height:   825,
                            template: "systems/bh2e/templates/sheets/character-sheet.html",
                            width:    800}));
    }

    /** @override */
    get template() {
        return(`systems/bh2e/templates/sheets/character-sheet.html`);
    }

    /** @override */
    getData() {
        const context   = super.getData();
        const actorData = context.actor.data;

        context.data  = actorData.data;
        context.flags = actorData.flags;

        if(actorData.type === "character") {
            this._prepareCharacterData(context);
        }

        return(context);
    }

    activateListeners(html) {
        super.activateListeners(html);

        initializeCharacterSheetUI(window.bh2e.state);

        html.find(".bh2e-roll-attack-icon").click(this._onRollAttackClicked.bind(this));
        html.find(".bh2e-roll-attribute-test-icon").click(this._onRollAttributeTest.bind(this));
        html.find(".bh2e-roll-usage-die-icon").click(this._onRollUsageDieClicked.bind(this));
        html.find(".bh2e-delete-item-icon").click(this._onDeleteItemClicked.bind(this));
        html.find(".bh2e-break-armour-die-icon").click(this._onBreakArmourDieClicked.bind(this));
        html.find(".bh2e-repair-armour-die-icon").click(this._onRepairArmourDieClicked.bind(this));
        html.find(".bh2e-repair-all-armour-dice-icon").click(this._onRepairAllArmourDiceClicked.bind(this));
        html.find(".bh2e-reset-all-usage-dice-icon").click(this._onResetUsageDiceClicked.bind(this));
        html.find(".bh2e-reset-usage-die-icon").click(this._onResetUsageDieClicked.bind(this));
        html.find(".bh2e-increase-quantity-icon").click(this._onIncreaseEquipmentQuantityClicked.bind(this));
        html.find(".bh2e-decrease-quantity-icon").click(this._onDecreaseEquipmentQuantityClicked.bind(this));
        html.find(".bh2e-cast-magic-icon").click(castMagic);
        html.find(".bh2e-cast-magic-as-ritual-icon").click(castMagicAsRitual);
        html.find(".bh2e-prepare-magic-icon").click(prepareMagic);
        html.find(".bh2e-unprepare-magic-icon").click(unprepareMagic);
    }

    _prepareCharacterData(context) {
        let abilities = [];
        let armour    = [];
        let classes   = [];
        let equipment = [];
        let prayers   = [[], [], [], [], [], [], [], [], [], []];
        let spells    = [[], [], [], [], [], [], [], [], [], []];
        let weapons   = [];

        context.items.forEach((item) => {
            switch(item.type) {
                case "ability":
                    abilities.push(item);
                    break;

                case "armour":
                    armour.push(item);
                    break;

                case "class":
                    classes.push(item);
                    break;

                case "equipment":
                    equipment.push(item);
                    break;

                case "magic":
                    let index = item.data.level - 1;

                    if(index >= 0 && index < spells.length) {
                        switch(item.data.kind) {
                            case "prayer":
                                prayers[index].push(item);
                                break;

                            case "spell":
                                spells[index].push(item);
                                break;

                            default:
                                console.warn("Ignoring character item magic", item);
                        }
                    } else {
                        console.error(`An invalid level of ${item.data.level} was specified for a spell or prayer.`, item);
                    }
                    break;

                case "weapon":
                    weapons.push({actorId:     this.actor.id,
                                  attribute:   item.data.attribute,
                                  description: item.data.description,
                                  id:          item._id,
                                  kind:        item.data.kind,
                                  name:        item.name,
                                  rarity:      item.data.rarity,
                                  size:        item.data.size});
                    //weapons.push(item);
                    break;

                default:
                    console.warn("Ignoring character item", item);
            }
        });

        abilities.sort(function(lhs, rhs) {
            if(lhs.name > rhs.name) {
              return(1);
            } else if(lhs.name < rhs.name) {
              return(-1);
            } else {
              return(0);
            }
        });

        context.abilities    = abilities;
        context.armour       = armour;
        context.classes      = classes;
        context.config       = CONFIG.BH2E.configuration;
        context.equipment    = equipment;
        context.hasPrayers1  = (prayers[0].length > 0)
        context.hasPrayers2  = (prayers[1].length > 0)
        context.hasPrayers3  = (prayers[2].length > 0)
        context.hasPrayers4  = (prayers[3].length > 0)
        context.hasPrayers5  = (prayers[4].length > 0)
        context.hasPrayers6  = (prayers[5].length > 0)
        context.hasPrayers7  = (prayers[6].length > 0)
        context.hasPrayers8  = (prayers[7].length > 0)
        context.hasPrayers9  = (prayers[8].length > 0)
        context.hasPrayers10 = (prayers[9].length > 0)
        context.hasSpells1   = (spells[0].length > 0)
        context.hasSpells2   = (spells[1].length > 0)
        context.hasSpells3   = (spells[2].length > 0)
        context.hasSpells4   = (spells[3].length > 0)
        context.hasSpells5   = (spells[4].length > 0)
        context.hasSpells6   = (spells[5].length > 0)
        context.hasSpells7   = (spells[6].length > 0)
        context.hasSpells8   = (spells[7].length > 0)
        context.hasSpells9   = (spells[8].length > 0)
        context.hasSpells10  = (spells[9].length > 0)
        context.prayers1     = prayers[0];
        context.prayers2     = prayers[1];
        context.prayers3     = prayers[2];
        context.prayers4     = prayers[3];
        context.prayers5     = prayers[4];
        context.prayers6     = prayers[5];
        context.prayers7     = prayers[6];
        context.prayers8     = prayers[7];
        context.prayers9     = prayers[8];
        context.prayers10    = prayers[9];
        context.spells1      = spells[0];
        context.spells2      = spells[1];
        context.spells3      = spells[2];
        context.spells4      = spells[3];
        context.spells5      = spells[4];
        context.spells6      = spells[5];
        context.spells7      = spells[6];
        context.spells8      = spells[7];
        context.spells9      = spells[8];
        context.spells10     = spells[9];
        context.weapons      = weapons;
    }

    _onBreakArmourDieClicked(event) {
        let element = event.currentTarget;

        event.preventDefault();
        if(element.dataset.id) {
            console.log(`Breakage of armour die on armour item id ${element.dataset.id}.`);
            let actor = findActorFromItemId(element.dataset.id);
            if(actor) {
                let item  = actor.items.find(i => i.id === element.dataset.id);

                if(item) {
                    if(item.data.data.armourValue.total > item.data.data.armourValue.broken) {
                        let data = {id: item.id,
                                    data: {
                                      armourValue: {
                                        broken: item.data.data.armourValue.broken + 1
                                    }}};

                        item.update(data, {diff: true});
                    }
                } else {
                    console.error(`Failed to find item id ${element.dataset.id}.`);
                }
            } else {
              console.error(`Failed to find an actor that owns item id ${element.dataset.id}.`);
            }
        } else {
            console.error(`Element had no item id on it.`)
        }

        return(false);
    }

    _onDeleteItemClicked(event) {
        let element = event.currentTarget;

        event.preventDefault();
        if(element.dataset.id) {
            deleteOwnedItem(element.dataset.id);
        } else {
            console.error("Delete item called for but item id is not present on the element.");
        }
        return(false);
    }

    _onDecreaseEquipmentQuantityClicked(evemt) {
        let element = event.currentTarget;

        event.preventDefault();
        if(element.dataset.id) {
            let actor = findActorFromItemId(element.dataset.id);

            if(actor) {
                this.decrementEquipmentQuantity(actor, element.dataset.id)
            } else {
                console.error(`Failed to find an actor that owns item id ${element.dataset.id}.`);
            }
        } else {
            console.error(`Element had no item id on it.`)
        }
        return(false);
    }

    _onIncreaseEquipmentQuantityClicked(evemt) {
        let element = event.currentTarget;

        event.preventDefault();
        if(element.dataset.id) {
            let actor = findActorFromItemId(element.dataset.id);
            if(actor) {
                this.incrementEquipmentQuantity(actor, element.dataset.id)
            } else {
                console.error(`Failed to find an actor that owns item id ${element.dataset.id}.`);
            }
        } else {
            console.error(`Element had no item id on it.`)
        }
        return(false);
    }

    _onRepairAllArmourDiceClicked(event) {
        let element = event.currentTarget;
        let actor   = game.actors.find(a => a.id === element.dataset.id);

        event.preventDefault();
        if(actor) {
            console.log("Repairing all armour dice for actor id ${actor.id}.");
            actor.data.items.forEach(function(item) {
                let data = {data: {armourValue: {broken: 0}}};

                if(item.type === "armour") {
                    if(item.data.data.armourValue.broken > 0) {
                      data.id = item.id;
                      item.update(data, {diff: true})
                    }
                }
            });
        } else {
            console.error(`Failed to find an actor with the id ${element.dataset.id}.`)
        }
        return(false);
    }

    _onRepairArmourDieClicked(event) {
        let element = event.currentTarget;

        event.preventDefault();
        if(element.dataset.id) {
            console.log(`Repairing of armour die on armour item id ${element.dataset.id}.`);
            let actor = findActorFromItemId(element.dataset.id);
            if(actor) {
                let item  = actor.items.find(i => i.id === element.dataset.id);

                if(item) {
                    if(item.data.data.armourValue.broken > 0) {
                        let data = {id: item.id,
                                    data: {
                                      armourValue: {
                                        broken: item.data.data.armourValue.broken - 1
                                    }}};

                        item.update(data, {diff: true});
                    }
                } else {
                    console.error(`Failed to find item id ${element.dataset.id}.`);
                }
            } else {
                console.error(`Failed to find an actor that owns item id ${element.dataset.id}.`);
            }
        } else {
            console.error(`Element had no item id on it.`)
        }
        return(false);
    }

    _onResetUsageDiceClicked(event) {
        let element = event.currentTarget;
        let actorId  = element.dataset.id;

        event.preventDefault();
        if(actorId) {
            let actor = game.actors.find(a => a.id === actorId);

            if(actor) {
                actor.items.forEach(item => this.resetUsageDie(actor, item.id));
            } else {
                console.error(`Unable to locate an actor wth the id ${actorId}.`);
            }
        } else {
            console.error("Actor id not found in element data set.");
        }
        return(false);
    }

    _onResetUsageDieClicked(event) {
        let element = event.currentTarget;
        let itemId  = element.dataset.id;

        event.preventDefault();
        if(itemId) {
            let actor = findActorFromItemId(itemId);

            if(actor) {
                this.resetUsageDie(actor, itemId);
            } else {
                console.error(`Unable to locate an owning actor for item id ${itemId}.`);
            }
        } else {
            console.error("Equipment element does not possess an item id.");
        }
        return(false);
    }

    _onRollAttackClicked(event) {
        let element = event.currentTarget;
        let actor   = findActorFromItemId(element.dataset.id);

        event.preventDefault();
        if(!event.altKey) {
            logAttackRoll(actor.id, element.dataset.id, event.shiftKey, event.ctrlKey);
        } else {
            AttackRollDialog.build(event).then((dialog) => dialog.render(true));
        }

        return(false);
    }

    _onRollAttributeTest(event) {
      let element = event.currentTarget;
      let actor   = game.actors.find(a => a.id === element.dataset.id);

      event.preventDefault();
      logAttributeTest(element.dataset.id, element.dataset.attribute, event.shiftKey, event.ctrlKey);
      return(false);
    }

    _onRollUsageDieClicked(event) {
        let element = event.currentTarget;

        event.preventDefault();
        logUsageDieRoll(element.dataset.id);
        return(false);
    }

    decrementEquipmentQuantity(actor, itemId) {
        let item = actor.items.find(i => i.id === itemId);

        if(item && item.type === "equipment") {
            let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
                if(itemData.quantity > 0) {
                    let data = {id: item.id,
                                data: {
                                  quantity: itemData.quantity - 1
                                }};
                    item.update(data, {diff: true});
                } else {
                    console.warn(`Unable to decrease quantity for the ${item.name} item (id: ${item.id}) as it's already at zero.`);
                }
            } else {
              console.warn(`Unable to increase quantity for the ${item.name} item (id ${item.name}) (${item.id}) as it does not have a usage die.`);
            }
        } else {
            if(!item) {
                console.error(`The actor '${actor.name}' (id ${actor.id}) does not appear to own item id ${itemId}.`);
            }
        }
    }

    incrementEquipmentQuantity(actor, itemId) {
        let item = actor.items.find(i => i.id === itemId);

        if(item && item.type === "equipment") {
            let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
                let data = {id: item.id,
                            data: {
                              quantity: itemData.quantity + 1
                            }};
                item.update(data, {diff: true});
            } else {
                console.warn(`Unable to increase quantity for item id ${item.name} (${item.id}) as it does not have a usage die.`);
            }
        } else {
            if(!item) {
                console.error(`The actor '${actor.name}' (id ${actor.id}) does not appear to own item id ${itemId}.`);
            }
        }
    }

    resetUsageDie(actor, itemId) {
        let item = actor.items.find(i => i.id === itemId);

        if(item && item.type === "equipment") {
            let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
                if(itemData.quantity > 0) {
                    if(itemData.usageDie.current !== itemData.usageDie.maximum) {
                        let data = {
                          _id: item.id,
                            data: {
                              usageDie: {
                                current: itemData.usageDie.maximum
                              }
                            }
                        };
                        item.update(data, {diff: true});
                    } else {
                      console.warn(`Unable to reset the usage die for item ${item.name} (id ${item.id}) as it's at it's maximum usage die.`);
                    }
                } else {
                  console.warn(`Unable to reset the usage die for item ${item.name} (id ${item.id}) as it's supply is depleted.`);
                  ui.notifications.error(interpolate("bh2e.messages.errors.supplyDepleted", {item: item.name}))
                }
            } else {
              console.warn(`Unable to reset the usage die for item id ${item.name} (${item.id}) as it does not have a usage die.`);
            }
        } else {
            if(!item) {
                console.error(`The actor '${actor.name}' (id ${actor.id}) does not appear to own item id ${itemId}.`);
            }
        }
    }
}
