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

// ✅ Register institute
app.post("/register", async (req, res) => {
  const { name, email, type } = req.body;
  const { data, error } = await supabase
    .from("institutes")
    .insert([{ name, email, type }])
    .select();
  if (error) return res.status(400).json({ error });
  res.json({ data });
});

// ✅ Upload CSV + insert departments
app.post("/upload/:instituteId", upload.single("file"), async (req, res) => {
  const { instituteId } = req.params;
  const filePath = req.file.path;

  try {
    // Upload file to Supabase storage
    const fileBuffer = fs.readFileSync(filePath);
    await supabase.storage.from("csvs").upload(req.file.originalname, fileBuffer, {
      upsert: true,
    });

    // Parse CSV and insert departments
    const departments = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        departments.push({
          institute_id: instituteId,
          name: row["Department"] || row["department"] || Object.values(row)[0],
          metadata: row,
        });
      })
      .on("end", async () => {
        const { error } = await supabase.from("departments").insert(departments);
        if (error) return res.status(400).json({ error });
        res.json({ message: "Departments uploaded successfully" });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all institutes
app.get("/institutes", async (req, res) => {
  const { data, error } = await supabase.from("institutes").select("*");
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// ✅ Get departments for an institute
app.get("/departments", async (req, res) => {
  const { institute_id } = req.query;
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("institute_id", institute_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));