var Table = require('cli-table');
var mysql = require("mysql");
var chalk = require("chalk");
var inquirer = require("inquirer");



var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "records_db"
});

connection.connect(function (err) {
    if (err) throw err;

});

var userName;
var userEmail;


function printDatabase() {
    var numberOfRows;
    connection.query("SELECT COUNT(item_id) AS NumberOfProducts FROM inventory", function (err, res) {
        if (err) throw err;
        // console.log(res[0].NumberOfProducts)
        numberOfRows = parseInt(res[0].NumberOfProducts);
        // });


        connection.query("SELECT * FROM inventory", function (err, res) {
            if (err) throw err;

            var table = new Table({
                head: ['Name', 'Cost', 'Category']
                , colWitem_idths: [30, 20, 30]
            });

            for (var i = 0; i < numberOfRows; i++) {
                table.push(
                    [res[i].item_name, "$ "+res[i].item_cost, res[i].department_name],
                );

            };
            console.log(table.toString());
            // selectForPurchase();
            selectForPurchaseBothSearches();
        });
    });
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
            // console.log(res[0].item_quantity)
            var numberInStock = parseFloat(res[0].item_quantity);
            // console.log(numberInStock + "  " + parseFloat(y))
            if ((numberInStock - parseFloat(y)) >= 0) {
                // console.log("there are enough for you to buy");
                updateProduct(x, y);
                makePurchase(x, y, costOfItem);

            } else {

                inquirer.prompt([
                    {
                        type: "list",
                        name: "buyOrReturn",
                        message: `There are currently only ${numberInStock} in stock. Would you like to purchase the remaining ${numberInStock}?`,
                        choices: [`Purchase the ${numberInStock} in stock.`, "Return to Main Menu."]
                    },


                ]).then(function (user) {
                    // console.log(user.buyOrReturn);
                    if (user.buyOrReturn === "Return to Main Menu.") {
                        // return to main menu
                        // console.log("return to main menu");
                        shop();
                    } else {
                        // console.log("go ahead with purchase");
                        updateProduct(x, numberInStock);
                        makePurchase(x, numberInStock, costOfItem);
                    }
                });
            }
        });
};


function updateProduct(x, y) {
    // console.log("updating products \n");
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
                    // console.log(res.affectedRows + "products updated \n");
                }
            );
            // connection.end();
        });
};


function makePurchase(x, y, z) {
    // name is x, quantity is y
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


function shopByCategory() {
    var numberOfRows;

    connection.query(`SELECT COUNT( DISTINCT(department_name) ) AS NumberOfProducts FROM inventory`, function (err, res) {
        if (err) throw err;
        // console.log(res[0].NumberOfProducts)
        numberOfRows = parseInt(res[0].NumberOfProducts);
        // console.log(numberOfRows);
    });

    var itemCategoryArray = [];

    connection.query(
        `SELECT DISTINCT department_name FROM inventory`,
        function (err, res) {
            if (err) throw err;
            // console.log(res);

            for (var i = 0; i < numberOfRows; i++) {
                // console.log(res[i].item_name);
                itemCategoryArray.push(res[i].department_name);
            };
            // console.log(itemCategoryArray);

            inquirer.prompt([
                {
                    type: "list",
                    name: "categorySelected",
                    message: "Which category would you like to shop?",
                    choices: itemCategoryArray,
                },


            ]).then(function (user) {
                // console.log(user.categorySelected);
                categoryPrintDatabase(user.categorySelected);
            });
        }
    );
};


function categoryPrintDatabase(x) {
    var numberOfRows;

    connection.query(`SELECT COUNT(item_id) AS NumberOfProducts FROM inventory WHERE department_name = '${x}'`, function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);

        // console.log(`number of rows in ${x} category ${numberOfRows}`);
    });


    connection.query(`SELECT * FROM inventory WHERE department_name = '${x}'`, function (err, res) {
        if (err) throw err;

        var table = new Table({
            head: ['Name', 'Cost', 'Category']
            , colWitem_idths: [30, 20, 30]
        });

        for (var i = 0; i < numberOfRows; i++) {
            table.push(
                [res[i].item_name, "$ "+res[i].item_cost, res[i].department_name],
            );

        };
        console.log(table.toString());
        // selectForPurchase();
        selectForPurchaseBothSearches(x);
    });
};



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
    // console.log(user.customerName+ "  " + user.customerEmail);
    console.log(chalk.red(`Welcome ${user.customerName}.`));
    shop();
});



function shop() {
    inquirer.prompt([
        {
            type: "list",
            name: "searchType",
            message: "Would you like to shop the entire store or by category?",
            choices: ["Shop entire store.", "Shop by department.", "Exit"]
        },

    ]).then(function (user) {
        // console.log(user.searchType);
        if (user.searchType === "Shop entire store.") {
            // function to view entire store
            printDatabase();
        } else if (user.searchType === "Shop by department.") {
            // function to select from category
            shopByCategory();
        } else if (user.searchType === "Exit") {
            // exit program
            console.log(chalk.yellow("Exiting Program"))
            connection.end();
        }

    });
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
        // console.log(res[0].NumberOfProducts)
        numberOfRows = parseInt(res[0].NumberOfProducts);
        // console.log(numberOfRows);
    });

    var itemNameArray = [];

    connection.query(
        // `SELECT ${x} FROM inventory`,
        `SELECT item_name FROM inventory ${where}`,
        // `SELECT item_name FROM inventory`,

        function (err, res) {

            for (var i = 0; i < numberOfRows; i++) {
                // console.log(res[i].item_name);
                itemNameArray.push(res[i].item_name);
            }
            // connection.end();
            // console.log(itemNameArray);

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
                // console.log(user.purchaseItem + "  " + user.qtyForPurchase+ " " + user.);
                checkQuantity(user.purchaseItem, user.qtyForPurchase);
            });
        }
    );
};






// function collectUserData() {
//     console.log("Pleae enter your information below to continue with your order.");

//     inquirer.prompt([
//         {
//             type: "input",
//             name: "firstName",
//             message: "Enter your first name.",
//         },
//         {
//             type: "input",
//             name: "lastName",
//             message: "Enter your last name.",
//         },
//         {
//             type: "input",
//             name: "address",
//             message: "Enter your street address.",
//         },
//         {
//             type: "input",
//             name: "city",
//             message: "Enter city.",
//         },
//         {
//             type: "input",
//             name: "state",
//             message: "Enter state.",
//         },
//         {
//             type: "input",
//             name: "zipcode",
//             message: "Enter zipcode.",
//         },
//         {
//             type: "input",
//             name: "email",
//             message: "Enter your email.",
//         },
//         {
//             type: "input",
//             name: "phone",
//             message: "Enter your phone number.",
//         },
        
//     ]).then(function (user) {

//         console.log(`
//         Name: ${user.firstName} ${user.lastName}
//         Address: ${user.address}
//         City: ${user.city} State: ${user.state} Zip: ${user.zipcode}
//         Email: ${user.email}
//         Phone: ${user.phone}
        
//         `);

//         inquirer.prompt([
//             {
//                 type: "confirm",
//                 name: "confirm",
//                 message: "Is this information correct?",
//             },
//         ]).then(function (user) {
//             console.log(user.confirm);
          
    
//         });
       

//     });



// };


// collectUserData() 