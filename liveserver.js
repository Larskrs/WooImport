// _       __            ____                           __          ___
// | |     / /___  ____  /  _/___ ___  ____  ____  _____/ /_   _   _<  /
// | | /| / / __ \/ __ \ / // __ `__ \/ __ \/ __ \/ ___/ __/  | | / / / 
// | |/ |/ / /_/ / /_/ // // / / / / / /_/ / /_/ / /  / /_    | |/ / /  
// |__/|__/\____/\____/___/_/ /_/ /_/ .___/\____/_/   \__/    |___/_/   
//                                 /_/ Created by Larskrs                                                 
// ____________________________________________________________________


const fs = require('fs');

loadNPM();




const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const configCreator = require('./configcreator');
const liveMode = require('./livemode');

const readline = require('readline');
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: false
});

const yaml = require('js-yaml');
var events = require('events');


function listenToPort(port) {
// Listen to port 4000

app.listen(port, () => {    
    console.log('\x1b[33m', `Starting Server on port ${port}`, '\x1b[0m');
    console.log('\x1b[32m', `Server is running on port ${port}`, '\x1b[0m');
}
);

}

function loadNPM() {
    // Check if node_modules folder exists
    if (fs.existsSync(__dirname + "/node_modules")) {
        console.log('\x1b[32m', `Node modules are installed`, '\x1b[0m');
        return true;
    }
    else {
        console.log('\x1b[33m', `Node modules are not installed`, '\x1b[0m');
        console.log('\x1b[33m', `Installing Node modules`, '\x1b[0m');
        require('child_process').execSync('npm install');
        console.log('\x1b[32m', `Node modules are installed`, '\x1b[0m');
        // tell the client that we will now try to load the npm modules again
        console.log('\x1b[33m', `Attempting to reload the server.`, '\x1b[0m');
        setTimeout(() => {
            loadNPM();
        }), 4000;
    }
}
// check connection to wordpress website rest api 
// https://www.planbit.no/wp-json/wc/v3?
// https://www.planbit.no/wp-json/wc/v3/products?

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
let WooCommerce;



// wait for ID input from terminal
var eventEmitter = new events.EventEmitter(); 
let config;

function showTitle() {
    console.clear();
    // show console startup logo and message
    
    try {
        const data = fs.readFileSync(__dirname + "/assets/logo.txt", 'utf8');
        console.log(data);
        
    } catch (err) {
        console.error(err);
    }
}

showTitle();
onStart();

function onStart () {

    if (fs.existsSync(__dirname + "/config.yml")) {
        console.log(' Config file found');
    loadConf();
    } else {
        // Ask if user wants to create their own config or use the default
        console.log('We could not find a config file to use.');
        configCreator.createConfSetup();
        
        
    }
}


function loadConf() {   
    

    console.log('\x1b[33m', 'Loading config file', '\x1b[0m');
    config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
    
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
                liveMode.loadLive(WooCommerce, config);
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








module.exports = { onStart};
