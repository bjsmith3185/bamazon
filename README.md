# bamazon
using node.js and mysql


bamazon let the user select from 2 files; bamazon_customer.js  or  bamazon_employee.js

NOTES;
Executive name and password: first name 'brian'  last name 'smith'  password '1234'  all lowercase

A manager's name and password is; first name 'john' password '1234'  all lowercase



bamazon_customer.js features;

- user can sign-in (if they have make a previous purchase) or shop as a guest.
    - if signing in the user will be prompted for their first name and email. if the information entered matched that in the the database the user will be signed in. if not they will be prompted to re-enter the information.

- user can shop by viewing the entire store products or by selecting a store department.
    - entire store will show all products listed
    - store department will show only those products in that department

- user can make a selection from available items to purchase ( if the item quantity is 0 it will not be shown)
- user can then select the quantity of that item they would like to purchase
    -( if the user enters a quantity greater than that in inventory, the option of purchasing the remaining amount or selecting another product is available )
- if the user continues with the purchase they will be prompted to enter their mailing informaion
    - once all information entered is confirmed the receipt will be printed

- if the user has already signed in they will see the receipt printed

* this program will update the database after each purchase is made.


bamazon_employee.js features;

- user can login as either a manger or an executive

- manager login
    - has the following options available
        * view the entire store database
        * view the low inventory items (those with a quantity below 5)
        * modify an item in inventory
            - user selects from the products in the inventory
            - user the selects the value to modify (name, department, cost, quantity)
            - user enters the new value to be updated

        * add a new item to the inventory
            - user is prompted to enter all information related to the new product.

- executive login (This is high level stuff, only for CEO's!!! haha)
    - has the following options available
        * view product sales report
            - user will select to view all departments or select by department
        * add a new department to the shop
            - user will enter the name of the new department
            - user will enter the over-head cost for the new department
                * user will have to confirm the information entered before creating the new department



