/**
 * extract-alpha-vocab.cjs
 *
 * Extracts Finnish-English vocabulary pairs from the alphabetical sections of the
 * SM1 and SM2 raw-text files, applies OCR corrections, deduplicates, and merges
 * into src/data/vocabulary-generated.ts.
 *
 * Run: node scripts/extract-alpha-vocab.cjs
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────
// 1. OCR CORRECTION HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Manual overrides: keys are the (possibly partially-fixed) Finnish strings
 * that can't be recovered by rules alone.
 */
const FINN_OVERRIDES = {
  // Multi-word
  "heittää 16ylää": "heittää löylyä",
  "heittää 16ylyä": "heittää löylyä",
  "heittii 16ylyd": "heittää löylyä",
  "heittii loylyd": "heittää löylyä",
  "heittii löylyd": "heittää löylyä",
  "heittii löylyä": "heittää löylyä",
  kotiinlähto: "kotiinlähtö",
  "päivi kipei": "pää kipeä",
  "pii kipei": "pää kipeä",
  "hakea toit": "hakea töitä",
  "kaksi yhden hinnalla": "kaksi yhden hinnalla",
  "kala sy hyvin": "Kala syö hyvin",

  // Lääke-words (lä → la, ä → d mess)
  ladkekaappi: "lääkekaappi",
  ladkari: "lääkäri",
  liiike: "lääke",
  liike: "liike", // genuine word – leave as is

  // Löyly-words (6→ö, 1→l) — after structural fixes these should be correct
  // but add fallbacks in case
  "heittää löylää": "heittää löylyä",
  "heittää löylää": "heittää löylyä",
  "heittää löylää": "heittää löylyä",
  "1oylykauha": "löylykauha",
  loylykauha: "löylykauha",
  "1oylykiulu": "löylykiulu",
  loylykiulu: "löylykiulu",
  loyly: "löyly",
  loytid: "löytää",
  Ioytid: "löytää",
  löytää: "löytää",

  // Sähkö-words
  sihkokitara: "sähkökitara",
  sihkdsauna: "sähkösauna",

  // Lämpö-words
  limpomittari: "lämpömittari",
  lammittid: "lämmittää",
  limmittid: "lämmittää",

  // Särkylääke
  sirkyliike: "särkylääke",
  sirkyldike: "särkylääke",

  // Specific garbled words
  kyllid: "kyllä",
  kylliä: "kyllä",
  padnsiarky: "päänsärky",
  padnsärky: "päänsärky",
  Jjilkeen: "jälkeen",
  jilkeen: "jälkeen",
  jélkeen: "jälkeen",
  jélkiruoka: "jälkiruoka",
  jalkeen: "jälkeen",
  jadkylma: "jääkylmä",
  Jjadkylma: "jääkylmä",
  hedelmi: "hedelmä",
  sivistyssana: "sivistyssana",
  kunnolla: "kunnolla",
  myohd: "myöhä",
  myohia: "myöhäinen",
  varattu: "varattu",
  kuuluisa: "kuuluisa",
  jakald: "jäkälä",
  jäleld: "jäljellä",
  jaljelli: "jäljellä",
  Kylliistyi: "kyllästyi",
  kyld: "kylä",
  Kyynirpia: "kyynärpää",
  kisi: "käsi",
  kiisimatkatavara: "käsimatkatavara",
  olkapii: "olkapää",
  korvasirky: "korvasärky",
  sirked: "särkee",
  ruumiinosa: "ruumiinosa",
  "kova niilka": "kova nälkä",
  kurkkukipu: "kurkkukipu",
  "kurkku kipei": "kurkku kipeä",
  pänsärky: "päänsärky",
  paansärky: "päänsärky",
  syttyd: "syttyi",
  sytyttid: "sytyttää",

  seitsemiinkymmenti: "seitsemänkymmentä",
  seitsemintoista: "seitsemäntoista",
  "olkapii, hartiat": "olkapää, hartiat",
  padovi: "pääovi",
  syntymipiivit: "syntymäpäiväjuhlat",
  sytyttiä: "sytyttää",
  sirkeä: "särkee",
  sirkylidike: "särkylääke",
  taideniyttely: "taidenäyttely",
  "olla/kiydi ostoksilla": "käydä ostoksilla",
  "selvi juttu": "selvä juttu",

  // Additional garbled SM1/SM2 words (ä→i, ä→d, ö→o patterns)
  myydi: "myydä",
  myyji: "myyjä",
  seini: "seinä",
  heittiä: "heittää",
  "joka pdiva": "joka päivä",
  "etsiä toiti": "etsiä töitä",
  kirjanpitiji: "kirjanpitäjä",
  juhlaviki: "juhlavieraat",
  jakalä: "jäkälä",
  lammittiä: "lämmittää",
  etelimanner: "Etelämanner",
  pdivd: "päivä",
  kirjoituspoyti: "kirjoituspöytä",
  kivenniisvesi: "kivennäisvesi",
  liksidiset: "lähettäjät",
  linsi: "läksiäinen",
  mirki: "märkä",
  seitsemäin: "seitsemän",
  kahdeksankymmenti: "kahdeksankymmentä",
  kolmesataa: "kolmesataa",
  satayksi: "satayksi",
  kirsikka: "kirsikka",
  muroja: "muroja",
  murot: "murot",
};

