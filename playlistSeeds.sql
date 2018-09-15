DROP DATABASE IF EXISTS records_db;

CREATE DATABASE records_db;

USE records_db;

CREATE TABLE inventory (
  id INT NOT NULL AUTO_INCREMENT,
  item_name VARCHAR(45) NOT NULL,
  item_category VARCHAR(45) NOT NULL,
  item_cost DECIMAL( 10, 2 ) NOT NULL NOT NULL,
  item_quantity INT(20) NOT NULL,
  PRIMARY KEY (id)
);

