const fs = require('fs')
const { PDFDocument } = require('pdf-lib')

async function mergePDFs() {
    const files = fs.readdirSync(__dirname)
    const pdfFiles = files.filter(file => file.endsWith('.pdf'))

    const mergedPdf = await PDFDocument.create()

    for (const file of pdfFiles) {
        const pdfBytes = fs.readFileSync(file)
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
        pages.forEach(page => {
            mergedPdf.addPage(page)
        })
    }

    const pdfBytes = await mergedPdf.save()
    fs.writeFileSync('merged.pdf', pdfBytes)
}

mergePDFs().catch(console.error)