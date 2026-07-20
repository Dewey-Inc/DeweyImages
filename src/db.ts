import { DatabaseSync } from "node:sqlite";
const database = new DatabaseSync('data.db');

// users
database.exec(
    `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY,
        permission INT DEFAULT 1
    ) STRICT`
);

// images
database.exec(
    `CREATE TABLE IF NOT EXISTS images (
        resolution TEXT NOT NULL,
        cost INT DEFAULT 0,
        timestamp TEXT DEFAULT (strftime('%s', 'now')),
        authorid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT "",
        tags TEXT DEFAULT "[]",

        approved INT DEFAULT 0,
        views INT DEFAULT 0
    ) STRICT`
);

// purchases
database.exec(
    `CREATE TABLE IF NOT EXISTS purchases (
        userid TEXT NOT NULL,
        imageid INT NOT NULL,
        cost INT DEFAULT 0
    ) STRICT`
);

export default database