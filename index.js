const express = require("express");
const cors = require("cors");

const files = require("./routes/files");

const app = express();
const port = 8080;

app.use(cors());

app.use("/files", files);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
