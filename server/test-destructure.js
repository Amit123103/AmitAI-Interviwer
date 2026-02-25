const pdf = require('pdf-parse');
console.log('Keys:', Object.keys(pdf));
if (pdf.pdfParse) {
    console.log('pdfParse found as a property');
} else {
    console.log('pdfParse NOT found as a property');
}
