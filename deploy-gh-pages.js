const ghpages = require('gh-pages');

// Path della directory di build
const buildPath = 'build'; // Cambia con il nome della tua directory di build

// Pubblica su GitHub Pages
ghpages.publish(buildPath, {
  branch: 'gh-pages',
  repo: 'https://github.com/<tuo-username>/<nome-repository>.git',
}, (err) => {
  if (err) {
    console.error('Errore durante il deploy:', err);
  } else {
    console.log('Deploy completato con successo!');
  }
});
