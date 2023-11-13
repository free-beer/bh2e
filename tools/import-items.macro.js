// ---
// INSTRUCTIONS
// ---
// 1. **Paste this script into a new Macro in Foundry VTT**
// 2. Generate the data that you'd like to import using the `parse-*.js` scripts in this directory.
// 3. Paste the output of the script (found in a corresponding *.db file in this directory) into the `items` variable below.
// 4. Update `packName` to point to the Compendium that you'd like to add the items to.
// 4. Execute the Macro.

const compendiumName = 'world.black-hack-***';
const items = ``;

let compendium;
try {
  compendium = game.packs.get(compendiumName);
} catch {
  console.error('This script should be run as a Macro inside of Foundry.');
  process.exit();
}

items.split('\n').forEach(item => {
  compendium.importDocument(
    new compendium.documentClass(
      JSON.parse(item)
    )
  );
});