/**
 * Finnish words/phrases that should be SKIPPED entirely during extraction because
 * they are known to produce misaligned or wrong English translations in the raw PDF.
 */
const EXCLUDED_FINN = new Set(
  [
    "selviä", // selviä = to survive, extracted as "right" (wrong pairing)
    "sinappi", // sinappi = mustard, extracted as "tidy" (wrong pairing)
    "sinun", // sinun = your, extracted as "that's why" (wrong pairing)
    "silmiit", // completely garbled, wrong pairing
    "lukko", // lukko = lock, extracted as "upper secondary school" (wrong pairing)
    "le", // too short, garbage token
  ].map((w) => w.toLowerCase()),
);

/**
 * English overrides: when the extracted English for these Finnish phrases is wrong,
 * use the correct English translation instead.
 */
const ENG_OVERRIDES = {
  "varata huone (nimellä)": "to reserve a room (in someone's name)",
  "varaus (nimellä)": "reservation (in someone's name)",
  varmasti: "certainly; definitely",
  "olla eronnut": "to be divorced",
  "olla kiinnostunut": "to be interested in",
  "olla tarjouksessa": "to be on offer",
  "käydä ostoksilla": "to go shopping",
  "selvä juttu": "I see; of course",
};

/** Apply character-level OCR fixes to a Finnish word/phrase */
function fixFinnish(raw) {
  let w = raw.trim();

  // 1. Double-capital at word start: Jjalkapallo → jalkapallo
  w = w.replace(/\b([A-ZÄÖÅ])([a-zäöå])/g, (m, a, b) =>
    a.toLowerCase() === b ? b : m,
  );

  // 2. '6' adjacent to letters → 'ö':  l6yt → löyt,  6ver → över
  w = w.replace(/([a-zA-ZäöåÄÖÅ])6/g, "$1ö");
  w = w.replace(/6([a-zA-ZäöåÄÖÅ])/g, "ö$1");
  w = w.replace(/^6([a-zA-ZäöåÄÖÅ])/, "ö$1");

  // 3. Digit '1' acting as letter 'l' (surrounded by letters, or at start before vowel)
  w = w.replace(/([a-zA-ZäöåÄÖÅ])1([a-zA-ZäöåÄÖÅ])/g, "$1l$2");
  w = w.replace(/^1([aeiouäöåAEIOUÄÖÅ])/, "l$1");

  // 4. 'é' → 'ä' (common font rendering artifact)
  w = w.replace(/é/g, "ä");

  // 5. 'd' at any word-end → 'ä'  (any preceding letter, not just vowels)
  //    e.g. sind → sinä, heind → heinä, löylyd → löylyä, myrskyd → myrsky?
  w = w.replace(/([a-zA-ZäöåÄÖÅ])d(\b|$)/g, "$1ä");

  // 6. 'id' sequence at word-end → 'ä'  (e.g. kyllid → kyllä, not kylliä)
  w = w.replace(/id(\b|$)/g, "ä");

  // 7. Manual lookup after structural fixes
  const key = w.toLowerCase().trim();
  for (const [k, v] of Object.entries(FINN_OVERRIDES)) {
    if (k.toLowerCase() === key) return v;
  }

  return w;
}

