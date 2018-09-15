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
        // console.log(user.managerOrExecutive)
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

    connection.query(`SELECT COUNT(id) AS NumberOfProducts FROM inventory WHERE item_quantity < 5`, function (err, res) {
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
                    [res[i].item_name, res[i].item_cost, res[i].item_category, res[i].item_quantity],
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
    connection.query("SELECT COUNT(id) AS NumberOfProducts FROM inventory", function (err, res) {
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
                    [res[i].item_name, res[i].item_cost, res[i].item_category, res[i].item_quantity],
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
                        choices: ["name", "category", "cost", "quantity"]
                    },
                    {
                        type: "input",
                        name: "newValue",
                        message: "Enter the new value you would like to modify",
                    },

                ]).then(function (user) {
                    itemModified = user.toModify;
                    newValue = user.newValue;

                    // console.log(`name ${itemToModify}  element ${itemModified}  newvalue ${newValue}`);

                    var where = `item_name = '${itemToModify}'`;
                    console.log(where);
                    var modified = `item_${itemModified}`;
                    connection.query(`UPDATE inventory SET ${modified} = ${newValue} WHERE ${where} `,function (err, res) {
                        if (err) throw err;
                        
                        console.log("should be modified");
                    });




                });
            });
        }
    );
};



// connection.query(`UPDATE inventory SET ${modified} = ${newValue} WHERE ${where} `,function (err, res) {
//     if (err) throw err;
    
// });
// // connection.query(`UPDATE inventory SET item_cost = .77 WHERE item-name = 'bananas' `)


// //----------------------------------
// var newQty;
// connection.query(`SELECT item_quantity FROM inventory WHERE ?`,
//     {
//         item_name: x
//     },
//     function (err, res) {
//         if (err) throw err;
//         var currentQty = parseFloat(res[0].item_quantity);
//         var additionalQty = parseFloat(y);
//         newQty = currentQty - additionalQty;
//         connection.query(
//             "UPDATE inventory SET ? WHERE ?",
//             [
//                 {
//                     item_quantity: newQty
//                 },
//                 {
//                     item_name: x
//                 }
//             ],
//             function (err, res) {
//                 // console.log(res.affectedRows + "products updated \n");
//             }
//         );
//         // connection.end();
//     });






function enterNewItem() {


    function createProduct() {
        console.log("inside createProduct \n");
        var query = connection.query(
            "INSERT INTO inventory SET ?",
            {
                item_name: "tv",
                item_category: "electronics",
                item_cost: 287.00,
                item_quantity: 35
            },

            function (err, res) {
                // console.log("!!!!!!")
                // console.log(res)
                console.log(res.affectedRows + " row inserted. \n");
                // updateProduct();

                // afterConnection();
                // connection.end();
            }

        );
        // afterConnection();
        // console.log(query.sql);
        connection.end();
    };

}