var Table = require('cli-table');
var mysql = require("mysql");
var chalk = require("chalk");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "December25",
    database: "records_db"
});

connection.connect(function (err) {
    if (err) throw err;

});

var userName;
var userEmail;

function welcomeUser() {
    inquirer.prompt([
        {
            type: "input",
            name: "customerName",
            message: "Enter your name.",
        },
        {
            type: "input",
            name: "customerEmail",
            message: "Enter your email.",
        },

    ]).then(function (user) {
        userName = user.customerName;
        userEmail = user.customerEmail;
        console.log(chalk.red(`Welcome ${user.customerName}.`));
        shop();
    });
};

welcomeUser();

function shop() {
    inquirer.prompt([
        {
            type: "list",
            name: "searchType",
            message: "Would you like to shop the entire store or by category?",
            choices: ["Shop entire store.", "Shop by department.", "Exit"]
        },

    ]).then(function (user) {
        if (user.searchType === "Shop entire store.") {
            printDatabase();
        } else if (user.searchType === "Shop by department.") {
            shopByCategory();
        } else if (user.searchType === "Exit") {
            console.log(chalk.yellow("Exiting Program"))
            connection.end();
        }
    });
};


function printDatabase() {
    var numberOfRows;
    connection.query("SELECT COUNT(item_id) AS NumberOfProducts FROM inventory", function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);

        connection.query("SELECT * FROM inventory", function (err, res) {
            if (err) throw err;

            var table = new Table({
                head: ['Name', 'Cost', 'Category']
                , colWitem_idths: [30, 20, 30]
            });

            for (var i = 0; i < numberOfRows; i++) {
                table.push(
                    [res[i].item_name, "$ " + res[i].item_cost, res[i].department_name],
                );
            };
            console.log(table.toString());
            selectForPurchaseBothSearches();
        });
    });
};


function shopByCategory() {
    var numberOfRows;

    connection.query(`SELECT COUNT( DISTINCT(department_name) ) AS NumberOfProducts FROM inventory`, function (err, res) {
        if (err) throw err;

        numberOfRows = parseInt(res[0].NumberOfProducts);
    });

    var itemCategoryArray = [];

    connection.query(
        `SELECT DISTINCT department_name FROM inventory`,
        function (err, res) {
            if (err) throw err;

            for (var i = 0; i < numberOfRows; i++) {
                itemCategoryArray.push(res[i].department_name);
            };

            inquirer.prompt([
                {
                    type: "list",
                    name: "categorySelected",
                    message: "Which category would you like to shop?",
                    choices: itemCategoryArray,
                },

            ]).then(function (user) {
                categoryPrintDatabase(user.categorySelected);
            });
        }
    );
};


function selectForPurchaseBothSearches(x) {
    var where;
    if (x) {
        where = `WHERE department_name = '${x}'`;
    } else {
        where = '';
    }

    var numberOfRows;

    connection.query(`SELECT COUNT(item_name) AS NumberOfProducts FROM inventory ${where}`, function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);
    });

    var itemNameArray = [];

    connection.query(`SELECT item_name FROM inventory ${where}`,
        function (err, res) {

            for (var i = 0; i < numberOfRows; i++) {
                itemNameArray.push(res[i].item_name);
            };

            inquirer.prompt([
                {
                    type: "list",
                    name: "purchaseItem",
                    message: "Which item would you like to purchase?",
                    choices: itemNameArray
                },
                {
                    type: "input",
                    name: "qtyForPurchase",
                    message: "Enter the quantity you would like to purchase.",
                },

            ]).then(function (user) {
                checkQuantity(user.purchaseItem, user.qtyForPurchase);
            });
        }
    );
};


function checkQuantity(x, y) {
    var costOfItem;
    connection.query(
        `SELECT item_cost AS price FROM inventory WHERE item_name = '${x}'`,
        function (err, res) {
            if (err) throw err;
            costOfItem = res[0].price;
            console.log(res[0].price);
        });

    connection.query(
        `SELECT item_quantity FROM inventory WHERE item_name = '${x}'`,
        function (err, res) {
            if (err) throw err;

            var numberInStock = parseFloat(res[0].item_quantity);

            if ((numberInStock - parseFloat(y)) >= 0) {
                updateProduct(x, y);
                // makePurchase(x, y, costOfItem);
                collectUserData(x, y, costOfItem);
            } else {

                inquirer.prompt([
                    {
                        type: "list",
                        name: "buyOrReturn",
                        message: `There are currently only ${numberInStock} in stock. Would you like to purchase the remaining ${numberInStock}?`,
                        choices: [`Purchase the ${numberInStock} in stock.`, "Return to Main Menu."]
                    },

                ]).then(function (user) {
                    if (user.buyOrReturn === "Return to Main Menu.") {
                        shop();
                    } else {
                        updateProduct(x, numberInStock);
                        makePurchase(x, numberInStock, costOfItem);
                    }
                });
            }
        });
};


