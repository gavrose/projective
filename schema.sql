create table Users (
    user_id int primary key auto_increment,
    username varchar(255) not null unique,
    email varchar(255) not null unique,
    bio text,
    role enum('admin','user') not null default 'user',
    password varchar(255) not null,
    created_at timestamp default current_timestamp
);

create table Projects(
    proj_id int primary key AUTO_INCREMENT,
    author_id int not null,
    category_id int not null,
    title varchar(255) not null,
    description text,
    created_at timestamp default CURRENT_TIMESTAMP,
    visible boolean not null default 1,
    foreign key (author_id) references Users(user_id),
    foreign key (category_id) references Categories(category_id)
);

create table Posts(
    post_id int primary key auto_increment,
    proj_id int not null,
    author_id int not null,
    title varchar(255) not null,
    content text not null, 
    post_time timestamp default CURRENT_TIMESTAMP,
    foreign key (proj_id) references Projects(proj_id),
    foreign key (author_id) references Users(user_id)
    );

    -- collaborators on a project, NOT project owner - proj owner cannot be in the collaborator table for that project
create table Collaborators(
    proj_id int not null,
    user_id int not null,
    primary key (proj_id, user_id),
    foreign key (proj_id) references Projects(proj_id),
    foreign key (user_id) references Users(user_id)
);


create table Categories (
    category_id int primary key auto_increment,
    category_name varchar(255) not null unique
);

create table Comments(
    comment_id int primary key auto_increment,
    author_id int not null,
    post_id int not null,
    comment_text text not null,
    created_at timestamp default current_timestamp,
    foreign key (post_id) references Posts(post_id),
    foreign key (author_id) references Users(user_id)
);