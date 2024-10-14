export default class BH2eCombat extends Combat {
    /**
     * Called to advance a combat to the next round.
     */
    async nextRound() {
        let roundIndex   = this.round;
        let roundHistory = (this.getFlag("bh2e", "roundHistory") || []);

        if(roundIndex < 0 || roundIndex >= roundHistory.length) {
            let ids = [];

            // Reset all initiative score.
            for(let combatant of this.combatants) {
                ids.push(combatant.id);
            }
            this.rollInitiative(ids)
                .then(() => this._pushRoundInitiatives(this.round))
                .then(() => this.update({combatants: this.combatants.toJSON(), round: this.round + 1, turn: 0}));
        } else {
            // Re-apply the initiative scores for the appropriate round.
            this._applyRoundInitiatives(roundIndex)
                .then(() => this.update({combatants: this.combatants.toJSON(), round: this.round + 1, turn: 0}));
        }
    }

    /**
     * Called to regress a combat to the previous round.
     */
    async previousRound() {
        let roundIndex   = this.round - 2;
        let roundHistory = (this.getFlag("bh2e", "roundHistory") || []);

        if(roundIndex >= 0 && roundIndex < roundHistory.length) {
            await this._applyRoundInitiatives(roundIndex);
            return(this.update({combatants: this.combatants.toJSON(), round: roundIndex + 1, turn: this.combatants.size - 1}));
        } else {
            // Fallback on the default.
            return(super.previousRound());
        }
    }

    /**
     * Generate initiative values for a collection of combatants.
     */
    async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
        let results;

        return(this._rollCombatantInitiatives(ids)
                    .then((rolls) => {
                        results = rolls;
                        return(rolls.map((e) => {
                            return({_id: e.id, initiative: e.initiative});
                        }));
                    })
                    .then((changes) => {
                        return(this.updateEmbeddedDocuments("Combatant", changes))
                    })
                    .then(() => this._createChatMessages(results, messageOptions))
                    .then((messages) => {
                        if(messages.length > 0) {
                            console.log(`There are ${messages.length} chat messages.`, messages);
                            ChatMessage.implementation.create(messages);
                        }                
                    })
                    .then(() => this.update({combatants: this.combatants.toJSON(), round: this.round, turn: this.turn})));
    }

    /**
     * Called to start a combat.
     */
    async startCombat() {
        let initiatives = {};

        await this._pushRoundInitiatives();

        return(super.startCombat());
    }

    async _applyRoundInitiatives(roundIndex) {
        let roundHistory = (this.getFlag("bh2e", "roundHistory") || []);

        if(roundIndex >= 0 && roundIndex < roundHistory.length) {
            let changes = [];
            let scores  = roundHistory[roundIndex];
            let ids     = Object.keys(scores);

            // Set the initiative scores as per the relevant history entry.
            for(let i = 0; i < ids.length; i++) {
                changes.push({_id: ids[i], initiative: scores[ids[i]]});
            }
            console.log(`Apply initiative scores for round ${roundIndex + 1}.`);
            await this.updateEmbeddedDocuments("Combatant", changes);
        } else {
            console.error(`Requested application of initiative scores for round number ${roundIndex + 1} but these are not in the history.`);
        }
    }

    /**
     * Generates a collection of messages entities relating to initiative rolls.
     */
    async _createChatMessages(results, messageOptions={}) {
        let messages    = [];
        let rollMode  = messageOptions.rollMode || game.settings.get("core", "rollMode");

        rollMode = (rollMode === "roll" ? "gmroll" : rollMode);
        for(let i = 0; i < results.length; i++) {
            if(results[i].roll) {
                let combatant   = results[i].combatant;
                let messageData = foundry.utils.mergeObject({speaker: {scene: this.scene.id,
                                                                       actor: combatant.actor?.id,
                                                                       token: combatant.token?.id,
                                                                       alias: combatant.name},
                                                             flavor: game.i18n.format("bh2e.initiative.roll"),
                                                             flags: {"core.initiativeRoll": true}
                                                            }, messageOptions);
                const chatData  = await results[i].roll.toMessage(messageData, {create: false,
                                                                  rollMode: combatant.hidden && rollMode});
                messages.push(chatData);
            }
        }

        return(messages);
    }

    /**
     * Generates an array of initiative roll results.
     */
    _rollCombatantInitiatives(combatantIds) {
        let list = combatantIds.map((id) => {
                    let combatant = this.combatants.get(id);
        
                    if(combatant.actor && combatant.actor.type === "character") {
                        let dexterity = combatant.actor.system.attributes.dexterity;
                        let roll      = new Roll("1d20");
        
                        return(roll.evaluate()
                                   .then(() => {
                                       return({combatant: combatant, id: id, initiative: (roll.total < dexterity ? 1 : 3), roll: roll});
                                   }));
                    } else {
                        return({combatant: combatant, id: id, initiative: 2});
                    }
                });

        return(Promise.all(list));
    }

    /**
     * Used to provide sort order for combatants.
     */
    _sortCombatants(c1, c2) {
        const scores = [0, 0];

        if(c1.actor.type === "character") {
            scores[0] = Number.isNumeric(c1.initiative) ? c1.initiative : 1;
        } else {
            scores[0] = 2;
        }

        if(c2.actor && c2.actor.type === "character") {
            scores[1] = Number.isNumeric(c2.initiative) ? c2.initiative : 1;
        } else {
            scores[1] = 2;
        }

        return(scores[0] - scores[1]);
    }

    /**
     * Grab the current initiative scores and push them into history storage.
     */
    async _pushRoundInitiatives(roundIndex=null) {
        let initiatives = {};
        let history     = (this.getFlag("bh2e", "roundHistory") || []).slice();

        for(let combatant of this.combatants) {
            initiatives[combatant.id] = combatant.initiative;
        }
        if(roundIndex && roundIndex < history.length) {
            history[roundIndex] = initiatives;
        } else {
            history.push(initiatives);
        }
        await this.setFlag("bh2e", "roundHistory", history);
    }
}
