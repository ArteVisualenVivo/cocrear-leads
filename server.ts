import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// PDF Generation Endpoint
app.post("/api/pdf/generate", async (req, res) => {
  try {
    // In a real app, we'd use pdf-lib to generate the PDF based on Cocrear's template
    // For now, we'll return a success message or a base64 (mock)
    res.json({ success: true, message: "PDF generation logic would go here" });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Vite Middleware for Dev / Static for Prod
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
