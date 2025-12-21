
create table Comments(
    comment_id int primary key auto_increment,
    author_id int not null,
    post_id int not null,
    comment_text text not null,
    created_at timestamp default current_timestamp,
    foreign key (post_id) references Posts(post_id),
    foreign key (author_id) references Users(user_id)
);
