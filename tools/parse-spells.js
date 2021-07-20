#!/bin/nodejs
// ---
// INSTRUCTIONS:
// ---
// 1. Copy the spells from the Divine or Arcance Spells list from `The Black Hack` markdown source into a new text file (ex. `arcane-spells.txt`)
//   * Source can be found here: https://raw.githubusercontent.com/brunobord/the-black-hack/master/english/the-black-hack.md
// 2. Run this script.
// 3. Import the data into Foundry using `import-items.macro.js`

const fs = require('fs');
const INPUT_TEXT_FILE = 'arcane-spells.txt';
const OUTPUT_TEXT_FILE = 'arcane-spells.db';

const rawText = fs.readFileSync(INPUT_TEXT_FILE, { encoding: 'utf-8'});

const textLines = rawText.split('\n');

const isSpell = (line) => /^\*\W\*\*/m.test(line);
const getSpellData = (line) => /^\*\W\*\*(.*)\W:\*\*\W(.*)$/.exec(line);

const isSpellLevel = (line) => /^\*\*\d\*\*$/.test(line);
const getSpellLevel = (line) => /^\*\*(\d)\*\*$/.exec(line)[1];

const generateSpellJsonString = (spell, level, id) => JSON.stringify({
    "name": spell[1],
    "type": "magic",
    "img": "icons/svg/item-bag.svg",
    "data": {
        "cast": false,
        "description": spell[2],
        "level": level,
        "kind": "spell",
        "prepared": false
    },
    "effects": [],
    "folder": null,
    "sort": 0,
    "permission": {},
    "flags": {},
});

let spellLevel = 1;

const output = textLines.reduce((spells, line, index) => {
  if (isSpellLevel(line)) {
    spellLevel = getSpellLevel(line);
    return spells;
  }
  if (isSpell(line)) {
    return spells.concat([
      generateSpellJsonString(
        getSpellData(line),
        spellLevel,
        `${index}`
      )
    ]);
  }
  return spells;
}, [])
.join('\n');

fs.writeFileSync(OUTPUT_TEXT_FILE, output, { encoding: 'utf-8' });
