DROP DATABASE IF EXISTS records_db;

CREATE DATABASE records_db;

USE records_db;

CREATE TABLE inventory (
  item_id INT NOT NULL AUTO_INCREMENT,
  item_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  item_cost DECIMAL( 10, 2 ) NOT NULL NOT NULL,
  item_quantity INT(20) NOT NULL,
  item_sales DECIMAL( 20, 2 ),
  PRIMARY KEY (item_id)
);

INSERT INTO inventory (item_name, department_name, item_cost, item_quantity, item_sales)
VALUES ("bananas", "food", 2.00, 3, 43),
("cereal", "food", 3.40, 20, 55),
("milk", "food", 2.89, 50, 99),
("radio", "home", 38.99, 15, 23),
("towel", "home", 5.59, 30, 65),
("frying pan", "home", 34.78, 13, 78),
("flat screen tv", "electronics", 499.99, 10, 44),
("iphone 4", "electronics", 199.89, 2, 37),
("yogurt", "food", .78, 100, 21),
("meat skins", "food", 1.09, 4, 38),
("batteries", "electronics", 2.79, 25, 77);


CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(45) NOT NULL,
  over_head_costs DECIMAL( 30, 2 ),
  PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("food", 12),
       ("home", 54),
       ("electronics", 20);
       
       
CREATE TABLE customers (
	cust_id INT NOT NULL AUTO_INCREMENT,
    cust_first  VARCHAR(45) NOT NULL,
    cust_last   VARCHAR(45) NOT NULL,
    cust_address  VARCHAR(45) NOT NULL,
    cust_city   VARCHAR(45) NOT NULL,
    cust_state   VARCHAR(45) NOT NULL, 
    cust_zip INT(20) NOT NULL,
    cust_email  VARCHAR(45) NOT NULL, 
    cust_phone  INT(20) NOT NULL,
    PRIMARY KEY (cust_id)
  );


CREATE TABLE orders (
	  order_id INT NOT NULL AUTO_INCREMENT,
	  cust_id VARCHAR(45) ,
    order_product VARCHAR(45) ,
	  order_quantity VARCHAR(20) ,
    order_cost VARCHAR(20) ,
    order_totalCost VARCHAR(20) ,
    PRIMARY KEY (order_id)
  );

CREATE TABLE managers (
  manager_id INT NOT NULL AUTO_INCREMENT,
  manager_first VARCHAR(45) NOT NULL,
  manager_last VARCHAR(45) NOT NULL,
  manager_department VARCHAR(45) NOT NULL,
  manager_password VARCHAR(45),
  PRIMARY KEY (manager_id)
);
  
  
CREATE TABLE executives (
  exec_id INT NOT NULL AUTO_INCREMENT,
  exec_first VARCHAR(45) NOT NULL,
  exec_last VARCHAR(45) NOT NULL,
  password VARCHAR(45),
  PRIMARY KEY (exec_id)
);


INSERT INTO executives (exec_first, exec_last, password)
VALUES ("brian", "smith", "1234"); 


INSERT INTO managers (manager_first, manager_last, manager_department, manager_password)
VALUES ("john", "tull", "electronics", 1234),
       ("kim", "stone", "home", 1234),
       ("larry", "beachnut", "food", 1234);

SELECT * FROM inventory;