import express from "express";
import { upload } from "../utils/fileUtils.js"; // Import multer configuration
import multer from "multer";
import { rcsEnabledUploadFileController } from "../controllers/rcs/rcsEnabled/rcsEnabledController.js";

const rcsEnabledRouter = express.Router();

const rcsEnabledRoutes = (supabase) => {
    // Apply multer middleware to handle file upload
    rcsEnabledRouter.post("/upload", (req, res, next) => {
        // Handle multer file upload with error handling
        upload.single("file")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Multer-specific error
                return res.status(400).json({
                    message: `Multer error: ${err.message}`,
                    status: "ERROR",
                });
            } else if (err) {
                // Custom error (like unsupported file type)
                return res.status(400).json({
                    message: `File upload error: ${err.message}`,
                    status: "ERROR",
                });
            }
            // Proceed with uploading file if no error
            rcsEnabledUploadFileController(req, res, supabase).catch(next); // Ensure async errors are passed to the next middleware
        });
    });

    return rcsEnabledRouter;
};

export default rcsEnabledRoutes;
