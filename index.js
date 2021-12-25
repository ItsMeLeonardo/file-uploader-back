const express = require("express");
const cors = require("cors");

const uploads = require("./routes/upload");

const app = express();
const port = 8080;

app.use(cors());

app.use("/uploads", uploads);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
