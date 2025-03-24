// We need to move/replace this into the hosted server.js, this was made for testing
// only move and change what is needed/not repeating

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const CopyObjectCommand = require("@aws-sdk/client-s3").CopyObjectCommand;



const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// PostgreSQL Connection (dont need to move over)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Configure AWS S3 Client (also dont need to move over)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer to Upload to S3, configures a location property that has the location of the image in S3
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const imageName = req.body.imageName || file.originalname;
        const fileName = `${imageName}.jpg`;
        cb(null, fileName);
      },
    }),
  });

  const temp_upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `tmp/${Date.now()}.jpg`; // Add the "tmp/" prefix
            cb(null, fileName);
        },
    }),
});

  // Middleware to verify JWT Token
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ success: false, error: "No token provided" });

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    if (!token) return res.status(401).json({ success: false, error: "Token missing" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: "Invalid token" });

        req.user = user;
        next();
    });
};

async function copyImageInS3(sourceUri) {
    try {
        // Extract the bucket name and source key from the URI
        const bucketName = process.env.AWS_S3_BUCKET;
        const sourceKey = sourceUri.split("/").slice(3).join("/");
        console.log(sourceKey)
        const destinationKey = sourceKey.replace("tmp/", ""); // Extract the key after the bucket name

        
        if (!sourceKey) {
            throw new Error("Invalid source URI. Could not extract the source key.");
        }
        console.log(sourceKey)
        console.log(destinationKey)

        // Define the copy source and destination
        const copySource = sourceUri; // Format: "bucket-name/source-key"

        // Create the CopyObjectCommand
        const copyCommand = new CopyObjectCommand({
            Bucket: bucketName, // Destination bucket
            CopySource: copySource, // Source bucket and key
            Key: destinationKey, // Destination key
        });

        // Execute the copy command
        const response = await s3.send(copyCommand);
        console.log("Image successfully copied:", response);

        return `https://image-uploads-aida.s3.us-east-2.amazonaws.com/${destinationKey}`
        
    } catch (error) {
        console.error("Error copying image:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

app.get("/users/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/analyze", authenticateToken, temp_upload.single('image'), async (req, res) => {
    console.log("catepillar")
    console.log(req.body)
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a file" });
        }
        if (!req.user.user_id) {
            return res.status(400).json({ error: "User authentication failed. No user ID found." });
        }

        console.log(req.file.location)
        console.log(req.file.key)

        
        const data = {
            inputs: {
                image_name: req.file.key,
            },
        };
        
        try {
            const response = await fetch(process.env.MODEL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.HF_BEARER_TOKEN}`,
                },
                body: JSON.stringify(data), // Convert the data object to a JSON string
            });
        
            if (!response.ok) {
                res.status(500).json({ error: "HF api error" });
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const result = await response.json(); // Parse the JSON response
            console.log(result);

            const { probability, heatmap } = result[0].body;

            confidenceScore = probability

            const heatmapPath = `https://image-uploads-aida.s3.us-east-2.amazonaws.com/${heatmap}`;

            res.json({
                imageUrl: heatmapPath,
                confidenceScore: probability,

            });
        } catch (error) {
            console.error("Error making fetch call:", error);
            
        }

        
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal server error" });
    }

});


// Upload Image Route (need to replace the logic in server.js with this instead)
// change "upload-test" to just upload here and within the respective pages as wewll
app.post("/upload-test", authenticateToken, upload.single("image"), async (req, res) => {
    console.log("Received upload request:", req.body);
    try {

        const imageName = req.body.imageName || req.body["imageName"];
        const heatmapPath = await copyImageInS3(req.body.heatmap_uri);
        const userId = req.user.user_id; // Extract user ID from JWT
        const confidenceScore = req.body.confidenceScore

        if (!req.file) {
            return res.status(400).json({ error: "Please upload a file" });
        }
        if (!imageName || typeof imageName !== "string") {
            return res.status(400).json({ error: "Image name is required" });
        }
        if (!userId) {
            return res.status(400).json({ error: "User authentication failed. No user ID found." });
        }

        // S3 Image URL
        const filePath = req.file.location; // Get S3 file URL

        

        // Insert into Database (Image Table)
        const imageQuery = `
            INSERT INTO image (user_id, file_path, file_name, file_path_heatmap)
            VALUES ($1, $2, $3, $4) RETURNING image_id;
        `;
        const imageValues = [userId, filePath, imageName.trim(), heatmapPath];

        const imageResult = await pool.query(imageQuery, imageValues);
        const imageId = imageResult.rows[0].image_id;

        // Insert into Analysis Log Table
        const logQuery = `
            INSERT INTO analysis_log (image_id, confidence_score, date_created)
            VALUES ($1, $2, NOW()) RETURNING *;
        `;
        const logValues = [imageId, confidenceScore];
        const logResult = await pool.query(logQuery, logValues);

        


        res.json({
            success: true,
            imageUrl: heatmapPath,
            databaseEntry: { image: imageResult.rows[0], log: logResult.rows[0] },
        });

    

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Retrieve images for the logged-in user
app.get("/images", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.user_id;  // Extract user ID from JWT
  
      const imageQuery = `
        SELECT i.image_id, i.file_path, a.confidence_score
        FROM image i
        JOIN analysis_log a ON i.image_id = a.image_id
        WHERE i.user_id = $1;
      `;
  
      const result = await pool.query(imageQuery, [userId]);
      res.json({ images: result.rows });
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Error retrieving images" });
    }
  });
  
// Signup
app.post("/signup", async (req, res) => {

    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const query = `
            INSERT INTO users (username, first_name, last_name, email, password, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING user_id, first_name, email;
        `;

        const values = [`${firstName}_${lastName}`, firstName, lastName, email, hashedPassword];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(500).json({ success: false, error: "User creation failed." });
        }

        const newUser = result.rows[0];

        // Generate JWT Token for the new user
        const token = jwt.sign(
            { user_id: newUser.user_id, email: newUser.email, first_name: newUser.first_name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Ensure token is sent in the response
        res.json({ success: true, message: "User created!", token, user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

// Login
app.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required." });
        }
        // make sure the email/user exists for fn (we can change this to username if we want)
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: "User not found." });
        }

        const user = userResult.rows[0];

        // Hashed pass decode and tested/compared
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, first_name: user.first_name }, 
            JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.json({ success: true, token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
