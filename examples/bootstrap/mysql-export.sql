CREATE DATABASE bootstrap;
USE bootstrap;
CREATE TABLE users (id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(55) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;
INSERT INTO users (name) VALUES ('Hans'), ('Keet'), ('Fred'), ('Henk'), ('Roos');
