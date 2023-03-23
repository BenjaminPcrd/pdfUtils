const fs = require('fs')
const PDFJS = require('pdfjs-dist')
const { PDFDocument } = require('pdf-lib')

// Get the location of the client name on the bill
async function getTextFromLocation(page, textLocation) {
    const content = await page.getTextContent()
    const text = content.items.find(item => 
        item.transform[5] === textLocation.x && item.transform[4] === textLocation.y && item.width > 0 && item.height > 0
    ).str
    return text
}

async function splitPdf(filePath, textCoord) {
    // Create output folder if it doesn't exist
    if (!fs.existsSync('output')) fs.mkdirSync('output')

    // Load the PDF file
    const fileData = new Uint8Array(fs.readFileSync(filePath))
    const pdfDoc = await PDFDocument.load(fileData)

    // Load the PDF pages using pdfjs
    const pdfjsDoc = await PDFJS.getDocument(fileData).promise
    const numPages = pdfjsDoc.numPages

    // Iterate over the pages and extract them as separate files
    for (let i = 0; i < numPages; i++) {
        const pdfjsPage = await pdfjsDoc.getPage(i + 1)
        const text = await getTextFromLocation(pdfjsPage, textCoord)
        const fomattedText = text.split(' ').slice(1).join('_').trim()
        const fileName = `pdf_${fomattedText}_${i + 1}` || `pdf_${i + 1}`

        const pdfDocCopy = await PDFDocument.create()
        const copiedPages = await pdfDocCopy.copyPages(pdfDoc, [i])
        copiedPages.forEach(page => pdfDocCopy.addPage(page))
        const pdfBytes = await pdfDocCopy.save()

        fs.writeFileSync(`output/${fileName}.pdf`, pdfBytes)
    }
}

const textCoords = { x: 682.2, y: 346.69 }
splitPdf('merged.pdf', textCoords).catch(console.error)
