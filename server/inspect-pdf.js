const pdf = require('pdf-parse');
console.log('Keys:', Object.keys(pdf));
for (const key of Object.keys(pdf)) {
    if (typeof pdf[key] === 'function') {
        console.log(`Key ${key} is a function`);
    }
}
