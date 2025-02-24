const { Pool } = require("pg");
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const os = require("os");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());


app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

// Connect to Neon PostgreSQL Database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer to Upload to S3
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
  

// Upload Route (S3 + Database)
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
      console.log("Received upload request:", req.body);

      const imageName = req.body.imageName || req.body["imageName"];
      const userId = 1; // Placeholder user ID for dummy user i created for now
      const filePath = req.file.location; // S3 Image URL
      const heatmapPath = "thisiscoolheatmapwoooowwlookatthat"; // Placeholder for heatmap once we get that all set up yaya
      const confidenceScore = parseFloat(req.body.confidenceScore) || 0.0; // Confidence score

      if (!req.file) {
          return res.status(400).json({ error: "Please upload a file" });
      }
      if (!imageName || typeof imageName !== "string") {
          return res.status(400).json({ error: "Image name is required" });
      }

      // Insert into Image table
      const imageQuery = `
          INSERT INTO image (user_id, file_path, file_name, file_path_heatmap)
          VALUES ($1, $2, $3, $4) RETURNING image_id;
      `;
      const imageValues = [userId, filePath, imageName.trim(), heatmapPath];

      const imageResult = await pool.query(imageQuery, imageValues);
      const imageId = imageResult.rows[0].image_id;

      console.log("Image saved to database:", imageId);

      // Insert into Analysis Log table
      const logQuery = `
          INSERT INTO analysis_log (image_id, confidence_score, date_created)
          VALUES ($1, $2, NOW()) RETURNING *;
      `;
      const logValues = [imageId, confidenceScore];

      const logResult = await pool.query(logQuery, logValues);
      console.log("Analysis log saved:", logResult.rows[0]);

      res.json({
          success: true,
          message: "Image and analysis data uploaded successfully!",
          imageUrl: filePath,
          databaseEntry: { image: imageResult.rows[0], log: logResult.rows[0] },
      });
  } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Error uploading image" });
  }
});

const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (let iface of Object.values(interfaces)) {
      for (let config of iface) {
        if (config.family === "IPv4" && !config.internal) {
          return config.address;
        }
      }
    }
    return "localhost";
  };

  const PORT = 3001;
  const LOCAL_IP = getLocalIP();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://${LOCAL_IP}:${PORT}`);
  });
  
  
