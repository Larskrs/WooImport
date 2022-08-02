const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();


function listenToPort(port) {
// Listen to port 4000
app.listen(port, () => {    
    console.log('\x1b[33m', `Starting Server on port ${port}`, '\x1b[0m');
    console.log('\x1b[32m', `Server is running on port ${port}`, '\x1b[0m');
}
);

}

// check connection to wordpress website rest api 
// https://www.planbit.no/wp-json/wc/v3?
// https://www.planbit.no/wp-json/wc/v3/products?

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
let WooCommerce;



// wait for ID input from terminal
const readline = require('readline');
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

const yaml = require('js-yaml');
var events = require('events');
var eventEmitter = new events.EventEmitter(); 
let config;

function showTitle() {
    console.clear();
    // show console startup logo and message
    
    try {
        const data = fs.readFileSync(__dirname + "/logo.txt", 'utf8');
        console.log(data);
        
    } catch (err) {
        console.error(err);
    }
}

showTitle();
onStart();

function onStart () {

    if (fs.existsSync(__dirname + "/liveconfig.yml")) {
        console.log(' Config file found');
    loadConf();
    } else {
        // Ask if user wants to create their own config or use the default
        console.log('We could not find a config file to use.');
        rl.question('Do you want to use the default config? (y/n)', (answer) => {
            if (answer === 'y') {
                createConf();
            } else {
                createConfSetup();
            }
        }
        );
        
    }
}


function loadConf() {   
    

    console.log('\x1b[33m', 'Loading config file', '\x1b[0m');
    config = yaml.safeLoad(fs.readFileSync('./liveconfig.yml', 'utf8'));
    
    loadWoocommerce(config.url, config.consumerKey, config.consumerSecret);

    // listen to port
    listenToPort(config.port);

    // should we use live mode?
}

eventEmitter.on('woocommerce-loaded', () => {
    console.log('\n');
    console.log('\x1b[32m', 'WooCommerce loaded', '\x1b[0m');
    // console log the WooCommerce Api Settings
    console.log( ' WooCommerce API Settings', '\x1b[0m');
    console.log('       URL: ' + WooCommerce.url, '\x1b[0m');
    console.log('       Api Version: ' + WooCommerce.version , '\x1b[0m');
    console.log('       Consumer Key: ' + '\x1b[31m ***', '\x1b[0m');
    console.log('       Consumer Secret: ' + '\x1b[31m ***', '\x1b[0m');
    console.log('-----------------------------------------------------', '\x1b[0m');
    
    // load live mode
        if (config.live) {
            console.log('\x1b[32m', 'Starting live mode', '\x1b[0m');
                loadLive();
                console.log('\x1b[32m', 'Live mode loaded', '\x1b[0m');
                // show display method
                console.log('\x1b[33m', 'Display method: ' + config.displayMethod, '\x1b[0m');
                console.log('-----------------------------------------------------', '\x1b[0m');

                console.log('\x1b[33m', 'Checking for new orders', '\x1b[0m');
        }
        

    });


function loadWoocommerce (url, consumerKey, consumerSecret) {
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM
console.log('\x1b[33m', 'Loading WooCommerce API', '\x1b[0m');
    WooCommerce = new WooCommerceRestApi({
        url: url,
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        version: 'wc/v3',
        queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
    });
    // emit event when WooCommerce is loaded
    setTimeout(() => {
        eventEmitter.emit('woocommerce-loaded');
    }, 1000);

    
    
}

function createConf(settings) {
    if (settings)
    fs.writeFileSync(__dirname + "/liveconfig.yml", settings, 'utf8');

    onStart();
}

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
                                onStart();
                                return;
                            }
                            createConf(settings);
                            
                        });
                        
                    } else {

                        if (storeurl == '' || consumerKey == '' || consumerSecret == '' || liveMode == '' || port == '') {
                            rl.prompt('\n');
                            rl.prompt('Please fill in all fields');
                            onStart();
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


checkedOrders = [];



function loadLive () {

            //console.log('\x1b[33m', 'Checking for new orders', '\x1b[0m');
            setTimeout(() => {
                getOrders();
                loadLive();
            }, 5000);
        }

        
        
function getStatusColor (status) {
    switch (status) {
        case 'processing':
            return '\x1b[33m';
        case 'on-hold':
            return '\x1b[33m';
        case 'completed':
            return '\x1b[32m';
        case 'cancelled':
            return '\x1b[31m';
        case 'refunded':
            return '\x1b[31m';
        case 'failed':
            return '\x1b[31m';
        default:
            return '\x1b[0m';
    }
}
        
function getOrders () {

    checkedOrders = JSON.parse(fs.readFileSync(__dirname + "/shownorders.json", 'utf8'))['data'];

    WooCommerce.get('orders', { 
            page : 1,
            per_page : 10,
        }).then(function(result) {

            if (config.displayMethod == 'list') {
                displayOrdersAsList(result.data)
            } else {
                displayOnlyNewOrders(result.data);
            }
            fs.writeFileSync(__dirname + "/shownorders.json", JSON.stringify({data: checkedOrders}), 'utf8');
        }

    );
    }
    function displayOnlyNewOrders (orders) {
        for (let i = 0; i < orders.length; i++) {
                const e = orders[i]
            id = e.id;
            

            if (checkedOrders.indexOf(id) == -1) {
                checkedOrders.push(id);
                timestamp = e.date_created;
                console.log('\x1b[36m', `[${timestamp}] - ${id} . ${getStatusColor(e.status)}(${e.status})`,  '\x1b[0m');
            }
        }
        
    }

    function displayOrdersAsList (orders) {
        //console.clear();
        for (let i = 0; i < orders.length; i++) {
            const e = orders[i];
            id = e.id;

            isNew = checkedOrders.indexOf(id) == -1;

            if (isNew) {
                checkedOrders.push(id);
            }
                timestamp = e.date_created;
                console.log('\x1b[36m', ` ${isNew == true ? "NEW" : ""} [${timestamp}] - ${id} . ${getStatusColor(e.status)}(${e.status})`,  '\x1b[0m');
            



            // if (!fs.readFileSync(__dirname + "/shownOrders.json", 'utf8').includes(id)) {
            //     console.log(id + " - " + e.status);
            // }
        }
        console.log('-----------------------------------------------------', '\x1b[0m');
    }



