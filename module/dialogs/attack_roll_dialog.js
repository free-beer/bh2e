import {logAttackRoll} from "../chat_messages.js";

/**
 * This class provides the advanced attack roll dialog for the system.
 */
export default class AttackRollDialog extends Dialog {
    static get defaultOptions() {
        return(mergeObject(super.defaultOptions,
                           {width: 325}));
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

    get advantage() {
        return(this.element[0].querySelector('input[name="advantage"]').checked);
    }

    get disadvantage() {
        return(this.element[0].querySelector('input[name="disadvantage"]').checked);
    }

    get modifier() {
        return(parseInt(this.element[0].querySelector('input[name="modifier"]').value));
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
        let options = {advantage:    this.advantage,
                       disadvantage: this.disadvantage,
                       modifier:     this.modifier};

        logAttackRoll(this.actorId, this.weaponId, options);
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
