import express from "express"
import bodyParser from "body-parser";
import dotenv from "dotenv"
import cors from "cors";
dotenv.config();
const PORT = process.env.PORT || 3000
const app = express();

app.use(cors());

app.use(bodyParser.json({}))

app.get('/', (req, res) => {
  res.send("Hello")
});

app.listen(PORT,() => {
    console.log(`Server is running at ${PORT}`)
})

