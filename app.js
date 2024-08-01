const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");

const app = express();

// create my sql connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "c237_petapp"
});
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

//import the express.js framework
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//set up view engine
app.set("view engine", "ejs");
// enable static files
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: false
}));

//codes for CRUD 
// To be filled in for each action 

// retrieve all products
app.get("/", (req, res) => {
    const sql = "SELECT * FROM pet";
    connection.query(sql, (error, results)=> {
        if(error){
            console.error("Database query err: ", error.message);
            return res.status(500).send("Err retrieving pet");
        }
        res.render("index", {pets: results});
    });
});

// retrieve product by id
// trigger from: index.ejs
app.get ("/pet/:id", (req, res) =>{
    const petId = req.params.id;
    connection.query("SELECT * FROM pet WHERE petId = ?",
    [petId], (error, results)=>{
        if (error) throw error;
        if (results.length > 0){
            res.render("pet", {pet:results[0]});
        }else{
            res.status(404).send("Pet not found")
        }
    });
});

//add a product
app.get("/addPet", (req, res) =>{
    res.render("addPet")
});

app.post("/addPet", upload.single("image"), (req, res) => {
    const {name, dob, age, breed, contact} = req.body;
    let image;
    if (req.file){
        image = req.file.filename;
    }else{
        image=null;
    }
    console.log(image);
    connection.query("INSERT INTO pet(name, dob, age, breed, contact, image) VALUES (?, ?, ?, ?, ?, ?)",
    [name, dob, age, breed, contact, image], (error, results) =>{
        if (error){
            console.error("Err adding pet", error);
            res.status(500).send("Error adding pet");
        }else{
            res.redirect("/");
        }
    });
});

//edit a product
app.get("/editPet/:id", (req, res) => {
    const petId = req.params.id;

    const sql = "SELECT * FROM pet WHERE petId = ?";
    connection.query(sql, [petId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving pet");
        }
        if (results.length > 0){
            res.render("editPet", {pet: results[0]});
        }else{
            res.status(404).send("Pet not found");
        }
    })
})

app.post("/editPet/:id", upload.single("image"), (req,res) => {
    const petId = req.params.id;
    const {name, dob, age, breed, contact} = req.body;
    let image = req.body.currentImage;
    if (req.file){
        image = req.file.filename;
    }
    const sql = "UPDATE pet SET name=?, dob=?, age=?, breed=?, contact=?, image=? WHERE petId=?";
    connection.query(sql, [name, dob, age, breed, contact, image, petId], (error,result)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error retrieving pet");
        }else{
            res.redirect("/");
        }
    })
})

//delete a product
app.get("/deletePet/:id", (req, res) => {
    const petId = req.params.id;

    const sql = "DELETE FROM pet WHERE petId = ?";
    connection.query(sql, [petId], (error, results)=>{
        if (error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error deleting pet");
        }else{
            res.redirect("/");
        }
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));