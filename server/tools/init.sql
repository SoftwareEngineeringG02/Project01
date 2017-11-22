/* Create database. */
CREATE DATABASE IF NOT EXISTS serverdb;
USE serverdb;

/* Drop any existing tables. */
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS request;
-- DROP TABLE IF EXISTS price;

/* Create new tables. */
CREATE TABLE IF NOT EXISTS address (
    id      INT           NOT NULL AUTO_INCREMENT,
    client  VARCHAR(50)   NOT NULL,
    address VARCHAR(40)   NOT NULL,
    agent   VARCHAR(4000) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS client (
    id VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS request (
    id        INT         NOT NULL AUTO_INCREMENT,
    client    VARCHAR(50) NOT NULL,
    url       VARCHAR(28) NOT NULL,
    method    VARCHAR(6)  NOT NULL,
    server    VARCHAR(40) NOT NULL,
    starttime BIGINT      NOT NULL,
    endtime   BIGINT,
    status    INT,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS location (
    id        INT         NOT NULL AUTO_INCREMENT,
    client    VARCHAR(50) NOT NULL,
    longitude DOUBLE      NOT NULL,
    latitude  DOUBLE      NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS price (
    id        INT          NOT NULL,
    price     INT          NOT NULL,
    date      DATE         NOT NULL,
    postcode  VARCHAR(8),
    paon      VARCHAR(50),
    saon      VARCHAR(50),
    street    VARCHAR(50),
    locality  VARCHAR(50),
    town      VARCHAR(50),
    district  VARCHAR(50),
    county    VARCHAR(50),
    latitude  DOUBLE       NOT NULL,
    longitude DOUBLE       NOT NULL,
    PRIMARY KEY(id)
);
