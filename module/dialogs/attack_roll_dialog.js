/**
 * This class provides the advanced attack roll dialog for the system.
 */
export default class AttackRollDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 275}));
    }

	constructor(settings) {
        let buttons = {attack: {callback: () => this._rollAttack(),
                                label: game.i18n.localize("bh2e.buttons.roll")}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actorId  = settings.actorId;
        this._weaponId = settings.weaponId;
	}

    get actor() {
        let actor = game.actors.find((a) => a.id === this._actorId);

        if(!actor) {
            throw(`Unable to locate an actor with the id '${this._actorId}'.`);
        }

        return(actor);
    }

    get actorId() {
        return(this._actorId);
    }

    get weapon() {
        let weapon = this.actor.items.find((i) => i.type === "weapon" && i.id === this._weaponId);

        if(!weapon) {
            throw(`Unable to locate a weapon with the id '${this._weaponId}'.`);
        }

        return(weapon);
    }

    get weaponId() {
        return(this._weaponId);
    }

    _rollAttack() {
        let actor  = this.actor;
        let data   = {actorId:       actor.id,
                      actorName:     actor.name,
                      attribute:     this.attribute,
                      bonusDice:     this.bonusDice,
                      combatAbility: this.combatAbility,
                      defence:       this.defence,
                      penaltyDice:   this.penaltyDice,
                      rangeModifier: this.rangeModifier,
                      weaponType:    this.combatAbility,
                      weaponUsed:    false};
        let dice;

        data.formula = generateAttackRollFormula(actor.id,
                                                 data.attribute,
                                                 data.combatAbility,
                                                 data.bonusDice,
                                                 data.penaltyDice,
                                                 data.defence,
                                                 data.rangeModifier);
        data.roll   = new Roll(data.formula);

        if(this.weaponId) {
            let weapon = this.weapon;

            data.weaponId   = weapon.id;
            data.weaponName = weapon.name;
            data.weaponUsed = true;
        }

        rollIt(data.roll)
            .then((roll) => {
                data.dice        = roll.dice;
                data.resultLevel = getRollResultLevel(roll);
                data.rollTotal   = roll.total;
                showMessage("systems/bh2e/templates/chat/attack-roll.html", data);
            });
    }

    static build(event, options={}) {
        let element = event.currentTarget;
        let actor   = game.actors.find((a) => a.id === element.dataset.actor);

        event.preventDefault();
        settings.title = game.i18n.localize(`bh2e.dialogs.titles.attackRoll`);
        if(actor) {
            let weaponId   = element.dataset.id;
            let weapon     = actor.items.find((i) => i.id === weaponId);
            let settings   = Object.assign({}, options);
            let data       = {actorId:       actor.id,
                              actorName:     actor.name,
                              advantage:     (event.shiftKey && !event.ctrlKey),
                              disadvantage:  (event.ctrlKey && !event.shiftKey),
                              modifier:      0,
                              weaponId:      weaponId,
                              weaponKind:    (weapon ? weapon.data.data.kind : "melee"),
                              weaponName:    (weapon ? weapon.name : ""),
                              weaponUsed:    (weapon ? true : false)};

            settings.title    = game.i18n.localize(`bh2e.dialogs.titles.attackRoll`);
            settings.actorId  = actor.id;
            settings.weaponId = weaponId;
            return(renderTemplate("systems/bh2e/templates/dialogs/attack-roll-dialog.html", data)
                       .then((content) => {
                                 settings.content = content;
                                 return(new AttackRollDialog(settings));
                             }));
        } else {
            console.error(`Unable to locate actor id '${actor.id}'.`);
        }
    }
}
