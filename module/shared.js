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
 * Searches the game item list to a specific item.
 */
export function findItemFromId(itemId) {
    return(game.items.find((item) => item._id === itemId));
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
 * Initializes a collapse widget element based on it's settings.
 */
export function initializeCollapsibleWidget(element, state) {
    let key       = element.dataset.key;
    let setting   = element.dataset.state;
    let icons     = [element.querySelector(".bh2e-expand-icon"),
                     element.querySelector(".bh2e-collapse-icon")];
    let container = null;
    let parent    = element;

    while(parent && !parent.classList.contains("bh2e-collapsible-container")) {
        parent = parent.parentElement;
    }

    if(!parent) {
        console.error("Failed to locate a parent of", element, "that has the 'bh2e-collapsible-container' class.");
        throw(`Failed to locate an element with the class 'bh2e-collapsible-container' for a toggle collapsible widget entry.`);
    }

    container = parent.querySelector(".bh2e-collapsible");
    if(!container) {
        console.error("Failed to locate a child of", parent, "that has the 'bh2e-collapsible' class.");
        throw(`Failed to locate an element with the class 'bh2e-collapsible' for a toggle collapsible widget entry.`);
    }

    if(state.exists(key))  {
        console.log("Fetching the state.");
        setting = state.get(key);
    } else {
        console.log("Assigning the state.");
        state.set(key, setting);
    }

    if(setting === "expanded") {
        container.classList.remove("bh2e-hidden");
        icons[0].classList.add("bh2e-hidden");
        icons[1].classList.remove("bh2e-hidden");
    } else {
        container.classList.add("bh2e-hidden");
        icons[0].classList.remove("bh2e-hidden");
        icons[1].classList.add("bh2e-hidden");
    }
    element.addEventListener("click", () => toggleCollapsibleWidget(element, state));
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
        while(text.includes(`%${name.toUpperCase()}%`)) {
            text = text.replace(`%${name.toUpperCase()}%`, `${context[name]}`);
        }
    }

    return(text);
}

export function onTabSelected(event, state, key) {
    let selected    = event.currentTarget;
    let tabs        = document.querySelectorAll(".bh2e-tab");
    let tabContents = document.querySelectorAll(".bh2e-tab-content");
    let className   = selected.dataset.tab;

    event.preventDefault();

    for(var t = 0; t < tabs.length; t++) {
        tabs[t].classList.remove("bh2e-selected-tab");
    }

    for(var i = 0; i < tabContents.length; i++) {
        if(tabContents[i].classList.contains(className)) {
            tabContents[i].classList.remove("bh2e-hidden");
        } else {
            tabContents[i].classList.add("bh2e-hidden");
        }
    }
    state.set(key, className);
    selected.classList.add("bh2e-selected-tab");
}

function toggleCollapsibleWidget(widget, state) {
    let container    = widget;
    let collapseIcon = widget.querySelector(".bh2e-collapse-icon");
    let expandIcon   = widget.querySelector(".bh2e-expand-icon");
    let setting      = state.get(widget.dataset.key, widget.dataset.state);

    while(container && !container.classList.contains("bh2e-collapsible-container")) {
        container = container.parentElement;
    }

    if(container) {
        let target = container.querySelector(".bh2e-collapsible");

        if(target) {
            if(setting === "expanded") {
                target.classList.add("bh2e-hidden");
                collapseIcon.classList.add("bh2e-hidden");
                expandIcon.classList.remove("bh2e-hidden");
                widget.dataset.state = "collapsed";
            } else {
                target.classList.remove("bh2e-hidden");
                collapseIcon.classList.remove("bh2e-hidden");
                expandIcon.classList.add("bh2e-hidden");
                widget.dataset.state = "expanded";
            }
            state.set(widget.dataset.key, widget.dataset.state);
        } else {
            console.error("Failed to find an element with the class bh2e-collapsible");
        }
    } else {
        console.error("Failed to find a parent element with the class 'bh2e-collapsible-container'.");
    }
}

export function toggleAttributeTestDisplay(event) {
    let element = event.currentTarget;
    let parent  = element.parentElement;

    event.preventDefault();
    if(parent) {
        let details = parent.querySelector(".bh2e-roll-details");

        if(details) {
            if(details.classList.contains("bh2e-hidden")) {
                details.classList.remove("bh2e-hidden");
            } else {
                details.classList.add("bh2e-hidden");
            }
        }
    }
}

function initializeTabs(state) {
    let tabContainers = document.querySelectorAll(".bh2e-tabs-container");

    console.log(`Found ${tabContainers.length} tab containers.`);
    for(var i = 0; i < tabContainers.length; i++) {
        let container = tabContainers[i];
        let tabs      = container.querySelectorAll(".bh2e-tab");
        let selected  = state.get(container.dataset.key, container.dataset.default);

        for(var j = 0; j < tabs.length; j++) {
            let tab     = tabs[j];
            let content = document.querySelector(`.${tab.dataset.tab}`);

            tab.dataset.key = container.dataset.key;
            if(tab.dataset.tab === selected) {
                content.classList.remove("bh2e-hidden");
                tab.classList.add("bh2e-selected-tab");
            } else {
                content.classList.add("bh2e-hidden");
                tab.classList.remove("bh2e-selected-tab");
            }
            tab.addEventListener("click", (e) => onTabSelected(e, state, container.dataset.key));
        }
    }
}

export function initializeCharacterSheetUI(state) {
    let toggleWidgets = document.querySelectorAll(".bh2e-toggle-collapse-widget");

    for(var i = 0; i < toggleWidgets.length; i++) {
        initializeCollapsibleWidget(toggleWidgets[i], window.bh2e.state);
    }
    initializeTabs(state);
}
