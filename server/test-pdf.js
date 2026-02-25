const pdf = require('pdf-parse');
console.log('Type:', typeof pdf);
console.log('Keys:', Object.keys(pdf));
if (typeof pdf === 'function') {
    console.log('It is a function directly');
} else if (pdf.default && typeof pdf.default === 'function') {
    console.log('It has a .default function');
} else {
    console.log('No function found');
}
