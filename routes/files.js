if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline,
} = require("@azure/storage-blob");

const router = require("express").Router();
const multer = require("multer");
const mimeTypes = require("mime-types");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single("file");
const getStream = require("into-stream");
const containerName = "file-uplodaer";
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 10 };

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);

const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

const getBlobName = (filename) => `${Date.now()}-${filename}`;

// send file to azure storage
router.get("/", async (req, res, next) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const listBlobsResponse = await containerClient.listBlobFlatSegment();
    const viewData = {
      title: "Files",
      viewName: "upload",
    };

    if (listBlobsResponse.segment.blobItems.length) {
      viewData.url = listBlobsResponse.segment.blobItems.map((item) => {
        return {
          id: item.name,
          name: item.name,
          url: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${item.name}`,
        };
      });
    }
    res.status(200).json(viewData);
  } catch (err) {
    console.log({ err });
    res.status(500).json({ error: err.message });
  }
});

// upload file
router.post("/", uploadStrategy, async (req, res) => {
  const blobName = getBlobName(req.file.originalname);
  const stream = getStream(req.file.buffer);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const { bufferSize, maxBuffers } = uploadOptions;
    await blockBlobClient.uploadStream(stream, bufferSize, maxBuffers);
    res.status(201).json({ name: blobName });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ type: "upload", error: err.message });
  }
});

module.exports = router;