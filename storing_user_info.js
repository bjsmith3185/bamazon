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


shop();

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
            // console.log(res[0].price);
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
                        // makePurchase(x, numberInStock, costOfItem);
                        collectUserData(x, numberInStock, costOfItem);
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


function receipt(first, last, order, address, city, state, zip, email, phone, totalOrderPrice, qty, product) {

        console.log(chalk.magenta(`
${first},                           Order # ${order}

    Your purchase of ${qty} ${product}(s) will be processes
    as soon as possible. Your order will be shipped
    to the address below.

    ${first} ${last}
    ${address}
    ${city}  ${state}  ${zip}

    Email: ${email}
    Phone: ${phone}

    The total cost of your order is $${totalOrderPrice}.
    
    Thank You,
    Bamazon!
    
    `));
        shop();
};


function collectUserData(x, y, z) {
    var totalCost = (parseFloat(y) * parseFloat(z));

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
        City: ${user.city},  State: ${user.state},  Zip: ${user.zipcode}
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
                if (user.confirm) {
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
                    },
                    function (err, res) {
                     
                        connection.query(`SELECT cust_id AS custID FROM customers WHERE (cust_first = '${first}' AND cust_last = '${last}')`,
                            function (err, res) {
                                console.log(res[0].custID);
                                var order = res[0].custID;
                               
                                connection.query("INSERT INTO orders SET ?",
                                    {
                                        cust_id: res[0].custID,
                                        order_product: x,
                                        order_quantity: y,
                                        order_cost: z,
                                        order_totalCost: totalCost,
                                    },
                                    function (err, res) {
  
                                        receipt(first, last, order, address, city, state, zip, email, phone, totalCost, y, x);


                                    } // end of third push to database 
                                ); // end of third query

                            } // end of second push to database 
                        );  // end of second query
                    }  // end of first push to database
                ); // end of first query 
            } else {
                console.log("Pleae re-enter your information.")
                collectUserData();
                };


            }); // end of second inquirer 

    }); // end of first inquirer
};


