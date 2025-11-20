const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TEMPLATE_PATH = path.join(__dirname, 'clasp.json.template');
const OUTPUT_PATH = path.join(__dirname, '.clasp.json');

const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

function generateConfig(scriptId) {
        try {
                let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
                const config = template.replace('${SCRIPT_ID}', scriptId);
                fs.writeFileSync(OUTPUT_PATH, config);
                console.log(`Success! .clasp.json created with scriptId: ${scriptId}`);
        } catch (error) {
                console.error('Error generating .clasp.json:', error);
        }
}

if (fs.existsSync(OUTPUT_PATH)) {
        console.log('.clasp.json already exists.');
        rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                        promptForId();
                } else {
                        console.log('Operation cancelled.');
                        rl.close();
                }
        });
} else {
        promptForId();
}

function promptForId() {
        const args = process.argv.slice(2);
        if (args.length > 0) {
                generateConfig(args[0]);
                rl.close();
        } else {
                rl.question('Enter your Script ID: ', (id) => {
                        if (id.trim()) {
                                generateConfig(id.trim());
                        } else {
                                console.error('Script ID cannot be empty.');
                        }
                        rl.close();
                });
        }
}
