const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const pdfs = [
  {
    file: "src/assets/pdfs/suomi \u2013 English _ Kielet _ Oppiminen _ yle.fi.pdf",
    name: "yle",
  },
  {
    file: "src/assets/pdfs/Suomen Mestari 1 Sanastot ( PDFDrive ).pdf",
    name: "sm1",
  },
  {
    file: "src/assets/pdfs/Suomen Mestari 2 Sanastot ( PDFDrive ).pdf",
    name: "sm2",
  },
];

async function extractText(filePath) {
  const buf = fs.readFileSync(filePath);
  const p = new PDFParse({ data: buf });
  await p.load();
  const total = (await p.getInfo()).total;
  let out = "";
  for (let i = 1; i <= total; i++) {
    const page = await p.doc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map((item) => item.str).join(" ");
    out += text + "\n";
    if (i % 20 === 0) process.stdout.write(`  page ${i}/${total}\n`);
  }
  return out;
}

async function main() {
  for (const { file, name } of pdfs) {
    console.log(`\nExtracting ${name}...`);
    const text = await extractText(file);
    const out = path.join("scripts", `${name}.txt`);
    fs.writeFileSync(out, text, "utf8");
    console.log(`  Written ${out} (${text.length} chars)`);
  }
}

main().catch(console.error);
