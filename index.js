const express = require("express");
const app = express();
const db = require("./utils/db");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const s3Url = require("./config");
const amazonURL = s3Url.s3Url;

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//this serves all html/css/front end js requests
app.use(express.static("./public"));
app.use(express.json());

//any routes are just for info/data

app.get("/image/:id", (req, res) => {
    let id = req.params.id;
    db.getSelectedImage(id).then(result => {
        // console.log("result of db.getCards.rows: ", result.rows);
        res.json(result.rows);
    });
    // db.getSelectedComments(id).then(result => {
    //     res.json(result.rows);
    // });
});

app.get("/pastComments/:id", (req, res) => {
    console.log("req.params of get /pastcomment: ", req.params);
    let id = req.params.id;
    db.getSelectedComments(id).then(result => {
        console.log("result of db.getCards.rows: ", result.rows);
        res.json(result.rows);
    });
});

app.get("/images", (req, res) => {
    // console.log("req.body of get /images: ", req.body);
    db.getCards().then(result => {
        // console.log("result of db.getCards.rows: ", result.rows);
        res.json(result.rows);
    });
});

app.post("/uploadComments", (req, res) => {
    // console.log("req.body in post /uploadComments: ", req.body);
    const { user, comment, imageId } = req.body;
    db.insertComment(user, comment, imageId)
        .then(result => {
            // console.log("result from db.insertComment: ", result);
            res.json(result);
        })
        .catch(err => {
            console.log("error in db.insertComment: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    // console.log("input: ", req.body);
    const { username, title, description } = req.body;
    const { filename } = req.file;

    if (req.file) {
        db.insertURL(username, title, description, filename, amazonURL)
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                console.log("error in insertURL: ", err);
            });
        //an db.query insert here
        // res.json({
        //we send an object that represents the image that was uploaded
        // success: true
        // });
        // } else {
        //     res.json({
        //         success: false
        //     });
    }
});

app.get("/more/:smallestId", (req, res) => {
    let smallestId = req.params.smallestId;
    db.getMoreImages(smallestId)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("error in db.getMoreImages: ", err);
        });
});

app.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    db.deleteComments(id)
        .then(() => {
            db.deleteImage(id).then(result => {
                res.json(result);
            });
        })
        .catch(err => {
            console.log("error in db.deleteImage: ", err);
        });
});
//
// app.get("/back/:currentId", (req, res) => {
//     let currentId = req.params.currentId;
//     db.getPrevId(currentId)
//         .then(result => {
//             res.json(result);
//         })
//         .catch(err => {
//             console.log("error in db.getPrevId: ", err);
//         });
// });

// app.get("/cities", (req, res) => {
//     console.log("I am the get route for /cities");
//     const cities = [
//         {
//             name: "Berlin",
//             country: "Germany"
//         },
//         {
//             name: "Guayaquil",
//             country: "Ecuador"
//         },
//         {
//             name: "Kinross",
//             country: "Scotland"
//         }
//     ];
//     //we will be using res.json alot!!
//     res.json(cities);
// });
app.listen(8080, () => console.log("Imageboard!!!"));
