CREATE DATABASE glittermars
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE public.products
(
    id serial NOT NULL,
    _id character varying(100) NOT NULL,
    images text NOT NULL,
    title text NOT NULL,
    category character varying(30) NOT NULL,
    price bigint NOT NULL,
    quantity bigint DEFAULT 0,
    description text NOT NULL,
    created_at date,
    PRIMARY KEY (id)
);

CREATE TABLE users
(
    id serial NOT NULL,
    _id character varying(100) NOT NULL,
    fullname character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE orders
(
    id serial NOT NULL,
    _id character varying(100) NOT NULL,
    product_id character varying(100) NOT NULL,
    buyer_id character varying(100),
    fullname text NOT NULL,
    email character varying(100) NOT NULL,
    country character varying(50) NOT NULL,
    city character varying(50) NOT NULL,
    address text NOT NULL,
    postalcode character varying(10),
    quantity bigint NOT NULL,
    price bigint NOT NULL,
    pending integer NOT NULL DEFAULT 0,
    created_at date,
    PRIMARY KEY (id)
);

CREATE TABLE reviews
(
    id serial NOT NULL,
    user_id character varying(100) NOT NULL,
    product_id character varying(100) NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    rating integer NOT NULL,
    created_at character varying(15) NOT NULL,
    PRIMARY KEY (id)
);