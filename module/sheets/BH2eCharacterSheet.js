import {deleteOwnedItem, findActorFromItemId, generateDieRollFormula, interpolate} from '../shared.js';

export default class BH2eCharacterSheet extends ActorSheet {
	static get defaultOptions() {
	    return(mergeObject(super.defaultOptions,
	    	               {classes: ["bh2e", "sheet", "character"],
	    	               	template: "systems/bh2e/templates/sheets/character-sheet.html"}));
	}

	getData() {
		let data = super.getData();
		data.config    = CONFIG.bh2e;
		data.abilities = data.items.filter((i) => i.type === "ability").sort(function(lhs, rhs) {
			if(lhs.name > rhs.name) {
				return(1);
			} else if(lhs.name < rhs.name) {
				return(-1);
			} else {
				return(0);
			}
		});
		data.classes   = data.items.filter((i) => i.type === "class");
		data.armour    = data.items.filter((i) => i.type === "armour");
		data.equipment = data.items.filter((i) => i.type === "equipment");
		data.weapons   = data.items.filter((i) => i.type === "weapon");
		return(data);
	}

	activateListeners(html) {
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
		super.activateListeners(html);
	}

	_onBreakArmourDieClicked(event) {
		event.preventDefault();

		let element = event.currentTarget;
		if(element.dataset.id) {
			console.log(`Breakage of armour die on armour item id ${element.dataset.id}.`);
			let actor = findActorFromItemId(element.dataset.id);
			if(actor) {
				let item  = actor.items.find(i => i._id === element.dataset.id);

				if(item) {
					if(item.data.data.armourValue.total > item.data.data.armourValue.broken) {
						let data = {_id: item._id,
						            data: {
						            	armourValue: {
						            		broken: item.data.data.armourValue.broken + 1
						            }}};

						actor.updateOwnedItem(data, {diff: true});
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
		event.preventDefault();

		let element = event.currentTarget;
		if(element.dataset.id) {
			deleteOwnedItem(element.dataset.id);
        } else {
        	console.error("Delete item called for but item id is not present on the element.");
        }
        return(false);
	}

	_onDecreaseEquipmentQuantityClicked(evemt) {
		event.preventDefault();

		let element = event.currentTarget;
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
		event.preventDefault();

		let element = event.currentTarget;
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
		event.preventDefault();

		let element = event.currentTarget;
		let actor   = game.actors.find(a => a._id === element.dataset.id);

		if(actor) {
			console.log("Repairing all armour dice for actor id ${actor._id}.");
			actor.data.items.forEach(function(item) {
				let data = {data: {
					                armourValue: {
					                	broken: 0
					                }
				                }};

                if(item.type === "armour") {
					if(item.data.armourValue.broken > 0) {
						data._id = item._id;
						actor.updateOwnedItem(data, {diff: true});
					}
				}
			});
		} else {
			console.error(`Failed to find an actor with the id ${element.dataset.id}.`)
		}
		return(false);
	}

	_onRepairArmourDieClicked(event) {
		event.preventDefault();

		let element = event.currentTarget;
		if(element.dataset.id) {
			console.log(`Repairing of armour die on armour item id ${element.dataset.id}.`);
			let actor = findActorFromItemId(element.dataset.id);
			if(actor) {
				let item  = actor.items.find(i => i._id === element.dataset.id);

				if(item) {
					if(item.data.data.armourValue.broken > 0) {
						let data = {_id: item._id,
						            data: {
						            	armourValue: {
						            		broken: item.data.data.armourValue.broken - 1
						            }}};

						actor.updateOwnedItem(data, {diff: true});
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
		event.preventDefault();

		let element = event.currentTarget;
		let actorId  = element.dataset.id;

		if(actorId) {
			let actor = game.actors.find(a => a._id === actorId);

            if(actor) {
			    actor.items.forEach(item => this.resetUsageDie(actor, item._id));
            } else {
            	console.error(`Unable to locate an actor wth the id ${actorId}.`);
            }
		} else {
			console.error("Actor id not found in element data set.");
		}
		return(false);
	}

	_onResetUsageDieClicked(event) {
		event.preventDefault();

		let element = event.currentTarget;
		let itemId  = element.dataset.id;

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
		event.preventDefault();

		let element       = event.currentTarget;
		let attackRoll    = null;
		let damageRoll    = null;
		let formula       = null;
		let isCritical    = false;
		let isHit         = false;
		let isLargeWeapon = (element.dataset.size === "large");
        let actor         = findActorFromItemId(element.dataset.id);
        let message       = {speaker: ChatMessage.getSpeaker(),
        	                 user: game.user._id};

        if(event.shiftKey) {
        	formula = generateDieRollFormula({kind: "advantage"});
        } else if(event.ctrlKey) {
        	formula = generateDieRollFormula({kind: "disadvantage"});
        } else {
        	formula = generateDieRollFormula();
        }
        if(isLargeWeapon) {
        	formula = `${formula}+1d4`;
        }
        attackRoll = new Roll(formula);
        attackRoll.roll();

        if(attackRoll.total === 1 || attackRoll.total < actor.data.data.attributes[element.dataset.attribute]) {
        	isCritical = (attackRoll.results[0] === 1);
        	isHit      = true;
        }

        if(isHit) {
        	if(element.dataset.kind === "unarmed") {
        		formula = generateDieRollFormula({dieType: actor.data.data.damageDice.unarmed});
        	} else {
        		formula = generateDieRollFormula({dieType: actor.data.data.damageDice.armed});
        	}
        	if(isLargeWeapon) {
        		formula = `${formula}+${generateDieRollFormula({dieType: "d4"})}`;
        	}
        	if(isCritical) {
        		formula = `(${formula})*2`;
        	}
        	damageRoll = new Roll(formula);
        }

        message.content = interpolate("bh2e.messages.attacking", {name: actor.name, weapon: element.dataset.name});
        ChatMessage.create(message);
        attackRoll.toMessage({speaker: ChatMessage.getSpeaker(), user: game.user._id});

        if(isHit) {
        	if(isCritical) {
        		message.content = game.i18n.localize("bh2e.messages.criticalHit");
        	} else {
        		message.content = game.i18n.localize("bh2e.messages.normalHit");
        	}
        	ChatMessage.create(message);
        	damageRoll.toMessage({speaker: ChatMessage.getSpeaker(), user: game.user._id});
        } else {
        	message.content = game.i18n.localize("bh2e.messages.attackMiss");
        	ChatMessage.create(message);
        }

		return(false);
	}

	_onRollAttributeTest(event) {
		event.preventDefault();

		let element = event.currentTarget;
		let actor   = game.actors.find(a => a._id === element.dataset.id);

		if(actor) {
			let attributeValue = actor.data.data.attributes[element.dataset.attribute];
			let attributeName  = game.i18n.localize(`bh2e.fields.labels.attributes.${element.dataset.attribute}.long`);
			let roll           = null;

			ChatMessage.create({content: interpolate("bh2e.messages.rollingAttributeTest",
				                                          {attribute: attributeName,
				                                           name: actor.name}),
								speaker: ChatMessage.getSpeaker(),
					        	user: game.user._id});


			if(event.shiftKey) {
				roll = new Roll("2d20kl");
			} else if(event.ctrlKey) {
				roll = new Roll("2d20kh");
			} else {
				roll = new Roll("1d20");
			}
	        roll.roll();
	        roll.toMessage({speaker: ChatMessage.getSpeaker(),
	                        user: game.user._id});

	        if(roll.total < attributeValue) {
				ChatMessage.create({content: game.i18n.localize("bh2e.messages.attributeTestSuccess"),
									speaker: ChatMessage.getSpeaker(),
						        	user: game.user._id});
	        } else {
				ChatMessage.create({content: game.i18n.localize("bh2e.messages.attributeTestFailed"),
									speaker: ChatMessage.getSpeaker(),
						        	user: game.user._id});
	        }
		} else {
			console.error(`Unable to find actor for the id ${element.dataset.id} for attribute test.`);
		}
		return(false);
	}

	_onRollUsageDieClicked(event) {
		event.preventDefault();
		let element = event.currentTarget;

		if(element.dataset.id) {
			let actor = findActorFromItemId(element.dataset.id);

			if(actor) {
				let item = actor.items.find(i => i._id === element.dataset.id);

				if(item) {
        	        let usageDie = item.data.data.usageDie;
        	        if(usageDie.current !== "exhausted") {
	        	        let die  = (usageDie.current === "none" ? usageDie.maximum : usageDie.current)
	        	        let roll = new Roll(generateDieRollFormula({dieType: die}));

	        	        ChatMessage.create({content: interpolate("bh2e.messages.rollingUsageDie", {name: item.name}),
							                speaker: ChatMessage.getSpeaker(),
	        	                            user: game.user._id});

	        	        roll.roll();
	        	        roll.toMessage({speaker: ChatMessage.getSpeaker(),
	        	                        user: game.user._id});

	        	        if(roll.total < 3) {
	        	        	let data     = {_id: item.id,
	        	        	                data: {
	        	        	            	    usageDie: {
	        	        	            	 	   current: ""
	        	        	            	    }
	        	        	                }};
                            let oldDie  = (usageDie.current  === "none" ? usageDie.maximum : usageDie.current);

	        	        	if(oldDie === "d4") {
	        	        		ChatMessage.create({content: interpolate("bh2e.messages.usageDieExhausted", {name: item.name}),
	        	        		                    speaker: ChatMessage.getSpeaker(),
	        	                                    user: game.user._id});
	        	        		data.data.usageDie.current = "exhausted";
	        	        		data.data.quantity = item.data.data.quantity - 1;
	        	        		if(data.data.quantity < 0) {
	        	        			data.data.quantity = 0;
	        	        		}
	        	        	} else {
	        	        		switch(oldDie) {
	        	        			case "d6":
	        	        			    data.data.usageDie.current = "d4";
	        	        			    break;
	        	        			case "d8":
	        	        			    data.data.usageDie.current = "d6";
	        	        			    break;
	        	        			case "d10":
	        	        			    data.data.usageDie.current = "d8";
	        	        			    break;
	        	        			case "d12":
	        	        			    data.data.usageDie.current = "d10";
	        	        			    break;
	        	        			case "d20":
	        	        			    data.data.usageDie.current = "d12";
	        	        			    break;
	        	        		}
	        	        		ChatMessage.create({content: interpolate("bh2e.messages.reducingUsageDie", {die: `1${data.data.usageDie.current}`}),
	        	        	                        speaker: ChatMessage.getSpeaker(),
	        	                                    user: game.user._id});
	        	        	}
	        	        	actor.updateOwnedItem(data, {diff: true});
	        	        }

						console.log("ITEM:", item);
					}
				} else {
					console.error(`Failed to locate the equipment for the id ${element.dataset.id} on actor id ${actor._id}.`)
				}
			} else {
				console.error(`Failed to find the actor that owns equipment id ${element.dataset.id}.`);
			}
		} else {
			console.error("No equipment id specified on target element.");
		}
		return(false);
	}

	decrementEquipmentQuantity(actor, itemId) {
		let item = actor.items.find(i => i._id === itemId);

		if(item && item.type === "equipment") {
			let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
            	if(itemData.quantity > 0) {
	            	let data = {_id: item._id,
	            	            data: {
	            	            	quantity: itemData.quantity - 1
	            	            }};
	            	actor.updateOwnedItem(data, {diff: true});
	            } else {
	            	console.warn(`Unable to decrease quantity for the ${item.name} item (id: ${item._id}) as it's already at zero.`);
	            }
			} else {
				console.warn(`Unable to increase quantity for the ${item.name} item (id ${item.name}) (${item._id}) as it does not have a usage die.`);
			}
		} else {
			if(!item) {
			    console.error(`The actor '${actor.name}' (id ${actor._id}) does not appear to own item id ${itemId}.`);
			}
		}
	}

	incrementEquipmentQuantity(actor, itemId) {
		let item = actor.items.find(i => i._id === itemId);

		if(item && item.type === "equipment") {
			let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
            	let data = {_id: item._id,
            	            data: {
            	            	quantity: itemData.quantity + 1
            	            }};
            	actor.updateOwnedItem(data, {diff: true});
			} else {
				console.warn(`Unable to increase quantity for item id ${item.name} (${item._id}) as it does not have a usage die.`);
			}
		} else {
			if(!item) {
			    console.error(`The actor '${actor.name}' (id ${actor._id}) does not appear to own item id ${itemId}.`);
			}
		}
	}

	resetUsageDie(actor, itemId) {
		let item = actor.items.find(i => i._id === itemId);

		if(item && item.type === "equipment") {
			let itemData = item.data.data;

            if(itemData.usageDie && itemData.usageDie.maximum !== "none") {
				if(itemData.quantity > 0) {
					if(itemData.usageDie.current !== itemData.usageDie.maximum) {
						let data = {
							_id: item._id,
						    data: {
						    	usageDie: {
						    		current: itemData.usageDie.maximum
						    	}
						    }
						};
						actor.updateOwnedItem(data, {diff: true});
					} else {
						console.warn(`Unable to reset the usage die for item ${item.name} (id ${item._id}) as it's at it's maximum usage die.`);
					}
				} else {
					console.warn(`Unable to reset the usage die for item ${item.name} (id ${item._id}) as it's supply is depleted.`);
				}
			} else {
				console.warn(`Unable to reset the usage die for item id ${item.name} (${item._id}) as it does not have a usage die.`);
			}
		} else {
			if(!item) {
			    console.error(`The actor '${actor.name}' (id ${actor._id}) does not appear to own item id ${itemId}.`);
			}
		}
	}
}
