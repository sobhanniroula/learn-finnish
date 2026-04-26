const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function extractPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

// Heuristic: Is this line "English-looking"?
function isEnglish(line) {
  if (!line || line.trim().length === 0) return false;
  const t = line.trim();
  if (t.startsWith("(to)")) return true;
  if (/^[A-Z][a-z]/.test(t)) return true; // Starts with capital letter
  if (
    /\b(the|a|an|of|to|in|on|at|is|are|be|not|do|have|for|from|with|and|or|by)\b/.test(
      t,
    )
  )
    return true;
  if (/[A-Z]{2,}/.test(t)) return true; // Abbreviations
  return false;
}

// Heuristic: Is this line "Finnish-looking"?
function isFinnish(line) {
  if (!line || line.trim().length === 0) return false;
  const t = line.trim();
  // Finnish specific characters or lowercase Finnish patterns
  if (/[äöåÄÖÅ]/.test(t)) return true;
  if (/^[a-z]/.test(t) && !isEnglish(t)) return true;
  return false;
}

// Skip lines that are clearly noise (page markers, symbols, numbers only)
function isNoise(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^--\s*\d+\s*of\s*\d+\s*--$/.test(t)) return true;
  if (/^\d+$/.test(t)) return true; // Just a number
  if (/^[=\-|NRTWAXBCDLMPQSUVYZ%!@#$^&*(){}\[\]\\/<>~`"',.?;:+_\s]+$/.test(t))
    return true; // Symbol lines
  if (/Kappalekohtainen sanasto/i.test(t)) return true;
  if (/Aakkosellinen sanasto/i.test(t)) return true;
  if (/ISBN|Hansaprint|HansaBook|Finn Lectura|Vantaa|Taitto|Finn/i.test(t))
    return true;
  if (
    /suomi-englanti|suomi-venija|suomi-saksa|suomi-ranska|suomi-serbia/i.test(t)
  )
    return true;
  if (/Sisallys|Sisdllys|sanastot|Suomen mestari/i.test(t)) return true;
  return false;
}

// Clean up a Finnish word (fix common OCR issues)
function cleanFinnish(w) {
  return w
    .trim()
    .replace(/^[Kk](k)/, (m, p1) => (p1.toUpperCase() === p1 ? "K" : "k")) // Double K fix
    .replace(/\s+/g, " ")
    .trim();
}

// Clean up an English translation
function cleanEnglish(e) {
  return e
    .trim()
    .replace(/^1\s+/, "") // OCR "1" instead of "I"
    .replace(/\s+/g, " ")
    .trim();
}

// Strategy 1: Extract pairs where Finnish and English are on the same line
// Format: "Finnish English [page_num]" OR "Finnish | English" OR two tab-separated
function extractInlinePairs(lines) {
  const pairs = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (isNoise(line)) continue;

    // Tab-separated pairs (two columns preserved with tab)
    if (line.includes("\t")) {
      const parts = line
        .split("\t")
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 2 && isFinnish(parts[0]) && isEnglish(parts[1])) {
        pairs.push({
          finnish: cleanFinnish(parts[0]),
          english: cleanEnglish(parts[1]),
        });
        continue;
      }
    }

    // Pipe-separated: "Finnish English | Finnish English"
    if (line.includes("|")) {
      const segments = line.split("|").map((s) => s.trim());
      for (const seg of segments) {
        const parsed = parseInlinePair(seg);
        if (parsed) pairs.push(parsed);
      }
      continue;
    }

    // Pattern: "Finnish English number" — look for trailing page number
    // e.g. "paprika (sweet) pepper 8" or "parempi better 4"
    const withPageNum = line.match(/^(.+?)\s+([A-Z(,).a-z'\-;\/\s]+)\s+(\d+)$/);
    if (withPageNum) {
      const candidate = {
        finnish: withPageNum[1].trim(),
        english: withPageNum[2].trim(),
      };
      if (
        isFinnish(candidate.finnish) &&
        (isEnglish(candidate.english) || candidate.english.length > 1)
      ) {
        pairs.push({
          finnish: cleanFinnish(candidate.finnish),
          english: cleanEnglish(candidate.english),
        });
        continue;
      }
    }

    // Pattern: "Finnish English" where Finnish is lowercase and English is recognizable
    const parsed = parseInlinePair(line);
    if (parsed) pairs.push(parsed);
  }
  return pairs;
}

function parseInlinePair(line) {
  line = line.trim();
  if (!line || isNoise(line)) return null;

  // "(to) verb" pattern for English - skip if line is pure English
  if (line.startsWith("(to)") || line.startsWith("(")) return null;

  // Try split by first English-like sequence after Finnish
  // Finnish words don't contain uppercase mid-word (except proper nouns starting with caps)
  // Match: lowercase-starting word(s) followed by something that looks English
  const m = line.match(
    /^([a-zäöåÄÖÅA-Z][a-zäöåÄÖÅ\s\-=,().!?'']+?)\s{2,}(.+)$/,
  );
  if (m) {
    const f = m[1].trim();
    const e = m[2].trim();
    if (isFinnish(f) && e.length > 1) {
      return { finnish: cleanFinnish(f), english: cleanEnglish(e) };
    }
  }

  return null;
}

// Strategy 2: Block-based extraction (Finnish block followed by English block)
// Used for chapter sections where Finnish and English are in separate column blocks
function extractBlockPairs(text) {
  const pairs = [];
  // Split by page markers
  const pages = text.split(/-- \d+ of \d+ --/);

  for (const page of pages) {
    const lines = page
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const finnishLines = [];
    const englishLines = [];

    for (const line of lines) {
      if (isNoise(line)) continue;
      if (isFinnish(line) && !isEnglish(line)) {
        finnishLines.push(line);
      } else if (isEnglish(line) && !isFinnish(line)) {
        englishLines.push(line);
      }
    }

    // Only pair if counts roughly match
    const minLen = Math.min(finnishLines.length, englishLines.length);
    if (
      minLen > 0 &&
      Math.abs(finnishLines.length - englishLines.length) <= 5
    ) {
      for (let i = 0; i < minLen; i++) {
        pairs.push({
          finnish: cleanFinnish(finnishLines[i]),
          english: cleanEnglish(englishLines[i]),
        });
      }
    }
  }
  return pairs;
}

async function main() {
  const assetsDir = path.join(__dirname, "..", "src", "assets", "pdfs");
  const sm1Path = path.join(
    assetsDir,
    "(Converted) Suomen Mestari 1 Vocabularies - ENGLISH.pdf",
  );
  const sm2Path = path.join(
    assetsDir,
    "(Converted) Suomen Mestari 2 Vocabularies - ENGLISH.pdf",
  );

  console.log("Extracting SM1...");
  const sm1Text = await extractPdf(sm1Path);
  console.log("Extracting SM2...");
  const sm2Text = await extractPdf(sm2Path);

  const sm1Lines = sm1Text.split("\n");
  const sm2Lines = sm2Text.split("\n");

  console.log("Parsing inline pairs from SM1...");
  const sm1Inline = extractInlinePairs(sm1Lines);
  console.log(`SM1 inline pairs: ${sm1Inline.length}`);

  console.log("Parsing inline pairs from SM2...");
  const sm2Inline = extractInlinePairs(sm2Lines);
  console.log(`SM2 inline pairs: ${sm2Inline.length}`);

  console.log("Parsing block pairs from SM1...");
  const sm1Blocks = extractBlockPairs(sm1Text);
  console.log(`SM1 block pairs: ${sm1Blocks.length}`);

  console.log("Parsing block pairs from SM2...");
  const sm2Blocks = extractBlockPairs(sm2Text);
  console.log(`SM2 block pairs: ${sm2Blocks.length}`);

  // Merge and deduplicate by Finnish word (lowercased)
  function dedup(pairs) {
    const seen = new Map();
    for (const p of pairs) {
      const key = p.finnish.toLowerCase().trim();
      if (key.length >= 2 && !seen.has(key)) {
        seen.set(key, p);
      }
    }
    return Array.from(seen.values());
  }

  const sm1All = dedup([...sm1Inline, ...sm1Blocks]);
  const sm2All = dedup([...sm2Inline, ...sm2Blocks]);

  console.log(`\nSM1 unique pairs: ${sm1All.length}`);
  console.log(`SM2 unique pairs: ${sm2All.length}`);

  // Save to JSON for inspection
  fs.writeFileSync(
    path.join(__dirname, "sm1-vocab.json"),
    JSON.stringify(sm1All, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(__dirname, "sm2-vocab.json"),
    JSON.stringify(sm2All, null, 2),
    "utf8",
  );

  console.log("\nSaved sm1-vocab.json and sm2-vocab.json");
  console.log("\nSample SM1 pairs:");
  sm1All
    .slice(0, 20)
    .forEach((p) => console.log(`  ${p.finnish} => ${p.english}`));
  console.log("\nSample SM2 pairs:");
  sm2All
    .slice(0, 20)
    .forEach((p) => console.log(`  ${p.finnish} => ${p.english}`));
}

main().catch(console.error);
