import express from "express";
import sqlite3 from "sqlite3";
import * as hydrate from "./hydrate";
import bodyParser from "body-parser";

const app = express();
const port = 8000;
const db = new sqlite3.Database('./data/beer.db');

app.use(bodyParser.json())

db.serialize(() => {
  hydrate.ensureTableCreated(db);
  hydrate.hydrateBeerDb(db);
})

function isBeerInputValid(req: express.Request): boolean {
  return !(!req.body.name || !req.body.image_url || !req.body.description);
}

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send("Beer api v1");
});

app.get('/beer/', (req: express.Request, res: express.Response) => {
  db.all("SELECT * from beer", (err, rows) => {
    res.status(200).send(rows);
  })
});

app.get('/beer/:id', (req: express.Request, res: express.Response) => {
  db.get("SELECT * from beer where id = ?", req.params.id, (err, row) => {
    if (row === undefined) {
      res.sendStatus(404);
      return;
    }

    res.status(200).send(row);
  });
});

app.post('/beer/', (req: express.Request, res: express.Response) => {
  if (!isBeerInputValid(req)) {
    res.sendStatus(400);
    return;
  }

  db.serialize(() => {
    db.run(
      "INSERT INTO beer(name, imageUrl, description) VALUES(?, ?, ?)",
      [req.body.name, req.body.image_url, req.body.description]
    );

    res.sendStatus(201);
  });
});

app.put('/beer/:id', (req: express.Request, res: express.Response) => {
  if (!isBeerInputValid(req)) {
    res.sendStatus(400);
    return;
  }

  db.serialize(() => {
    db.get("SELECT * from beer where id = ?", req.params.id, (err, row) => {
      if (row === undefined) {
        res.sendStatus(404);
        return;
      }

      db.run(
        "UPDATE beer SET name = ?, imageUrl = ?, description = ? WHERE id = ?",
        [req.body.name, req.body.image_url, req.body.description, req.params.id]
      );

      res.sendStatus(204)
    });
  });
});

app.delete('/beer/:id', (req: express.Request, res: express.Response) => {
  db.serialize(() => {
    db.get("SELECT * from beer where id = ?", req.params.id, (err, row) => {
      if (row === undefined) {
        res.sendStatus(404);
        return;
      }

      db.run("DELETE FROM beer WHERE id = ?", [req.params.id]);
      res.sendStatus(200);
    });
  })
})

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});