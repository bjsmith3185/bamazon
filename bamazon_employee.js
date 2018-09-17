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

function employeeLogin() {
    inquirer.prompt([
        {
            type: "list",
            name: "managerOrExecutive",
            message: "Select your position.",
            choices: ["Manager", "Executive"]
        },
    
    ]).then(function (user) {
        if (user.managerOrExecutive === "Manager") {
            managerLogIn();
        } if( user.managerOrExecutive === "Executive") {
            executiveLogIn();
        };
    
    });
};

employeeLogin();


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
                head: ['Name', 'Cost', 'Department', 'quantity']
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
                head: ['Name', 'Cost', 'Department', 'Quantity']
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
                        message: "Enter the updated value",
                    },

                ]).then(function (user) {
                    itemModified = user.toModify;
                    newValue = `'${user.newValue}'`;
                    var where = `item_name = '${itemToModify}'`;
                    // console.log(where);
                    var modified = `item_${itemModified}`;

                    if(user.toModify === "department") {
                        modified = 'department_name';
                    };

                    // console.log(`UPDATE inventory SET ${modified} = ${newValue} WHERE ${where} `);
                                //  UPDATE inventory SET department_name = food WHERE item_name = 'bananas'
                    connection.query(`UPDATE inventory SET ${modified} = ${newValue} WHERE ${where} `, function (err, res) {
                        if (err) throw err;

                        console.log("should be modified");
                        managerMenu();
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
        Department: ${category}
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





// function executiveLogIn() {
//     inquirer.prompt([
//         {
//             type: "input",
//             name: "executiveName",
//             message: "Enter your name.",
//         },
//         {
//             type: "input",
//             name: "executivePassword",
//             message: "Enter your password.",
//         },

//     ]).then(function (user) {
//         if (user.executiveName && user.executivePassword) {
//             executiveMenu();
//         } else {
//             console.log("Enter a valid name and password")
//             executiveLogIn();
//         }
//     });
// };


// function executiveMenu() {

//     inquirer.prompt([
//         {
//             type: "list",
//             name: "executiveActivity",
//             message: "Select the operation to execute.",
//             choices: ["View all products", "View low inventory items", "Add new item to inventory", "Modify an item in inventory", "LogOut"]
//         },

//     ]).then(function (user) {
//         console.log(user.executiveActivity);

//         if (user.executiveActivity === "View all products") {
//             displayAllProducts();
//         } else if (user.executiveActivity === "View low inventory items") {
//             lowInventory();
//         } else if (user.executiveActivity === "Add new item to inventory") {
//             enterNewItem();
//         } else if (user.executiveActivity === "Modify an item in inventory") {
//             modifyInventory();
//         } else if (user.executiveActivity === "LogOut") {
//             console.log(chalk.yellow("Exiting Program"))
//             connection.end();
//         }
//     });

// };


//----------------------------




function enterNewDepartment() {

    inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "Enter the name of the new Department.",
        },
        {
            type: "input",
            name: "overhead",
            message: "Enter the total over-head amount.",
        },
        
    ]).then(function (user) {
       var newDepartmentName = user.departmentName;
       var overHead = user.overhead;
        inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `
                Are you sure you want to create a new department, ${user.departmentName}
                with an over-head of $ ${overHead} ?
                
                `,
                default: true,
            },

        ]).then(function (user) {

            if (user.confirm) {
                connection.query("INSERT INTO departments SET ?",
                    {
                        department_name: newDepartmentName,
                        over_head_costs: overHead,
                    },
                    function (err, res) {
                        console.log(chalk.red("Department Added"));
                        executiveMenu();
                    }
                );

            } else {
                console.log(chalk.red("Returning to Main Menu."))
                executiveMenu();
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
            choices: ["View product sales reports", "Add new department", "LogOut"]
        },

    ]).then(function (user) {
        console.log(user.executiveActivity);

        if (user.executiveActivity === "View product sales reports") {
            salesReport();
        } else if (user.executiveActivity === "Add new department") {
            enterNewDepartment();
        } else if (user.executiveActivity === "LogOut") {
            console.log(chalk.yellow("Exiting Program"))
            connection.end();
        }
    });

};


function salesReport() {
    inquirer.prompt([
        {
            type: "list",
            name: "reportType",
            message: "Which report would you like to view?",
            choices: ["Financials for ALL departments", "Financial by department", "Back"]
        },

    ]).then(function (user) {
        console.log(user.reportType);

        if (user.reportType === "Financials for ALL departments") {
            financialAllDepartments();
        } else if (user.reportType === "Financial by department") {
            financialDepartmentSearch();
        } else if (user.reportType === "Back") {
            executiveMenu();
        };
    });
};


function financialAllDepartments() {
    var numberOfRows;

    connection.query("SELECT COUNT(department_id) AS NumberOfProducts FROM departments", function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);

        connection.query(`SELECT department_id, departments.department_name, over_head_costs, item_sales
            FROM departments
            INNER JOIN inventory ON departments.department_name = inventory.department_name
            GROUP BY department_name
            ORDER BY department_id`, function (err, res) {
                if (err) throw err;

                var table = new Table({
                    head: ['Department id', 'Department Name', 'Over Head Costs', 'Department Sales', 'Total Profit']
                    , colWidths: [10, 20, 30, 30, 30]
                });

                for (var i = 0; i < numberOfRows; i++) {

                    var overHead = res[i].over_head_costs;
                    var sales = res[i].item_sales;
                    var totalProfit = (sales - overHead);

                    table.push(
                        [res[i].department_id, res[i].department_name, "$ " + res[i].over_head_costs, "$ " + res[i].item_sales, "$ " + totalProfit],
                    );
                };
                console.log(`${table.toString()}
            
            `);
                executiveMenu();
            });
    });
};


function financialDepartmentSearch() {
    var numberOfRows;

    connection.query(`SELECT COUNT(department_id) AS NumberOfProducts FROM departments`, function (err, res) {
        if (err) throw err;
        numberOfRows = parseInt(res[0].NumberOfProducts);
    });

    var departmentNameArray = [];

    connection.query(
        `SELECT department_name FROM departments`,
        function (err, res) {
            if (err) throw err;

            for (var i = 0; i < numberOfRows; i++) {
                departmentNameArray.push(res[i].department_name);
            };

            inquirer.prompt([
                {
                    type: "list",
                    name: "departmentSales",
                    message: "Select department to view financials?",
                    choices: departmentNameArray,
                },

            ]).then(function (user) {
                var departmentToView = user.departmentSales;

                connection.query(`SELECT department_id, departments.department_name, over_head_costs, item_sales
                FROM departments
                INNER JOIN inventory ON departments.department_name = inventory.department_name
                WHERE departments.department_name = '${departmentToView}'
                GROUP BY department_name
                ORDER BY department_id`, function (err, res) {
                        if (err) throw err;

                        var overHead = res[0].over_head_costs;
                        var sales = res[0].item_sales;
                        var totalProfit = (sales - overHead);

                        var table = new Table({
                            head: ['Department id', 'Department Name', 'Over Head Costs', 'Department Sales', 'Total Profit'],
                            colWidths: [10, 20, 30, 30, 30]
                        });
                        table.push(
                            [res[0].department_id, res[0].department_name, "$ " + res[0].over_head_costs, "$ " + res[0].item_sales, "$ " + totalProfit]
                        );
                        console.log(`${table.toString()}
                
                `);
                        executiveMenu();
                    });


            });
        }
    );

};