create database rent_house;

create table regions (
    region_id bigserial not null primary key,
    region_name character varying(128) not null
);

create table districts (
    district_id bigserial not null primary key,
    region_id bigint not null references regions(region_id),
    district_name character varying(128) not null
);

create table users (
    user_id bigserial not null primary key,
    user_username character varying(64) not null,
    user_email character varying(128) not null,
    user_phone character varying(24) not null,
    user_password character varying(64) not null,
    verify character varying(64) not null
);

create table classifieds (
    classified_id bigserial not null primary key,
    region_id bigint not null references regions(region_id),
    district_id bigint not null references districts(district_id),
    user_id bigint not null references users(user_id),
    classified_title character varying(256) not null,
    classified_price character varying(128),
    classified_room int not null,
    classified_square character varying(128) not null,
    classified_type int not null,
    classified_addres character varying(128) not null,
    classified_body character varying(1024) not null,
    classified_busy boolean default false not null,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create table images (
    classified_id bigserial not null references classifieds(classified_id),
    image_id bigserial not null primary key,
    image_path character varying(128)
);

create table comments (
    comment_id bigserial not null primary key,
    user_id bigint not null references users(user_id),
    classified_id bigint not null references classifieds(classified_id),
    comment_body character varying(1024) not null,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


insert into regions (region_name) values ('Toshkent sh.');
insert into regions (region_name) values ('Toshkent vil.');
insert into regions (region_name) values ('Samarqand');
insert into regions (region_name) values ('Andijon');
insert into regions (region_name) values ('Namangan');
insert into regions (region_name) values ('Sirdaryo');
insert into regions (region_name) values ('Jizzax');
insert into regions (region_name) values ('Qashqadaryo');
insert into regions (region_name) values ('Buxoro');
insert into regions (region_name) values ('Surxondaryo');
insert into regions (region_name) values ('Navoiy');
insert into regions (region_name) values ('Xorazm');
insert into regions (region_name) values ('Farg''ona');
insert into regions (region_name) values ('Qoraqalpog''iston');

insert into districts (district_name, region_id) values ('Yunusobod', 1);
insert into districts (district_name, region_id) values ('Mirzo Ulug''bek', 1);
insert into districts (district_name, region_id) values ('Shayxontohur', 1);
insert into districts (district_name, region_id) values ('Mirobod', 1);
insert into districts (district_name, region_id) values ('Yashnabod', 1);

insert into districts (district_name, region_id) values ('Qibray', 2);
insert into districts (district_name, region_id) values ('Chinoz', 2);
insert into districts (district_name, region_id) values ('Zangiota', 2);
insert into districts (district_name, region_id) values ('Parkent', 2);
insert into districts (district_name, region_id) values ('Yuqori Chirchiq', 2);

insert into districts (district_name, region_id) values ('Samarqand', 3);
insert into districts (district_name, region_id) values ('Kattaqorgon', 3);
insert into districts (district_name, region_id) values ('Jonboy', 3);
insert into districts (district_name, region_id) values ('Urgut', 3);
insert into districts (district_name, region_id) values ('Paxtachi', 3);
