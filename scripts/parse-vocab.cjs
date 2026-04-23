const fs = require("fs");

const text = fs.readFileSync("scripts/yle.txt", "utf8");

// ── CATEGORY MAPS ────────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  Greetings: new Set([
    "moi",
    "hei",
    "kiitos",
    "terve",
    "näkemiin",
    "hei hei",
    "moi moi",
    "heippa",
    "moikka",
    "hyvää huomenta",
    "hyvää iltaa",
    "hyvää yötä",
    "hyvää päivää",
    "päivää",
    "iltaa",
    "huomenta",
    "anteeksi",
    "ole hyvä",
    "olkaa hyvä",
    "mitä kuuluu",
    "miten menee",
    "tervetuloa",
    "kiitti",
  ]),
  Numbers: new Set([
    "nolla",
    "yksi",
    "kaksi",
    "kolme",
    "neljä",
    "viisi",
    "kuusi",
    "seitsemän",
    "kahdeksan",
    "yhdeksän",
    "kymmenen",
    "yksitoista",
    "kaksitoista",
    "kolmetoista",
    "neljätoista",
    "viisitoista",
    "kuusitoista",
    "seitsemäntoista",
    "kahdeksantoista",
    "yhdeksäntoista",
    "kaksikymmentä",
    "kolmekymmentä",
    "neljäkymmentä",
    "viisikymmentä",
    "kuusikymmentä",
    "seitsemänkymmentä",
    "kahdeksankymmentä",
    "yhdeksänkymmentä",
    "sata",
    "tuhat",
    "ensimmäinen",
    "toinen",
    "kolmas",
    "neljäs",
    "viides",
    "kuudes",
    "seitsemäs",
    "kahdeksas",
    "yhdeksäs",
    "kymmenes",
    "kahdeskymmenes",
    "kolmaskymmenes",
    "kahdestoista",
    "kolmastoista",
    "neljästoista",
    "viidestoista",
    "kuudestoista",
    "seitsemästoista",
    "kahdeksastoista",
    "yhdeksästoista",
    "yhdestoista",
    "sadas",
    "tuhannes",
  ]),
  "Time & Calendar": new Set([
    "aamu",
    "aamuun",
    "aamulla",
    "ilta",
    "iltapäivä",
    "yö",
    "päivä",
    "viikko",
    "kuukausi",
    "vuosi",
    "hetki",
    "tunti",
    "minuutti",
    "sekunti",
    "aika",
    "nyt",
    "tänään",
    "huomenna",
    "eilen",
    "maanantai",
    "tiistai",
    "keskiviikko",
    "torstai",
    "perjantai",
    "lauantai",
    "sunnuntai",
    "tammikuu",
    "helmikuu",
    "maaliskuu",
    "huhtikuu",
    "toukokuu",
    "kesäkuu",
    "heinäkuu",
    "elokuu",
    "syyskuu",
    "lokakuu",
    "marraskuu",
    "joulukuu",
    "kevät",
    "kesä",
    "syksy",
    "talvi",
    "vuodenaika",
    "kalenteri",
    "aamupäivä",
    "ylihuomenna",
    "toissapäivänä",
  ]),
  Family: new Set([
    "äiti",
    "isä",
    "sisko",
    "veli",
    "tytär",
    "poika",
    "lapsi",
    "vaimo",
    "mies",
    "isoisä",
    "isoäiti",
    "sukulainen",
    "perhe",
    "vanhemmat",
    "serkku",
    "setä",
    "täti",
    "pikkusisko",
    "isoveli",
    "lastenlapsi",
    "lapsenlapsi",
    "esikoinen",
    "sulhanen",
    "morsian",
    "hääpari",
    "aviopuoliso",
  ]),
  "Food & Drink": new Set([
    "kahvi",
    "maito",
    "ruoka",
    "lihapulla",
    "lohi",
    "kala",
    "makaroni",
    "peruna",
    "sipuli",
    "porkkana",
    "omena",
    "mansikka",
    "juusto",
    "leipä",
    "makkara",
    "olut",
    "viini",
    "vesi",
    "tee",
    "jäätelö",
    "kakku",
    "pulla",
    "juoma",
    "aamupala",
    "lounas",
    "päivällinen",
    "illallinen",
    "alkupala",
    "jälkiruoka",
    "salaatti",
    "keitto",
    "maito",
    "liha",
    "kana",
    "karjalanpiirakka",
    "karjalanpaisti",
    "makea",
    "sokeri",
    "suola",
    "voi",
    "öljy",
    "grillimakkara",
    "kahvila",
    "ravintola",
    "punaviini",
    "valkoviini",
    "mehu",
    "limsa",
    "nakki",
    "hampurilainen",
    "pizza",
    "pasta",
    "spagetti",
    "leipä",
    "sämpylä",
    "kasvis",
    "kasvisruoka",
    "muikku",
    "kuha",
    "kuhafile",
    "lohikeitto",
    "haukikeitto",
    "kalakeitto",
    "graavilohi",
    "lohi",
    "kananmuna",
    "kalja",
    "snapsi",
    "kippis",
  ]),
  "Home & Daily Life": new Set([
    "koti",
    "huone",
    "keittiö",
    "makuuhuone",
    "olohuone",
    "kylpyhuone",
    "vessa",
    "parveke",
    "ikkuna",
    "ovi",
    "seinä",
    "lattia",
    "katto",
    "pöytä",
    "tuoli",
    "sohva",
    "sänky",
    "kaappi",
    "hylly",
    "peitto",
    "tyyny",
    "astia",
    "lasi",
    "kuppi",
    "lautanen",
    "haarukka",
    "veitsi",
    "lusikka",
    "pesukone",
    "jääkaappi",
    "pakastin",
    "astianpesukone",
    "televisio",
    "telkkari",
    "radio",
    "tietokone",
    "puhelin",
    "kännykkä",
    "avain",
    "lukko",
    "rappukäytävä",
    "kerros",
    "hissi",
    "piha",
  ]),
  "Nature & Weather": new Set([
    "aurinko",
    "pilvi",
    "sää",
    "lumi",
    "sade",
    "tuuli",
    "myrsky",
    "ukkonen",
    "salama",
    "järvi",
    "meri",
    "joki",
    "metsä",
    "puu",
    "kukka",
    "ruoho",
    "mäki",
    "vuori",
    "saari",
    "ranta",
    "hiekka",
    "kivi",
    "taivas",
    "tähti",
    "kuu",
    "lämpötila",
    "pakkanen",
    "helle",
    "sääennuste",
    "sääilmiö",
    "lumisade",
    "sateinen",
    "pilvinen",
    "aurinkoinen",
    "kylmä",
    "lämmin",
    "kuuma",
    "hyttynen",
    "lintu",
    "kissa",
    "koira",
    "kala",
    "ahven",
    "hauki",
    "lohi",
  ]),
  Transport: new Set([
    "juna",
    "bussi",
    "auto",
    "laiva",
    "lentokone",
    "taksi",
    "raitiovaunu",
    "metro",
    "pyörä",
    "moottoripyörä",
    "vene",
    "purjevene",
    "autolautta",
    "lento",
    "matka",
    "asema",
    "rautatieasema",
    "linja-autoasema",
    "lentokenttä",
    "satama",
    "laituri",
    "lippu",
    "menolippu",
    "paluulippu",
    "meno-paluu",
  ]),
  "Places & Cities": new Set([
    "helsinki",
    "suomi",
    "tampere",
    "turku",
    "oulu",
    "espoo",
    "jyväskylä",
    "kuopio",
    "joensuu",
    "vaasa",
    "lahti",
    "rovaniemi",
    "lappi",
    "ruotsi",
    "norja",
    "tanska",
    "saksa",
    "ranska",
    "espanja",
    "italia",
    "venäjä",
    "viro",
    "puola",
    "englanti",
    "suomi",
    "pohjoinen",
    "etelä",
    "itä",
    "länsi",
    "kaupunki",
    "kylä",
    "maaseutu",
    "kaupunginosa",
    "paikka",
    "alue",
    "maakunta",
    "keskusta",
    "lähiö",
    "eurooppa",
    "eurooppalainen",
    "eu-maa",
  ]),
  Health: new Set([
    "sairaala",
    "lääkäri",
    "sairaanhoitaja",
    "hoitaja",
    "potilas",
    "resepti",
    "lääke",
    "antibiootti",
    "kuume",
    "nuha",
    "flunssa",
    "vilustuminen",
    "yskä",
    "päänsärky",
    "vatsakipu",
    "kurkkukipu",
    "kipu",
    "sairaus",
    "tauti",
    "oireet",
    "oireilu",
    "hammaslääkäri",
    "apteekki",
    "terveys",
    "terve",
    "sairas",
    "kipeä",
    "leikkaus",
    "hoito",
    "tutkimus",
    "rokote",
    "allergia",
  ]),
  Work: new Set([
    "työ",
    "toimisto",
    "koulu",
    "opettaja",
    "opiskelija",
    "yliopisto",
    "työtoveri",
    "kollega",
    "pomo",
    "johtaja",
    "yritys",
    "firma",
    "kokous",
    "palaveri",
    "asiakas",
    "myyjä",
    "virkailija",
    "farmaseutti",
    "insinööri",
    "lääkäri",
    "palkka",
    "ansio",
    "eläke",
    "työtön",
    "kokoushuone",
    "toimisto",
  ]),
  Colors: new Set([
    "sininen",
    "punainen",
    "valkoinen",
    "musta",
    "vihreä",
    "keltainen",
    "oranssi",
    "violetti",
    "harmaa",
    "ruskea",
    "pinkki",
    "vaaleanpunainen",
    "tummansininen",
    "kirkas",
    "tumma",
    "vaalea",
  ]),
  Shopping: new Set([
    "kauppa",
    "ostaa",
    "myydä",
    "hinta",
    "kallis",
    "halpa",
    "edullinen",
    "tavaratalo",
    "ostoskeskus",
    "market",
    "ostoslista",
    "ostos",
    "kassa",
    "kuitti",
    "maksu",
    "luottokortti",
    "käteinen",
    "alennus",
    "tarjous",
    "vaate",
    "kenkä",
    "vaatekauppa",
    "kenkäkauppa",
    "kirpputori",
  ]),
};

