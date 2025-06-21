const { execSync } = require('child_process');

function checkCommandAvailability(command) {
    try {
        execSync(`command -v ${command}`, { stdio: 'ignore' });
    } catch {
        console.error(`Error: ${command} is not available. Please install it.`);
        process.exit(1);
    }
}

console.log('Checking required commands...');
checkCommandAvailability('ng');
checkCommandAvailability('npx');

console.log('Building the project...');
execSync('ng build --prod', { stdio: 'inherit' });

console.log('Publishing to GitHub Pages...');
execSync('npx gh-pages -d docs/browser', { stdio: 'inherit' });

console.log('Deployment complete!');
