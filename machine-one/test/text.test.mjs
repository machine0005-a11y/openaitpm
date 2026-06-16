// Minimal unit tests for the pure text helpers. Run: node test/text.test.mjs
import { isValidIdea } from "../src/lib/messages.mjs";
import { toSlug, toTitle, cleanText } from "../src/lib/text.mjs";

let pass = 0, fail = 0;
const eq = (got, exp, label) => {
  if (got === exp) { pass++; console.log("PASS", label); }
  else { fail++; console.log("FAIL", label, "\n  got:", JSON.stringify(got), "\n  exp:", JSON.stringify(exp)); }
};

eq(toSlug("Pool day at the Promenade!"), "pool-day-at-the-promenade", "slug: basic");
eq(toSlug("  A & B  "), "a-and-b", "slug: ampersand + trim");
eq(toSlug(""), "untitled-idea", "slug: empty fallback");
eq(toSlug(String.fromCharCode(34)+"Quoted"+String.fromCharCode(34)+" idea"), "quoted-idea", "slug: strips quotes");
eq(toTitle("pool-day-at-the-promenade"), "Pool Day At The Promenade", "title: from slug");

const glyph = String.fromCharCode(0xfffc);
const nul = String.fromCharCode(0);
eq(cleanText("hi"+glyph+" there"), "hi there", "cleanText: strips U+FFFC");
eq(cleanText("a"+nul+"b"), "a b", "cleanText: strips null byte");
eq(isValidIdea("Promenade World Cup", "+14843260020", "+14843260020"), true, "owner idea: accepted");
eq(isValidIdea("Don't do git and make it work", "+14843260020", "+14843260020"), false, "owner operation: rejected");

console.log("\n"+pass+" passed, "+fail+" failed");
process.exit(fail ? 1 : 0);