// Build reverse lookup: normalized Finnish → category
const wordCategory = {};
for (const [cat, words] of Object.entries(CATEGORY_MAP)) {
  for (const w of words) {
    wordCategory[w.toLowerCase()] = cat;
  }
}

function getCategory(finnish) {
  return wordCategory[finnish.toLowerCase()] ?? "General";
}

// ── PARSE ─────────────────────────────────────────────────────────────────────

const vocab = [];
const seen = new Set();

const lines = text.split("\n");
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  // Normalize 3+ spaces to a special delimiter
  const piped = trimmed.replace(/ {3,}/g, "|||");

  // Split on 2+ spaces to get individual "Finnish|||English" tokens
  const tokens = piped.split(/ {2,}/);

  for (const token of tokens) {
    const pipeIdx = token.indexOf("|||");
    if (pipeIdx === -1) continue;

    let finnish = token.slice(0, pipeIdx).trim();
    let english = token.slice(pipeIdx + 3).trim();

    // Skip obvious non-vocabulary (headers, navigation, dates, single chars)
    if (finnish.length <= 1) continue;
    if (/^[A-ZÄÖÅ]{2,}$/.test(finnish)) continue; // ALL CAPS headers
    if (/\d{2}/.test(finnish)) continue; // contains date-like numbers
    if (/JULKAISTU|PÄIVITETTY|LUKUAIKA|NAVIGAATIO/i.test(finnish)) continue;

    // Clean parenthetical notes from Finnish word
    // e.g. "aika (= melko)" → "aika"
    finnish = finnish.replace(/\s*\(.*?\)\s*$/, "").trim();
    // Clean contextual examples like "(tässä: ..." from Finnish
    finnish = finnish.replace(/\s*\(tässä.*?\)\s*$/i, "").trim();
    // Remove arrow references like "-> alku"
    finnish = finnish.replace(/\s*->\s*\S+\s*$/i, "").trim();

    // Clean English: remove zool/bot/etc prefixes
    english = english.replace(/^\([a-z]+\.\)\s*/i, "").trim();
    // Take first meaning if multiple with slash
    // Keep parenthetical clarifications that are meaningful
    // Remove trailing references like "= alentaa"
    english = english.replace(/\s*\(= [^)]+\)\s*/g, " ").trim();
    // Clean extra spaces
    english = english.replace(/\s{2,}/g, " ").trim();

    // Skip if English looks like it's just punctuation or too short
    if (english.length < 2) continue;
    // Skip entries where English contains date patterns
    if (/\d{4}|\d{2}\.\d{2}/.test(english)) continue;
    // Skip navigation entries
    if (/MINUUTTIA|JULKAISTU|NAVIGAATIO/i.test(english)) continue;

    const key = finnish.toLowerCase();
    if (!seen.has(key) && finnish.length > 1) {
      seen.add(key);
      vocab.push({ finnish, english, category: getCategory(finnish) });
    }
  }
}

console.log(`Parsed ${vocab.length} unique words`);

// ── OUTPUT ────────────────────────────────────────────────────────────────────

// Sort by category then alphabetically
vocab.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.finnish.localeCompare(b.finnish, "fi");
});

// Assign IDs
const entries = vocab.map((v, i) => ({
  id: i + 1,
  finnish: v.finnish,
  english: v.english,
  category: v.category,
}));

// Show category breakdown
const cats = {};
for (const e of entries) {
  cats[e.category] = (cats[e.category] || 0) + 1;
}
console.log("Category breakdown:", cats);

// Write TypeScript output
const tsContent = `// Auto-generated from YLE Finnish-English vocabulary list
// Source: suomi – English | Kielet | Oppiminen | yle.fi
// ${entries.length} entries

export const vocabulary = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync("src/data/vocabulary-generated.ts", tsContent, "utf8");
console.log("Written src/data/vocabulary-generated.ts");
