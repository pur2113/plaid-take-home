# Setup initial database.

DROP DATABASE IF EXISTS `plaid`;
CREATE DATABASE IF NOT EXISTS `plaid`;
CREATE USER IF NOT EXISTS `plaid` IDENTIFIED BY 'plaid';

use plaid;


CREATE TABLE IF NOT EXISTS `Customer` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(64)     NOT NULL DEFAULT '',
  `createdAt`     TIMESTAMP       DEFAULT  CURRENT_TIMESTAMP,
  `updatedAt`     TIMESTAMP       DEFAULT  CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
INSERT INTO `Customer`
  (`id`, `name`)
VALUES
  (1, 'Jane Woods'),
  (2, 'Michael Li'),
  (3, 'Heidi Hasselbach'),
  (4, 'Rahul Pour');


CREATE TABLE IF NOT EXISTS `Account` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `customerId`    INT UNSIGNED    NOT NULL,
  `balance`       DOUBLE          NOT NULL DEFAULT 0,
  `createdAt`     TIMESTAMP       DEFAULT  CURRENT_TIMESTAMP,
  `updatedAt`     TIMESTAMP       DEFAULT  CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`)
);


CREATE TABLE IF NOT EXISTS `Transfer` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `accountFrom`   INT UNSIGNED    NOT NULL,
  `accountTo`     INT UNSIGNED    NOT NULL,
  `amount`        DOUBLE          NOT NULL DEFAULT 0,
  `createdAt`     TIMESTAMP       DEFAULT  CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`accountFrom`) REFERENCES `Account` (`id`),
  FOREIGN KEY (`accountTo`) REFERENCES `Account` (`id`)
);


# Set the proper permissions on tables.
GRANT SELECT, INSERT, UPDATE, DELETE, INDEX ON `plaid`.* TO `plaid`;
FLUSH PRIVILEGES;
