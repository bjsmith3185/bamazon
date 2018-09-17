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


inquirer.prompt([
    {
        type: "list",
        name: "managerOrExecutive",
        message: "Select your position.",
        choices: ["Manager", "Executive"]
    },

]).then(function (user) {
    // console.log(user.managerOrExecutive)
    if (user.managerOrExecutive === "Manager") {
        managerLogIn();
    } if( user.managerOrExecutive === "Executive") {
        executiveLogIn();
    }

});

function managerLogIn() {
    inquirer.prompt([
        {
            type: "input",
            name: "managerName",
            message: "Enter your name.",
        },
        {
            type: "input",
            name: "managerPassword",
            message: "Enter your password.",
        },

    ]).then(function (user) {
        if (user.managerName && user.managerPassword) {
            managerMenu();
        } else {
            console.log("Enter a valid name and password")
            managerLogIn();
        }
    });
};


function managerMenu() {
    inquirer.prompt([
        {
            type: "list",
            name: "managerActivity",
            message: "Select the operation to execute.",
            choices: ["View all products", "View low inventory items", "Add new item to inventory", "Modify an item in inventory", "LogOut"]
        },

    ]).then(function (user) {
        console.log(user.managerActivity);

        if (user.managerActivity === "View all products") {
            displayAllProducts();
        } else if (user.managerActivity === "View low inventory items") {
            lowInventory();
        } else if (user.managerActivity === "Add new item to inventory") {
            enterNewItem();
        } else if (user.managerActivity === "Modify an item in inventory") {
            modifyInventory();
        } else if (user.managerActivity === "LogOut") {
            console.log(chalk.yellow("Exiting Program"))
            connection.end();
        }
    });
};

function lowInventory() {
    var numberOfRows;

    connection.query(`SELECT COUNT(item_id) AS NumberOfProducts FROM inventory WHERE item_quantity < 5`, function (err, res) {
        if (err) throw err;

        numberOfRows = parseInt(res[0].NumberOfProducts);

        connection.query(`SELECT * FROM inventory WHERE item_quantity < 5`, function (err, res) {
            if (err) throw err;

            var table = new Table({
                head: ['Name', 'Cost', 'Category', 'quantity']
                , colWidths: [30, 20, 30, 10]
            });

            for (var i = 0; i < numberOfRows; i++) {
                table.push(
                    [res[i].item_name, "$ "+res[i].item_cost, res[i].department_name, res[i].item_quantity],
                );
            };
            console.log(`${table.toString()}
            
            `);
            managerMenu();
        });
    });
};


function displayAllProducts() {
    var numberOfRows;
    connection.query("SELECT COUNT(item_id) AS NumberOfProducts FROM inventory", function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);

        connection.query("SELECT * FROM inventory", function (err, res) {
            if (err) throw err;

            var table = new Table({
                head: ['Name', 'Cost', 'Category', 'Quantity']
                , colWidths: [30, 20, 30, 10]
            });

            for (var i = 0; i < numberOfRows; i++) {
                table.push(
                    [res[i].item_name, "$ "+res[i].item_cost, res[i].department_name, res[i].item_quantity],
                );
            };
            console.log(`${table.toString()}
            
            `);
            managerMenu();
        });
    });
};


function modifyInventory() {
    var numberOfRows;

    connection.query(`SELECT COUNT(item_name) AS NumberOfProducts FROM inventory`, function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);
    });

    var itemNameArray = [];

    connection.query(
        `SELECT item_name FROM inventory`,
        function (err, res) {
            if (err) throw err;

            for (var i = 0; i < numberOfRows; i++) {
                itemNameArray.push(res[i].item_name);
            };

            var itemToModify;
            var itemModified;
            var newValue;

            inquirer.prompt([
                {
                    type: "list",
                    name: "nameSelectedToUpdate",
                    message: "Which item would you like to modify?",
                    choices: itemNameArray,
                },

            ]).then(function (user) {
                itemToModify = user.nameSelectedToUpdate;
                inquirer.prompt([
                    {
                        type: "list",
                        name: "toModify",
                        message: "What value would you like to modify.",
                        choices: ["name", "department", "cost", "quantity"]
                    },
                    {
                        type: "input",
                        name: "newValue",
                        message: "Enter the new value you would like to modify",
                    },

                ]).then(function (user) {
                    itemModified = user.toModify;
                    newValue = user.newValue;
                    var where = `item_name = '${itemToModify}'`;
                    console.log(where);
                    var modified = `item_${itemModified}`;

                    if(user.toModify === "department") {
                        modified = 'department_name';
                    };


                    
                    // console.log(`name ${itemToModify}  element ${itemModified}  newvalue ${newValue}`);

                   
                  
                   
                    connection.query(`UPDATE inventory SET ${modified} = ${newValue} WHERE ${where} `, function (err, res) {
                        if (err) throw err;

                        console.log("should be modified");
                    });




                });
            });
        }
    );
};


function enterNewItem() {

    inquirer.prompt([
        {
            type: "input",
            name: "itemName",
            message: "Enter the name of the product.",
        },
        {
            type: "input",
            name: "itemCategory",
            message: "Enter the category of the product.",
        },
        {
            type: "input",
            name: "itemCost",
            message: "Enter the price of the product.",
        },
        {
            type: "input",
            name: "itemQuantity",
            message: "Enter the quantity.",
        },
 
    ]).then(function (user) {
        var name = user.itemName;
        var category = user.itemCategory;
        var price = user.itemCost;
        var amount = user.itemQuantity;

        console.log(`
        Your entered the following data:
        Item: ${name}
        Category: ${category}
        Cost: $${price}
        Quantity: ${amount}

        `);

        inquirer.prompt([
            {
                type: "confirm",
                name: "saveToDatabase",
                message: "Is this information correct?",
                default: true,
            },
    
        ]).then(function (user) {
            
            if(user.saveToDatabase) {
                connection.query("INSERT INTO inventory SET ?",
                {
                    item_name: name,
                    department_name: category,
                    item_cost: price,
                    item_quantity: amount,
                },
                function (err, res) {
                    console.log("product added")
                    managerMenu();
                }
            );

            } else {
                // information enter is incorrect
                console.log(chalk.red("Pleae re-enter the product information."))
                enterNewItem();
            };
        });
    });
};





function executiveLogIn() {
    inquirer.prompt([
        {
            type: "input",
            name: "executiveName",
            message: "Enter your name.",
        },
        {
            type: "input",
            name: "executivePassword",
            message: "Enter your password.",
        },

    ]).then(function (user) {
        if (user.executiveName && user.executivePassword) {
            executiveMenu();
        } else {
            console.log("Enter a valid name and password")
            executiveLogIn();
        }
    });
};


function executiveMenu() {

    inquirer.prompt([
        {
            type: "list",
            name: "executiveActivity",
            message: "Select the operation to execute.",
            choices: ["View all products", "View low inventory items", "Add new item to inventory", "Modify an item in inventory", "LogOut"]
        },

    ]).then(function (user) {
        console.log(user.executiveActivity);

        if (user.executiveActivity === "View all products") {
            displayAllProducts();
        } else if (user.executiveActivity === "View low inventory items") {
            lowInventory();
        } else if (user.executiveActivity === "Add new item to inventory") {
            enterNewItem();
        } else if (user.executiveActivity === "Modify an item in inventory") {
            modifyInventory();
        } else if (user.executiveActivity === "LogOut") {
            console.log(chalk.yellow("Exiting Program"))
            connection.end();
        }
    });

};