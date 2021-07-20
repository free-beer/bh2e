#!/bin/nodejs
// ---
// INSTRUCTIONS:
// ---
// 1. Copy the table from the `Creatures` section of `The Black Hack` markdown source into a new text file (ex. `creatures.txt`).
//   * Source can be found here: https://raw.githubusercontent.com/brunobord/the-black-hack/master/english/the-black-hack.md
// 2. Run this script with `node parse-creatures.js`
// 3. Import the data into Foundry using `import-items.macro.js`

const fs = require('fs');
const INPUT_TEXT_FILE = 'creatures.txt';
const OUTPUT_TEXT_FILE = 'creatures.db';

const rawText = fs.readFileSync(INPUT_TEXT_FILE, { encoding: 'utf-8'});

const textLines = rawText.split('\n');

// TODO: Parse Abilities instead of placing them in the `notes` field.
const getAbilitiesData = (line) => {};

const getCreatureData = (segs) => {
  const hitDice = parseInt(segs[1].split('\n')[0], 10);
  const hitPoints = hitDice * 8 / 2;
  return {
    "name": segs[0],
    "type": "creature",
    "img": "icons/svg/item-bag.svg",
    "data": {
        "hitDice": hitDice,
        "hitPoints": hitPoints,
        "notes": segs[2],
    },
    "token": {
        "name": segs[0],
        "img": "icons/svg/item-bag.svg",
        "displayName": 0,
        "actorLink": false,
        "width": 1,
        "height": 1,
        "scale": 1,
        "mirrorX": false,
        "mirrorY": false,
        "lockRotation": false,
        "rotation": 0,
        "alpha": 1,
        "vision": false,
        "dimSight": 0,
        "brightSight": 0,
        "dimLight": 0,
        "brightLight": 0,
        "sightAngle": 0,
        "lightAngle": 0,
        "lightAlpha": 0.25,
        "lightAnimation": {
            "speed": 5,
            "intensity": 5
        },
        "disposition": -1,
        "displayBars": 0,
        "bar1": {
            "attribute": ""
        },
        "bar2": {
            "attribute": ""
        },
        "flags": {},
        "randomImg": false,
        "tint": null,
        "lightColor": null,
        "x": null,
        "y": null,
        "elevation": null
    },
    "items": [],
    "effects": [],
    "folder": null,
    "sort": 0,
    "permission": {},
    "flags": {},
}
};

const creatures = textLines.reduce((creatures, line) => {
  const lineSegments = line
    .split('|')
    .map(seg => seg.trim())
    .filter(seg => seg.length);

  if (lineSegments.length) {
    return creatures.concat([
      JSON.stringify(
        getCreatureData(lineSegments)
      )
    ]);
  } else {
    return creatures;
  }
}, [])
.join('\n');

fs.writeFileSync(OUTPUT_TEXT_FILE, creatures, { encoding: 'utf-8' });
