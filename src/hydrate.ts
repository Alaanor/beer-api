import {Database} from "sqlite3";
import {readFileSync} from 'fs'
import {Beer} from "./beer";

export function ensureTableCreated(db: Database) {
  db.run(`
      CREATE TABLE IF NOT EXISTS beer
      (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          name        TEXT,
          imageUrl    TEXT,
          description TEXT
      );
  `);
}

export function hydrateBeerDb(db: Database) {
  db.get("SELECT count(*) as count from beer", (err, row) => {
    if (row.count === 0) {
      hydrate(db);
    }
  });
}

function hydrate(db: Database) {
  // tslint:disable-next-line:no-console
  console.log("Database empty - hydrating a base set of data")

  const beerData: Beer[] = JSON.parse(readFileSync('./data/beer-data.json', "utf8"));
  const statement = db.prepare("INSERT INTO beer VALUES (?, ?, ?, ?);");

  for (const beer of beerData) {
    statement.run(beer.id, beer.name, beer.image_url, beer.description)
  }

  statement.finalize();
}