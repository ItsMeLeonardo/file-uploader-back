if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const router = require("express").Router();
const multer = require("multer");
const mimeTypes = require("mime-types");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("file");
const getStream = require("into-stream");
const azureStorage = require("azure-storage");
const blobService = azureStorage.createBlobService();
const containerName = "file-uplodaer";

const getBlobName = (filename) => `${Date.now()}-${filename}`;

router.post("/", uploadStrategy, (req, res) => {
  const file = req.file;

  const blobName = getBlobName(file.originalname);
  const stream = getStream(file.buffer);
  const streamLength = file.buffer.length;

  blobService.createBlockBlobFromStream(
    containerName,
    blobName,
    stream,
    streamLength,
    (error) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({ blobName });
    }
  );
});

module.exports = router;
