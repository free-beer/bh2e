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
            console.log("Resetting initiative scores between rounds.");
            for(let combatant of this.combatants) {
                ids.push(combatant.id);
            }
            await this.rollInitiative(ids);
            await this._pushRoundInitiatives(this.round);
        } else {
            // Re-apply the initiative scores for the appropriate round.
            await this._applyRoundInitiatives(roundIndex);
        }

        return(this.update({combatants: this.combatants.toJSON(), round: this.round + 1, turn: 0}));
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
        let results = this._rollCombatantInitiatives(ids);
        let changes = [];


        for(let i = 0; i < results.length; i++) {
            changes.push({_id: results[i].id, initiative: results[i].initiative});
        }

        await this.updateEmbeddedDocuments("Combatant", changes);
        this._createChatMessages(results, messageOptions)
            .then(async (messages) => {
                if(messages.length > 0) {
                    console.log(`There are ${messages.length} chat messages.`, messages);
                    await ChatMessage.implementation.create(messages);
                }
            });

        return(this.update({combatants: this.combatants.toJSON(), round: this.round, turn: this.turn}));
    }

    /**
     * Called to start a combat.
     */
    async startCombat() {
        let initiatives = {};

        console.log("Starting a new combat.");
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

        console.log("Previous round method called.");
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
        let results = [];

        for(let i = 0; i < combatantIds.length; i++) {
            let result    = {combatant: this.combatants.get(combatantIds[i]),
                             id:        combatantIds[i]};

            if(result.combatant.actor.type === "character") {
                let dexterity = result.combatant.actor.data.data.attributes.dexterity;

                result.roll = new Roll("1d20");
                result.roll.roll();
                result.initiative = (result.roll.total < dexterity ? 1 : 3);
            } else {
                result.initiative = 2;
            }
            results.push(result);
        }

        return(results);
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

        if(c2.actor.type === "character") {
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

        console.log("Adding a set of initiative scores to the initiative round history.");
        for(let combatant of this.combatants) {
            initiatives[combatant.id] = combatant.initiative;
        }
        if(roundIndex && roundIndex < history.length) {
            console.log(`Storing history for round number ${roundIndex + 1}.`);
            history[roundIndex] = initiatives;
        } else {
            console.log(`Storing history for round number ${history.length + 1}.`);
            history.push(initiatives);
        }
        await this.setFlag("bh2e", "roundHistory", history);
    }
}
