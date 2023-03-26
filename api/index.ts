import express from "express"; 
import { Application, Request, Response } from 'express';
import cors from 'cors';
import "dotenv/config.js";
import { Scraper, Flat } from './scraper';
import {Pool} from "pg";

const app: Application = express();
const port = 5000;


app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  interface Property {
    title: string;
    imageUrl: string;
  }


  const checkDatabaseSize = async(): Promise<number> => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await pool.query('SELECT id FROM flats_data ORDER BY id DESC LIMIT 1 OFFSET 0;');
      const lastId = result.rows[0].id;
      await client.query('COMMIT');

      return lastId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const saveProperties = async(properties: Property[]) => {
    const client = await pool.connect();
    //let check_size = await checkDatabaseSize();
    try {
      await client.query('BEGIN');
    
      for (const property of properties) {
        await client.query(
          'INSERT INTO flats_data (title, image_url) VALUES ($1, $2)',
          [property.title, property.imageUrl]
        );
    
        await client.query('COMMIT');
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

async function isNotDatabase(id: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const data = await client.query(`SELECT * FROM flats_data WHERE id = ${parseInt(id)*20};`);
    await client.query('COMMIT');
    if(data.rows.length > 0) {
      return false;
    }
    return true;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;

  } finally {
    client.release();
  }

    
}

async function getDataFromDatabase(id: string): Promise<any[]> {
  const client = await pool.connect();

  try {

    await client.query('BEGIN');
    const data = await client.query(`SELECT * FROM flats_data WHERE id BETWEEN ${parseInt(id) > 1 ? (parseInt(id)-1)*20 : id} AND ${parseInt(id)*20};`);
    await client.query('COMMIT');
    return data.rows;

  } catch(error) {
    await client.query('ROLLBACK');
    throw error;

  } finally {
    client.release();
  }

}

let flatsData: Flat[] = [];
app.get("/api/data/:id", async (req: Request, res: Response) => {
  console.log(`GET REQUEST ON /api/data/${req.params.id}`);
  try {
        let check_value = await isNotDatabase(req.params.id);
        if(check_value) {
          const scraper = new Scraper();
          await scraper.init();
          flatsData = await scraper.scrapeFlats(`https://www.sreality.cz/hledani/prodej/byty?strana=${req.params.id}`);
          console.log(flatsData);
          await scraper.close();
          await saveProperties(flatsData);
  
        }

        let returnedData = await getDataFromDatabase(req.params.id);
        res.status(200).json(returnedData);

      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while scraping');
      }
});

app.get("/api/delete", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("TRUNCATE TABLE flats_data RESTART IDENTITY;");
    await client.query('COMMIT');

    res.json({message: "Data Deleted Successfully!"});
  } catch (error) {
    await client.query("ROLLBACK");
    throw error
  } finally {
    client.release();
  }

})


app.listen(port, () => {
    console.log(`server started on port ${port}`);
  });


export {}