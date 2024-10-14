/**
 * This class is derived from the standard FoundryVTT Scene class for the sole
 * purpose of allowing for the randomization of creature HP when they are added
 * to a scene.
 */
export default class BH2eScene extends Scene {
	_onCreateDescendantDocuments(embeddedName, documents, result, options, userId) {
		super._onCreateDescendantDocuments(embeddedName, documents, result, options, userId);

        if(game.settings.get("bh2e", "randomizeCreatureHP")) {
			if(embeddedName === "Token") {
				let sceneTokens = Array.from(game.scenes.current.tokens);
				let tokens      = [];

				result.forEach((entry) => {
					let token = sceneTokens.find((t) => t.id === entry._id);

					if(token) {
						tokens.push(token);
					}
				});

				tokens.forEach((token) => {
					let actor = token.actor;
					if(actor.type === "creature" && actor.system.hitDice > 0) {
						let formula = `${actor.system.hitDice}d8`;
						(new Roll(formula)).evaluate().then((roll) => {
							let data = {hitPoints: {
								            max:   roll.total,
								            value: roll.total
								        }};
							token.actor.update({system: data});
						});
					}
				});
			}
		}
	}
}