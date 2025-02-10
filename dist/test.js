require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});

// Function to save image metadata
// Here user with id=1 is set to exist, need to update this when we have users logged in (if we get there whoooooo knooooowwwss (pps: we gonna get there ima make sure of that))
async function saveImageMetadata(user_id, image_name, file_path) {
  try {
    const file_path_heatmap = "https://s3.amazonaws.com/mybucket/default_heatmap.jpg"; // Dummy value for heatmap for now

    const insertQuery = `
      INSERT INTO image (user_id, file_name, file_path, file_path_heatmap) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [user_id, image_name, file_path, file_path_heatmap]);
    console.log("Image Metadata Saved:", result.rows[0]);
    return result.rows[0];

  } catch (err) {
    console.error("Error saving image metadata:", err);
  }
}


// Test function to simulate saving an image
async function testSaveImage() {
  try {
    const user_id = 1; // Assuming user with id 1 exists (it does for now)
    const image_name = "test_image_yay";
    const file_path = "https://s3.amazonaws.com/mybucket/test_image.jpg"; // Fake AWS path to push

    await saveImageMetadata(user_id, image_name, file_path);
  } finally {
    pool.end();
  }
}

testSaveImage();
