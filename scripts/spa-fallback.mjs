import { copyFileSync } from 'node:fs'

/**
 * GitHub Pages serverar 404.html när en sökväg inte motsvarar en fil.
 * Eftersom appen sköter sin egen routing räcker det att den sidan är en kopia
 * av index.html — då kan användaren länka direkt till vilken vy som helst.
 */
copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html skapad (SPA-fallback för GitHub Pages)')