function updateProduct(x, y) {
    var newQty;
    connection.query(`SELECT item_quantity FROM inventory WHERE ?`,
        {
            item_name: x
        },
        function (err, res) {
            if (err) throw err;
            var currentQty = parseFloat(res[0].item_quantity);
            var additionalQty = parseFloat(y);
            newQty = currentQty - additionalQty;
            connection.query(
                "UPDATE inventory SET ? WHERE ?",
                [
                    {
                        item_quantity: newQty
                    },
                    {
                        item_name: x
                    }
                ],
                function (err, res) {

                }
            );

        });
};


// function makePurchase(x, y, z) {
//     var totalOrderPrice = parseFloat(y) * parseFloat(z);

//     connection.query(`UPDATE inventory SET item_sales = ${totalOrderPrice} WHERE item_name = '${x}' `, function (err, res) {
//         if (err) throw err;

//         console.log(chalk.magenta(`
// ${userName},
//     Your purchase of ${y} ${x}(s) will be processes
//     as soon as possible. Please enter your mailing
//     information in the link below.

//     The total cost of your order is $${totalOrderPrice}.

//     Thank You,
//     Bamazon!

//     `));
//         shop();
//     });
// };


function categoryPrintDatabase(x) {
    var numberOfRows;

    connection.query(`SELECT COUNT(item_id) AS NumberOfProducts FROM inventory WHERE department_name = '${x}'`, function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);
    });

    connection.query(`SELECT * FROM inventory WHERE department_name = '${x}'`, function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ['Name', 'Cost', 'Category']
            , colWitem_idths: [30, 20, 30]
        });

        for (var i = 0; i < numberOfRows; i++) {
            table.push(
                [res[i].item_name, "$ " + res[i].item_cost, res[i].department_name],
            );

        };
        console.log(table.toString());
        selectForPurchaseBothSearches(x);
    });
};




function makePurchase(x, y, z) {
    // x = item purchased 
    // y = quantity
    // z = cost per unit.


    var totalOrderPrice = parseFloat(y) * parseFloat(z);

    connection.query(`UPDATE inventory SET item_sales = ${totalOrderPrice} WHERE item_name = '${x}' `, function (err, res) {
        if (err) throw err;

        console.log(chalk.magenta(`
${userName},
    Your purchase of ${y} ${x}(s) will be processes
    as soon as possible. Please enter your mailing
    information in the link below.

    The total cost of your order is $${totalOrderPrice}.
    
    Thank You,
    Bamazon!
    
    `));
        shop();
    });
};


function collectUserData(x, y, z) {
    // x = item purchased 
    // y = quantity
    // z = cost per unit.
    console.log("Pleae enter your information below to continue with your order.");

    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "Enter your first name.",
        },
        {
            type: "input",
            name: "lastName",
            message: "Enter your last name.",
        },
        {
            type: "input",
            name: "address",
            message: "Enter your street address.",
        },
        {
            type: "input",
            name: "city",
            message: "Enter city.",
        },
        {
            type: "input",
            name: "state",
            message: "Enter state.",
        },
        {
            type: "input",
            name: "zipcode",
            message: "Enter zipcode.",
        },
        {
            type: "input",
            name: "email",
            message: "Enter your email.",
        },
        {
            type: "input",
            name: "phone",
            message: "Enter your phone number.",
        },

    ]).then(function (user) {
        var first = user.firstName;
        var last = user.lastName;
        var address = user.address;
        var city = user.city;
        var state = user.state;
        var zip = user.zipcode;
        var email = user.email;
        var phone = user.phone;


        console.log(`
        Name: ${user.firstName} ${user.lastName}
        Address: ${user.address}
        City: ${user.city} State: ${user.state} Zip: ${user.zipcode}
        Email: ${user.email}
        Phone: ${user.phone}
        
        `);

        inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: "Is this information correct?",
            },
        ]).then(function (user) {
            console.log(user.confirm);

            if (user.confirm) {
                // push to database
                connection.query("INSERT INTO customers SET ?",
                    {
                        cust_first: first,
                        cust_last: last,
                        cust_address: address,
                        cust_city: city,
                        cust_state: state,
                        cust_zip: zip,
                        cust_email: email,
                        cust_phone: phone,
                        // order_id: 

                    },
                    function (err, res) {
                        console.log("customer into sent to database")
                            // get customer_id from database 
                            // use this below; then use the cust_id recieved to send with orders push
                            `SELECT cust_id FROM customers WHERE cust_first = '${first}' AND cust_last = '${last}}'`;


                        connection.query(`SELECT cust_id AS custID FROM customers WHERE cust_first = '${first}' AND cust_last = '${last}}'`,
                            function (err, res) {
                                console.log(res.custID);




                            }
                        );

                    }
                );

            } else {
                console.log("Pleae re-enter your information.")
                collectUserData();
            }
        });
    });
};


collectUserData();


function saveOrderData() {

    connection.query("INSERT INTO orders SET ?",
        {
            cust_id:
                order_product:
            order_quantity:
                order_cost:
            order_totalCost: 
                },
        function (err, res) {
            console.log("order info sent to database")



        }
    );

};