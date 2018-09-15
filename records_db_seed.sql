DROP DATABASE IF EXISTS records_db;

CREATE DATABASE records_db;

USE records_db;

INSERT INTO inventory (item_name, item_category, item_cost, item_quantity)
VALUES ("bananas", "food", 2.00, 40),
("cereal", "food", 3.40, 20),
("milk", "food", 2.89, 50),
("radio", "home", 38.99, 15),
("towel", "home", 5.59, 30),
("frying pan", "home", 34.78, 13),
("flat screen tv", "electronics", 499.99, 10),
("iphone 4", "electronics", 199.89, 2),
("yogurt", "food", .78, 100),
("meat skins", "food", 1.09, 30),
("batteries", "electronics", 2.79, 25);

