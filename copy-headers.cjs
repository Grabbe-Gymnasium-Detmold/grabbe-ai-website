// copy-headers.cjs
const fs = require('fs');
const path = require('path');

// Quelle: _headers-Datei im Root-Verzeichnis
const headersSource = path.join(__dirname, '_headers');

// Ziel: dist-Verzeichnis nach dem Build
const headersDestination = path.join(__dirname, 'dist', '_headers');

fs.copyFile(headersSource, headersDestination, (err) => {
    if (err) {
        console.error('Fehler beim Kopieren der _headers-Datei:', err);
    } else {
        console.log('_headers-Datei erfolgreich in dist kopiert.');
    }
});
