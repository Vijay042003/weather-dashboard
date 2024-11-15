const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "myDB";
const client = new MongoClient(url);

const app = express();
const publicDirectoryPath = path.join(__dirname, "public");

// Set up static file serving
app.use(express.static(publicDirectoryPath));  // For files inside 'public' folder


app.set("view engine", "hbs");

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

let db;

// Connect to MongoDB once at the start
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
connectToDatabase();

// Serve the registration page
app.get("/register", (req, res) => {
  res.render("register");
});

// Serve the login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle registration form submission
app.post("/submit", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password} =
      req.body;

    // Prepare the user document
    const user = {
      name,
      email,
      password,
    };

    // Insert the user document into the Users collection
    await db.collection("Users").insertOne(user);
    res.render("register",{message:'registration sucessful',})
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).send("Error registering user: " + error.message);
  }
});

// Handle login form submission
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Find the user by email 
    const user = await db.collection("Users").findOne({
      $or: [{ email: identifier }],
    });

    // Check if user exists and password is correct
    if (user && user.password === password) {
      res.sendFile(path.join(__dirname, "public", "dashboard.html"));

    } else {
      res.render("login",{msg:"inavlid login details,Enter valid details"})
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in: " + error.message);
  }
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
