/**
 * Deletes an owned item from an actor using just the item id to locate the
 * owning actor and the item itself.
 */
export function deleteOwnedItem(itemId) {
    console.log(`Delete of item id ${itemId} requested.`);
    let actor = findActorFromItemId(itemId);

    if(actor) {
        actor.deleteEmbeddedEntity("OwnedItem", itemId);
    } else {
        console.error(`Delete of item id ${itemId} requested but unable to locate the actor that owns it.`);
    }
}

/**
 * Searches the game actor list to locate the actor that owns an item with a
 * specified itemId.
 */
export function findActorFromItemId(itemId) {
  return(game.actors.find((a) => {
        if(a.items.find(i => i._id === itemId)) {
          return(true);
        } else {
          return(false);
        }
      }));
}

/**
 * Generates a string containing the formula for a single die based on the set
 * of options passed in. Recognised options include dieType, which defaults to
 * d20 if not set, and kind which should be one of 'standard', 'advantage' or
 * 'disadvantage' to generate a formula of the appropriate type ('standard' will
 * be assumed if kind if not explicitly set).
 */
export function generateDieRollFormula(options={}) {
    let formula = null;
    let dieType = (options.dieType ? options.dieType : "d20");
    let kind    = (options.kind ? options.kind : "standard");

    switch(dieType) {
        case "one":
            formula = "1";
            break;
        case "d4":
        case "d6":
        case "d8":
        case "d10":
        case "d12":
        case "d20":
            formula = `${dieType}`;
            break;
    }

    if(kind === "advantage") {
        if(formula !== "1") {
          formula = `2${formula}kl`;
        } else {
          formula = "2";
        }
    } else if(kind === "disadvantage") {
        if(formula !== "1") {
          formula = `2${formula}kh`;
        }
    } else {
        if(formula !== "1") {
          formula = `1${formula}`;
        }
    }

    return(formula);
}

/**
 * A function that combines localization of a message with interpolation of
 * context specific details. The localized string can have place holders within
 * it's content that consist of a name enclosed in a set of '%' characters. The
 * names in the localized string should be all upper case to make them stand out.
 * The function also accepts a context parameter that is expected to be a JS
 * object being used as a hash/dictionary. The values of this object will be
 * the value interpolated into the localized string though the names in the
 * context need not be all upper case.
 */
export function interpolate(key, context={}) {
    let text = game.i18n.localize(key);

    for(let name in context) {
      text = text.replace(`%${name.toUpperCase()}%`, context[name]);
    }

    return(text);
}
