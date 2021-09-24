import express from "express";
import sqlite3 from "sqlite3";
import * as hydrate from "./hydrate";

const app = express();
const port = 8000;
const db = new sqlite3.Database('./data/beer.db');

db.serialize(() => {
  hydrate.ensureTableCreated(db);
  hydrate.hydrateBeerDb(db);
})

app.get('/', (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});