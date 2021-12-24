const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mimeTypes = require("mime-types");

const app = express();
const port = 8080;

app.use(cors());

const storage = multer.diskStorage({
  destination: "files/",
  filename: (req, file, callback) => {
    callback(
      "",
      `${file.originalname.split(".")[0]}.${mimeTypes.extension(file.mimetype)}`
    );
  },
});

const uploads = multer({
  storage: storage,
});

app.post("/files", uploads.single("file"), (req, res) => {
  res.status(200).send("correct");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
