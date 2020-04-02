const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres://postgres:postgres@localhost:5432/imageboard`
);

// exports.getCards = function() {
//     return db.query(`SELECT id, url, username, title, description FROM images`);
// };
exports.getCards = function() {
    return db.query(`SELECT * FROM images
    ORDER BY id DESC
    LIMIT 10`);
};

exports.getSelectedImage = function(id) {
    return db.query(
        `SELECT url, username, title, description, (
        SELECT id FROM images
        WHERE id > $1
        ORDER BY id ASC
        LIMIT 1
    ) AS "nextId",(
            SELECT id FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 1
        ) AS "prevId" FROM images WHERE id = $1`,
        [id]
    );
};

exports.getSelectedComments = function(id) {
    return db.query(
        `SELECT username, comment FROM comments WHERE image_id = $1`,
        [id]
    );
};

exports.deleteImage = function(id) {
    return db.query(`DELETE FROM images WHERE id = $1`, [id]);
};

exports.deleteComments = function(id) {
    return db.query(`DELETE FROM comments WHERE image_id = $1`, [id]);
};

exports.insertURL = function(username, title, description, filename, s3Url) {
    return db.query(
        `INSERT INTO images (username, title, description, url)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [username, title, description, s3Url + filename]
    );
};

exports.insertComment = function(user, comment, imageId) {
    return db.query(
        `INSERT INTO comments (username, comment, image_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
        [user, comment, imageId]
    );
};

exports.getMoreImages = lastId =>
    db
        .query(
            `SELECT url, title, id, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
) AS "lowestId" FROM images
WHERE id < $1
ORDER BY id DESC
LIMIT 10`,
            [lastId]
        )
        .then(({ rows }) => rows);

// exports.getNextId = currentId =>
//     db
//         .query(
//             `SELECT url, title, id, (
//             SELECT id FROM images
//             ORDER BY id ASC
//             LIMIT 1
//         ) AS "nextId" FROM images
//         WHERE id > $1
//         ORDER BY id ASC
//         LIMIT 1`,
//             [currentId]
//         )
//         .then(({ rows }) => rows);
//
// exports.getPrevId = currentId =>
//     db
//         .query(
//             `SELECT url, title, id, (
//                     SELECT id FROM images
//                     ORDER BY id DESC
//                     LIMIT 1
//                 ) AS "prevId" FROM images
//                 WHERE id < $1
//                 ORDER BY id DESC
//                 LIMIT 1`,
//             [currentId]
//         )
//         .then(({ rows }) => rows);

// return db.query(
//         `INSERT INTO signatures (signature, user_id)
//     VALUES ($1, $2)
//     RETURNING id`,
//         [sig, userId]
