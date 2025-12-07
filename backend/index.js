import express from "express";
import cors from "cors";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Register institute
app.post("/register", async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from("institutes")
    .insert([{ name, email }])
    .select();
  res.json({ data, error });
});

// Upload CSV
app.post("/upload/:instituteId", upload.single("file"), async (req, res) => {
  const { instituteId } = req.params;
  const filePath = req.file.path;

  // Upload file to Supabase storage
  const fileBuffer = fs.readFileSync(filePath);
  await supabase.storage.from("csvs").upload(req.file.originalname, fileBuffer);

  // Parse CSV and insert departments
  const departments = [];
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      departments.push({
        institute_id: instituteId,
        name: row["Department Name"],
        metadata: row,
      });
    })
    .on("end", async () => {
      await supabase.from("departments").insert(departments);
      res.json({ message: "Departments uploaded successfully" });
    });
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));