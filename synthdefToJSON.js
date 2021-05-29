const fs = require("fs");
const decoder = require("synthdef-json-decoder");
 
const file = fs.readFileSync("sc/def5.scsyndef");
const buffer = new Uint8Array(file).buffer;
const json = decoder.decode(buffer);
 
const data = JSON.stringify(json, null, 4);

fs.writeFile('sc/def5.json', data, (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});

console.log(json);
