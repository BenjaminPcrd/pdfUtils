import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist";

const getName = async (page) => {
  const content = await page.getTextContent();
  const item = content.items.find(
    (item) => item.str.startsWith("Monsieur") || item.str.startsWith("Madame")
  );
  return item.str.split(" ").slice(1).join("_").trim();
};

const splitPdf = async (filePath) => {
  // Create output folder if it doesn't exist
  if (!fs.existsSync("output")) fs.mkdirSync("output");

  // Load the PDF file
  const fileData = new Uint8Array(fs.readFileSync(filePath));
  const pdfDoc = await PDFDocument.load(fileData);

  // Load the PDF pages using pdfjs
  const pdfjsDoc = await getDocument(fileData).promise;
  const numPages = pdfjsDoc.numPages;

  // Iterate over the pages and extract them as separate files
  for (let i = 0; i < numPages; i++) {
    const pdfjsPage = await pdfjsDoc.getPage(i + 1);
    const name = await getName(pdfjsPage);
    const fileName = `JP_ASAP_${name}` || `pdf_${i + 1}`;

    const pdfDocCopy = await PDFDocument.create();
    const copiedPages = await pdfDocCopy.copyPages(pdfDoc, [i]);
    copiedPages.forEach((page) => pdfDocCopy.addPage(page));
    const pdfBytes = await pdfDocCopy.save();

    fs.writeFileSync(`output/${fileName}.pdf`, pdfBytes);
  }
};

splitPdf("PJ_ASAP_NOM_Prénom.pdf").catch(console.error);
