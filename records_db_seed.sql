DROP DATABASE IF EXISTS records_db;

CREATE DATABASE records_db;

USE records_db;

CREATE TABLE inventory (
  id INT NOT NULL AUTO_INCREMENT,
  item_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  item_cost DECIMAL( 10, 2 ) NOT NULL NOT NULL,
  item_quantity INT(20) NOT NULL,
  item_sales DECIMAL( 20, 2 ),
  PRIMARY KEY (id)
);

INSERT INTO inventory (item_name, department_name, item_cost, item_quantity, item_sales)
VALUES ("bananas", "food", 2.00, 3, 0),
("cereal", "food", 3.40, 20, 0),
("milk", "food", 2.89, 50, 0),
("radio", "home", 38.99, 15, 0),
("towel", "home", 5.59, 30, 0),
("frying pan", "home", 34.78, 13, 0),
("flat screen tv", "electronics", 499.99, 10, 0),
("iphone 4", "electronics", 199.89, 2, 0),
("yogurt", "food", .78, 100, 0),
("meat skins", "food", 1.09, 4, 0),
("batteries", "electronics", 2.79, 25, 0);



SELECT * FROM inventory;