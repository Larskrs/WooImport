const fs = require('fs');
const liveserver = require('./liveserver.js');
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
let WooCommerce;
let config;

checkedOrders = [];

function loadLive (_WooCommerce, _config) {
            
            WooCommerce = _WooCommerce;
            config = _config;
            console.log('\x1b[36m', `Config is set`, '\x1b[0m');
            //console.log('\x1b[33m', 'Checking for new orders', '\x1b[0m');
            loop();
        }
function loop () {
    setTimeout(() => {
        getOrders();
        loop();
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

            // displayDebug(result.data);

            if (config.displayMethod == 'list') {
                displayOrdersAsList(result.data)
            } else {
                displayOnlyNewOrders(result.data);
            }
            exportBillToCSV(result.data);
            fs.writeFileSync(__dirname + "/shownorders.json", JSON.stringify({data: checkedOrders}), 'utf8');
        }

    );
    }
    function displayOnlyNewOrders (orders) {
        for (let i = 0; i < orders.length; i++) {
                const e = orders[i]
            id = e.id;
            

            if (checkedOrders.indexOf(id) == -1) {
                
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
                
            }
                timestamp = e.date_created;
                console.log('\x1b[36m', ` ${isNew == true ? "NEW" : ""} [${timestamp}] - ${id} . ${e.billing.email} - ${getStatusColor(e.status)}(${e.status})`,  '\x1b[0m');



            // if (!fs.readFileSync(__dirname + "/shownOrders.json", 'utf8').includes(id)) {
            //     console.log(id + " - " + e.status);
            // }
        }
        console.log('-----------------------------------------------------', '\x1b[0m');
    }

    function exportBillToCSV (bills) {

        // get the amount of bills that have not been exported
        let billsToExport = bills.filter(bill => !isAlreadyExported(bill.id));

        if (billsToExport.length <= 0) {
            console.log('\x1b[33m', `No new bills to export`, '\x1b[0m');
            return;
        }


        console.log('\x1b[33m', `Exporting bills [${billsToExport.length}] to file`, '\x1b[0m');
        
        csv = "";
        
        for (let i = 0; i < bills.length; i++) {
            if (!isAlreadyExported(bills[i].id)) {
                csv = formatBillToCSV(bills[i], csv);
            }
        }

        console.log(csv);
        fs.writeFileSync(__dirname + "/bills.csv", csv, 'utf8');

    }
    function formatBillToCSV (bill, csv) {

        billing = bill.billing;
        // console log that we are formatting a bill
        console.log('\x1b[33m', `Formatting bill ${bill.id}`, '\x1b[0m');
        // check if this is the first bill listed.
        if (csv == "") {
            Object.keys(billing).forEach(function(k){
                //console.log(k + ' - ' + billing[k]);
                top = k + ',';
                csv += top;
            });
            csv += '\n';
        }

        Object.keys(billing).forEach(function(k){
            //console.log(k + ' - ' + billing[k]);
            csv += billing[k] +',';
        });
        csv += '\n';
        checkedOrders.push(bill.id);
        return csv;
    }
    function isAlreadyExported (id) {
        return checkedOrders.indexOf(id) != -1;
    }

module.exports = { loadLive };