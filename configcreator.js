const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const liveServer = require('./liveserver');
const fs = require('fs');


function createConfSetup() {

    settings = "";

    rl.question('What port do you want to use? (default: 4000)', (port) => {
        if (port === '') {
            settings += 'port: 4000\n';
        } else {
            settings += 'port: ' + port + '\n';
        }

        
    rl.question ('What is your WooCommerce store URL? "https: mystore.com" ', (storeurl) => {
        settings += "url: " + storeurl + "\n";
        rl.question ('What is your WooCommerce store consumerKey? ', (consumerKey) => {
            settings += "consumerKey: " + consumerKey + "\n";
        rl.question ('What is your WooCommerce store consumerSecret? ', (consumerSecret) => {
            settings += "consumerSecret: " + consumerSecret + "\n";
        rl.question ('should we run in live mode? (y/n) ', (liveMode) => {
            liveMode = liveMode == 'y' ? true : false; 
            settings += "live: " + liveMode + "\n";
                    if (liveMode) {
                        rl.question('What display method do you want to use? (default: new)', (displayMethod) => {
                            if (displayMethod === '') {
                                settings += 'displayMethod: new\n';
                            } else {
                                settings += 'displayMethod: ' + displayMethod + '\n';
                            }

                            if (storeurl == '' || consumerKey == '' || consumerSecret == '' || liveMode == '' || port == '') {
                                rl.prompt('\n');
                                rl.prompt('Please fill in all fields');
                                liveServer.onStart();
                                return;
                            }
                            createConf(settings);
                            
                        });
                        
            } else {

                        if (storeurl == '' || consumerKey == '' || consumerSecret == '' || liveMode == '' || port == '') {
                            rl.prompt('\n');
                            rl.prompt('Please fill in all fields');
                            liveServer.onStart();
                            return;
                        }
                        createConf(settings);
                    }
                });
            }
            );
        }
        );
    }
    );
}
);
}

function createConf(settings) {
    console.log('\x1b[33m', 'Creating config file', '\x1b[0m');
    fs.writeFileSync('./liveconfig.yml', settings);
    console.log('\x1b[32m', 'Config file created', '\x1b[0m');
    loadConf();
}

module.exports = { createConfSetup };

