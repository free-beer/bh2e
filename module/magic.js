import {findActorFromItemId, generateDieRollFormula, interpolate} from './shared.js';

export function castMagic(event) {
    let element = event.currentTarget;
    let actor   = findActorFromItemId(element.dataset.id);

    event.preventDefault();
    event.stopPropagation();
    console.log(`The castMagic() function was invoked with an item id of ${element.dataset.id}.`);
    if(actor) {
        let result  = invokeMagic(element.dataset.id, actor);
        let message = {speaker: ChatMessage.getSpeaker(),
                       user:    game.user._id};
        let data    = {_id:  element.dataset.id,
                       data: {cast:     false,
                              prepared: false}};
        let total   = result.attributeRoll + result.spellLevel;

        console.log(`Attribute Test: Roll=${result.attributeRoll}, Level=${result.spellLevel}, Total=${result.attributeRoll + result.spellLevel}`);
        if(result.successful) {
            message.content    = interpolate("bh2e.messages.castMagicKept", {name: actor.name, spell: result.spellName, total: total});
            data.data.cast     = true;
            data.data.prepared = true;
        } else {
            message.content = interpolate("bh2e.messages.castMagicLost", {name: actor.name, spell: result.spellName, total: total});
        }
        ChatMessage.create(message);
        actor.updateOwnedItem(data, {diff: true});
    } else {
        console.error(`Failed to locate an actor linked to item id ${element.dataset.id}.`)
    }

    return(false);
}

export function castMagicAsRitual(event) {
    let element = event.currentTarget;
    let actor   = findActorFromItemId(element.dataset.id);

    event.preventDefault();
    event.stopPropagation();
    console.log(`The castMagicAsRitual() function was invoked with an item id of ${element.dataset.id}.`);
    if(actor) {
        let result  = invokeMagic(element.dataset.id, actor);
        let message = {speaker: ChatMessage.getSpeaker(),
                       user:    game.user._id};
        let total   = result.attributeRoll + result.spellLevel;

        if(result.successful) {
            message.content = interpolate("bh2e.messages.castMagicRitualSuccess", {name: actor.name, spell: result.spellName, total: total});
        } else {
            message.content = interpolate("bh2e.messages.castMagicRitualFail", {name: actor.name, spell: result.spellName, total: total});
        }
        ChatMessage.create(message);
    } else {
        console.error(`Failed to locate an actor linked to item id ${element.dataset.id}.`)
    }
}

function invokeMagic(magicId, caster) {
    let attributeTest = null;
    let attribute     = null;
    let magic         = caster.items.get(magicId);
    let options       = {};
    let result        = {attributeRoll: 0,
                         rollType:      "standard",
                         spellLevel:    parseInt(magic.data.data.level),
                         spellName:     magic.name,
                         successful:    false}
    let successful    = false;
    let total         = 0;

    if(event.shiftKey) {
        if(!magic.data.data.cast) {
            options.kind = result.rollType = "advantage";
        }
    } else if(event.ctrlKey || magic.data.data.cast) {
        options.kind = result.rollType = "disadvantage";
    }
    attribute     = (magic.data.data.kind === "prayer" ? "wisdom" : "intelligence");
    attributeTest = new Roll(generateDieRollFormula(options))
    attributeTest.roll();
    result.attributeRoll = attributeTest.total;
    result.successful    = (result.attributeRoll + result.spellLevel) < caster.data.data.attributes[attribute];

    return(result);
}

export function prepareMagic(event) {
    let element = event.currentTarget;
    let actor   = findActorFromItemId(element.dataset.id);

    event.preventDefault();
    event.stopPropagation();
    console.log(`The prepareMagic() function was invoked with an item id of ${element.dataset.id}.`);
    if(actor) {
        let data = {_id:  element.dataset.id,
                    data: {cast:     false,
                           prepared: true}};

        actor.updateOwnedItem(data, {diff: true});
    } else {
        console.error(`Failed to locate an actor linked to item id ${element.dataset.id}.`)
    }
}


export function unprepareMagic(event) {
    let element = event.currentTarget;
    let actor   = findActorFromItemId(element.dataset.id);

    event.preventDefault();
    event.stopPropagation();
    console.log(`The unprepareMagic() function was invoked with an item id of ${element.dataset.id}.`);
    if(actor) {
        let data = {_id:  element.dataset.id,
                    data: {cast:     false,
                           prepared: false}};

        actor.updateOwnedItem(data, {diff: true});
    } else {
        console.error(`Failed to locate an actor linked to item id ${element.dataset.id}.`)
    }
}
