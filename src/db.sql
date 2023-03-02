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
    title character varying(250) NOT NULL,
    category character varying(30) NOT NULL,
    price bigint NOT NULL,
    quantity bigint,
    description text NOT NULL,
    created_at date,
    PRIMARY KEY (id)
);