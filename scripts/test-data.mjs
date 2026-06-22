import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const generatedPath = resolve("src/data/worldcup.generated.json");
const data = JSON.parse(readFileSync(generatedPath, "utf8"));

const failures = [];
const matches = data.matches ?? [];

if (matches.length !== 104) {
  failures.push(`expected 104 matches, got ${matches.length}`);
}

for (const group of "ABCDEFGHIJKL") {
  const groupMatches = matches.filter((match) => match.group === group);
  if (groupMatches.length !== 6) {
    failures.push(`group ${group} expected 6 matches, got ${groupMatches.length}`);
  }
}

const knockout = matches.filter((match) => match.group === null);
if (knockout.length !== 32) {
  failures.push(`expected 32 knockout matches, got ${knockout.length}`);
}

const seattle = matches.filter((match) => match.venueId === "lumen-field");
if (seattle.length === 0) {
  failures.push("expected at least one Seattle / Lumen Field match");
}

const duplicateNumbers = matches
  .map((match) => match.matchNumber)
  .filter((number, index, numbers) => numbers.indexOf(number) !== index);
if (duplicateNumbers.length > 0) {
  failures.push(`duplicate match numbers: ${duplicateNumbers.join(", ")}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Data checks passed: ${matches.length} matches, ${knockout.length} knockout matches, ${seattle.length} Seattle matches.`
);
