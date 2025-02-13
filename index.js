import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import rcsEnabledRoutes from "./routes/rcsEnabledRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// database connection
// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use("/rcsenabled", rcsEnabledRoutes(supabase));

app.listen(process.env.PORT || 3009, () => {
    console.log(`Server running on port ${process.env.PORT || 3009}`);
});
