 \c flats;

CREATE TABLE IF NOT EXISTS flats_data (
    id SERIAL primary key,
    title VARCHAR(120),
    image_url VARCHAR(120)
);