/** Apply minor OCR fixes to an English translation */
function fixEnglish(raw) {
  let w = raw.trim();
  // (t0)/(to0) → (to)
  w = w.replace(/\(t0\)/g, "(to)");
  w = w.replace(/\bto0\b/g, "to");
  // Double-capital at start: Jjeans → jeans
  w = w.replace(/^([A-Z])([a-z])/, (m, a, b) =>
    a.toLowerCase() === b ? b : m,
  );
  // Remove leading "(to) " wrapper: "(to) run" → "to run"
  w = w.replace(/^\(to\)\s+/, "to ");
  // Trim trailing/leading spaces and extra commas
  w = w.replace(/^,|,$/g, "").trim();
  return w;
}

// ─────────────────────────────────────────────────────────────────
// 2. PAIR VALIDATION
// ─────────────────────────────────────────────────────────────────

/** Return true if a Finnish+English pair looks plausibly real */
function isValidPair(finn, eng) {
  if (!finn || !eng) return false;
  if (finn.length < 2 || eng.length < 2) return false;

  // ── Finnish checks ────────────────────────────────────────────
  // Must start with a real letter
  if (!/^[a-zA-ZäöåÄÖÅ]/.test(finn)) return false;
  // Reject pure abbreviation garbage (1-4 uppercase letters alone)
  if (/^[A-Z]{1,4}\s*$/.test(finn)) return false;
  // Reject obvious OCR trash: ——, ===, |||, leading dashes
  if (/^[—\-=|\\]{2,}/.test(finn)) return false;
  // After all fixes, Finnish should NOT still end in bare 'd'
  if (/d$/.test(finn)) return false;
  // Finnish should NOT contain a '6' — means ö-fix didn't fire
  if (/6/.test(finn)) return false;
  // Reject lines that are clearly OCR symbol garbage
  if (/^[A-Z]{2,}\s*$/.test(finn)) return false;
  // Reject Finnish with 3+ consecutive uppercase letters (OCR garbage like "WWRN—")
  if (/[A-Z]{3}/.test(finn)) return false;
  // Finnish words never contain 'ij' — OCR artifact for 'äj' (e.g. kirjanpitiji)
  if (/ij/.test(finn)) return false;

  // ── English checks ────────────────────────────────────────────
  // Must start with a letter (not parenthesis — those are grammar notes, not translations)
  if (!/^[a-zA-Z]/.test(eng)) return false;
  // Reject English with 3+ consecutive digits (page number garbage)
  if (/\d{3,}/.test(eng)) return false;
  // Reject if English is only 2-4 all-caps letters (OCR symbol: WW, TR, AN)
  if (/^[A-Z]{2,4}\s*$/.test(eng)) return false;
  // Reject if English contains obvious symbol garbage
  if (/[%@#^*]{1}/.test(eng)) return false;
  // Reject English containing any digit (OCR page numbers bleed in)
  if (/\d/.test(eng)) return false;
  // Reject English containing pipe character (OCR column separator)
  if (/\|/.test(eng)) return false;
  // Reject very short (single-letter) after stripping punctuation
  if (eng.replace(/[^a-zA-Z]/g, "").length < 2) return false;
  // Reject English that still looks like OCR trash (e.g. "A N%", "= 100")
  if (/^[A-Z]\s[A-Z]/.test(eng)) return false;
  if (/^=/.test(eng)) return false;

  return true;
}

// ─────────────────────────────────────────────────────────────────
// 3. CATEGORY GUESSER
// ─────────────────────────────────────────────────────────────────

function guessCategory(eng) {
  const e = eng.toLowerCase();
  if (
    /\b(food|eat|cook|meal|breakfast|lunch|dinner|supper|fruit|vegetable|soup|meat|fish|bread|milk|butter|cheese|egg|coffee|tea|water|juice|wine|beer|drink|rice|pasta|salad|mushroom|berry|cake|sugar|salt|sauce|spice|fork|knife|spoon|plate|cup|glass|bottle|menu|restaurant|grill|smoke|bake|fry|recipe|snack|pizza|hamburger|sandwich|cereal|porridge|yoghurt)\b/.test(
      e,
    )
  )
    return "Food & Drink";
  if (
    /\b(house|home|room|kitchen|bedroom|bathroom|hall|balcony|sauna|apartment|furniture|chair|table|sofa|lamp|curtain|mirror|shelf|closet|wardrobe|floor|ceiling|wall|window|door|wash|clean|vacuum|rent|neighbour|neighbor|fridge|freezer|stove|oven|kettle|dishwasher|cottage|cabin|steam|ladle|bucket)\b/.test(
      e,
    )
  )
    return "Home & Daily Life";
  if (
    /\b(bus|train|car|plane|flight|travel|trip|transport|drive|taxi|ferry|bicycle|bike|boat|ship|ticket|station|airport|luggage|suitcase|passport|visa|arrive|depart|reserve|booking|delay|platform|journey|excursion|vehicle|lorry|motorcycle|tram|subway)\b/.test(
      e,
    )
  )
    return "Transport";
  if (
    /\b(shop|store|buy|sell|price|cheap|expensive|discount|receipt|market|pay|purchase|size|fitting|catalogue|sale|offer|return|exchange|quality|warranty|refund|cashier|trolley|basket|department)\b/.test(
      e,
    )
  )
    return "Shopping";
  if (
    /\b(sick|illness|doctor|hospital|nurse|medicine|pain|symptom|health|fever|cold|cough|flu|allergy|wound|infection|vaccination|pharmacy|patient|appointment|body|head|ear|eye|nose|mouth|tooth|arm|leg|hand|foot|knee|back|chest|stomach|heart|lung|throat|skin|wrist|elbow|ankle|shoulder|neck|chin|cheek|lip|forehead|finger|toe|ache|sore|injury|fracture)\b/.test(
      e,
    )
  )
    return "Health";
  if (
    /\b(family|mother|father|brother|sister|child|baby|wife|husband|son|daughter|parent|grandparent|uncle|aunt|cousin|wedding|married|divorced|engaged|bride|groom|relative|stepfather|stepmother)\b/.test(
      e,
    )
  )
    return "Family";
  if (
    /\b(work|job|office|colleague|salary|employee|employer|profession|career|meeting|company|business|interview|application|manager|director|secretary|engineer|accountant|driver|cook|teacher|doctor|nurse|journalist|lawyer|architect|mechanic|plumber|electrician|hairdresser|painter|farmer)\b/.test(
      e,
    )
  )
    return "Work";
  if (
    /\b(weather|rain|snow|sun|wind|cloud|storm|thunder|temperature|degree|warm|cold|hot|cool|foggy|sunny|cloudy|frost|nature|forest|lake|river|sea|mountain|island|beach|shore|rock|bird|animal|bear|fox|wolf|moose|elk|deer|hare|rabbit|fish|salmon|pike|perch|swan|duck|gull|spruce|birch|pine|oak|mushroom|lichen)\b/.test(
      e,
    )
  )
    return "Nature & Weather";
  if (
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|week|month|year|season|spring|summer|autumn|fall|winter|today|yesterday|tomorrow|morning|evening|night|time|clock|hour|minute|second|semester|term)\b/.test(
      e,
    )
  )
    return "Time & Calendar";
  if (
    /\b(city|town|street|park|museum|library|bank|post|square|market|school|hospital|police|station|castle|island|north|south|east|west|corner|crossing|traffic|cinema|theatre|theater|church|bridge)\b/.test(
      e,
    )
  )
    return "Places & Cities";
  if (
    /\b(red|blue|green|yellow|black|white|grey|gray|brown|pink|orange|purple|violet|color|colour)\b/.test(
      e,
    )
  )
    return "Colors";
  if (
    /\b(number|hundred|thousand|million|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/.test(
      e,
    )
  )
    return "Numbers";
  if (
    /\b(hello|goodbye|hi\b|welcome|thank|sorry|excuse|nice to meet|good morning|good evening|good night|congratulate|greeting)\b/.test(
      e,
    )
  )
    return "Greetings";
  return "General";
}

// ─────────────────────────────────────────────────────────────────
// 4. EXTRACTION FROM A RAW FILE
// ─────────────────────────────────────────────────────────────────

function extractPairs(rawPath, alphaStart, alphaEnd) {
  const txt = fs.readFileSync(rawPath, "utf8");
  const lines = txt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const pages = lines
    .map((l, i) => ({ l, i }))
    .filter((x) => /^-- \d+ of \d+ --$/.test(x.l));

  const results = [];

  for (let pNum = alphaStart; pNum <= alphaEnd; pNum++) {
    const cur = pages.find(
      (p) =>
        p.l === `-- ${pNum} of ${pages[0].l.match(/\d+ --$/)[0]}` ||
        p.l.includes(`-- ${pNum} of `),
    );
    const next = pages.find((p) => p.l.includes(`-- ${pNum + 1} of `));
    if (!cur) continue;
    const pEnd = next ? next.i : lines.length;
    const pageLines = lines.slice(cur.i + 1, pEnd);

    // The alphabetical Finnish-English page has:
    //   [Finnish column]  "Aakkosellinen sanasto suomi-englanti"  [English column + other languages]
    const splitAt = pageLines.findIndex((l) =>
      l.includes("Aakkosellinen sanasto suomi-englanti"),
    );
    if (splitAt < 0) continue;

    const finnishCol = pageLines.slice(0, splitAt);
    // Take only as many English items as there are Finnish items
    // (the rest are Russian / German / French / Serbian columns)
    const englishAll = pageLines.slice(splitAt + 1);
    const englishCol = englishAll.slice(0, finnishCol.length);

    let pageAborted = false;
    let knownMismatchCount = 0;

    finnishCol.forEach((rawF, i) => {
      if (pageAborted) return;
      const rawE = englishCol[i];
      if (!rawF || !rawE) return;

      const fixedF = fixFinnish(rawF);
      const fixedFKey = fixedF.toLowerCase().trim();

      // Skip explicitly excluded Finnish words (known misalignment or garbage)
      if (EXCLUDED_FINN.has(fixedFKey)) return;

      // Apply English override if we know the correct translation for this Finnish phrase
      let fixedE =
        ENG_OVERRIDES[fixedFKey] || ENG_OVERRIDES[fixedF] || fixEnglish(rawE);
      // Use the override key on the fixed Finnish too (after FINN_OVERRIDES applied above)
      if (!ENG_OVERRIDES[fixedFKey] && !ENG_OVERRIDES[fixedF]) {
        fixedE = fixEnglish(rawE);
      }

      // Per-page early-exit: if this Finnish word is KNOWN and paired with an
      // incompatible English, the page has shifted — abort the rest.
      if (existingFinnish.has(fixedFKey)) {
        const compatible = isCompatibleWithKnown(fixedFKey, fixedE);
        if (compatible === false) {
          knownMismatchCount++;
          if (knownMismatchCount >= 2) {
            pageAborted = true;
            return;
          }
          return; // skip this pair but don't abort yet
        }
      }

      if (isValidPair(fixedF, fixedE) && isProbablyAligned(fixedF, fixedE)) {
        results.push({
          finnish: fixedF,
          english: fixedE,
          category: guessCategory(fixedE),
        });
      }
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────
// 5. LOAD EXISTING VOCABULARY
// ─────────────────────────────────────────────────────────────────

const vocabPath = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "vocabulary-generated.ts",
);
const rawContent = fs.readFileSync(vocabPath, "utf8");
const existingMatch = rawContent.match(
  /export const vocabulary = (\[[\s\S]*?\]);/,
);
if (!existingMatch) {
  console.error("Cannot parse vocabulary file");
  process.exit(1);
}

const existing = JSON.parse(existingMatch[1]);
const existingFinnish = new Set(
  existing.map((e) => e.finnish.toLowerCase().trim()),
);

// Map: English → Finnish (detect when extracted English belongs to a different Finnish word)
const engToFinnish = new Map();
existing.forEach((e) => {
  const key = e.english.toLowerCase().trim().split(/[;,]/)[0].trim();
  if (!engToFinnish.has(key))
    engToFinnish.set(key, e.finnish.toLowerCase().trim());
});

// Map: Finnish → English (detect when extracted English is wrong for a KNOWN Finnish word)
const finnToEng = new Map();
existing.forEach((e) => {
  finnToEng.set(e.finnish.toLowerCase().trim(), e.english.toLowerCase().trim());
});

/** Return true if the pair is probably aligned (not a page-shift artifact) */
function isProbablyAligned(finn, eng) {
  const eKey = eng
    .toLowerCase()
    .trim()
    .split(/[;,]/)[0]
    .replace(/^to\s+/, "")
    .trim();
  const knownFinn =
    engToFinnish.get(eKey) || engToFinnish.get(eng.toLowerCase().trim());
  if (!knownFinn) return true; // unknown translation – can't tell, assume OK
  const fKey = finn.toLowerCase().trim();
  if (knownFinn === fKey) return true; // exact match = already in vocab (will be deduped anyway)
  const sharedLen = [...fKey].findIndex((c, i) => c !== (knownFinn[i] || ""));
  if (sharedLen >= 4) return true; // same root
  return false; // different word → misaligned
}

/** Return true if the extracted English is compatible with what we know for this Finnish word */
function isCompatibleWithKnown(fKey, extractedEng) {
  const knownEng = finnToEng.get(fKey);
  if (!knownEng) return null; // not known — can't check
  const knownWords = new Set(
    knownEng.split(/[\s;,()\-]+/).filter((w) => w.length > 3),
  );
  const extractedWords = extractedEng
    .toLowerCase()
    .split(/[\s;,()\-]+/)
    .filter((w) => w.length > 3);
  const overlap = extractedWords.filter((w) => knownWords.has(w)).length;
  // Compatible if any meaningful word overlaps
  return knownWords.size === 0 || overlap > 0;
}

console.log(`Existing entries: ${existing.length}`);

// ─────────────────────────────────────────────────────────────────
// 6. EXTRACT FROM BOTH FILES
// ─────────────────────────────────────────────────────────────────

// SM1: alphabetical section is pages 17-25 (some pages are garbled, validation will filter)
const sm1Raw = path.join(__dirname, "sm1-raw.txt");
const sm1Pairs = extractPairs(sm1Raw, 17, 25);
console.log(`SM1 raw extracted pairs: ${sm1Pairs.length}`);

// SM2: alphabetical section is pages 14-21
const sm2Raw = path.join(__dirname, "sm2-raw.txt");
const sm2Pairs = extractPairs(sm2Raw, 14, 21);
console.log(`SM2 raw extracted pairs: ${sm2Pairs.length}`);

// ─────────────────────────────────────────────────────────────────
// 7. DEDUPLICATE AND TRACK WHAT'S NEW
// ─────────────────────────────────────────────────────────────────

// Deduplicate SM1
const seen = new Set(existingFinnish);
const newSM1 = [];
for (const p of sm1Pairs) {
  const key = p.finnish.toLowerCase().trim();
  if (!seen.has(key)) {
    seen.add(key);
    newSM1.push({ ...p, source: "SM1" });
  }
}

// Deduplicate SM2 (also dedup against SM1 above)
const newSM2 = [];
for (const p of sm2Pairs) {
  const key = p.finnish.toLowerCase().trim();
  if (!seen.has(key)) {
    seen.add(key);
    newSM2.push({ ...p, source: "SM2" });
  }
}

console.log(`New SM1 entries after dedup: ${newSM1.length}`);
console.log(`New SM2 entries after dedup: ${newSM2.length}`);

if (newSM1.length + newSM2.length === 0) {
  console.log("Nothing new to add.");
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────
// 8. PREVIEW (first 30 of each)
// ─────────────────────────────────────────────────────────────────

console.log("\n--- Sample new SM1 ---");
newSM1
  .slice(0, 30)
  .forEach((p) => console.log(`  ${p.finnish.padEnd(30)} ${p.english}`));
console.log("\n--- Sample new SM2 ---");
newSM2
  .slice(0, 30)
  .forEach((p) => console.log(`  ${p.finnish.padEnd(30)} ${p.english}`));

// ─────────────────────────────────────────────────────────────────
// 9. MERGE AND WRITE
// ─────────────────────────────────────────────────────────────────

const allEntries = [...existing, ...newSM1, ...newSM2].map((e, i) => ({
  id: i + 1,
  ...e,
}));

const header =
  `// Vocabulary list\n` +
  `// YLE: ${existing.filter((e) => e.source === "YLE").length} entries\n` +
  `// SM1: ${existing.filter((e) => e.source === "SM1").length + newSM1.length} entries\n` +
  `// SM2: ${existing.filter((e) => e.source === "SM2").length + newSM2.length} entries\n` +
  `// Total: ${allEntries.length}\n\n`;

const newContent = `${header}export const vocabulary = ${JSON.stringify(allEntries, null, 2)};\n`;

fs.writeFileSync(vocabPath, newContent, "utf8");
console.log(
  `\nDone! Wrote ${allEntries.length} entries to vocabulary-generated.ts`,
);
