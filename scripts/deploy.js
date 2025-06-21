const { execSync } = require('child_process');

console.log('Building the project...');
execSync('ng build --prod', { stdio: 'inherit' });

console.log('Publishing to GitHub Pages...');
execSync('npx gh-pages -d docs/browser', { stdio: 'inherit' });

console.log('Deployment complete!');
