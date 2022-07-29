import express from 'express';
import postgresql from './postgresql.js';

postgresql();

const app = express();

app.get('/', async(req, res) => {
  res.status(200).send(JSON.stringify("hi, u up? I'm soooo lost"));
});

app.get('/count', async (req, res) => {
  const count = await process.postgresql.query('SELECT q.*, a.id, a.body AS answer_body, a.answerer_name FROM "Questions" q INNER JOIN "Answers" a on q.id = a.question_id LIMIT 1;');
  res.status(200).send(JSON.stringify(count));
});

app.get('/qa/questions', async(req, res) => {
  const questions = await process.postgresql.query('SELECT * FROM "Questions" LIMIT 20;');
  res.status(200).send(JSON.stringify(questions));
});

app.get('/qa/questions/product_id=:product_id', async (req, res) => {
  const questions = await process.postgresql.query(`
  SELECT q.id AS question_id,
  q.body AS question_body,
  q.date_written AS question_date,
  q.asker_name,
  q.helpful AS question_helpfulness,
  q.reported,
  a.id,
  a.body,
  a.date_written AS date,
  a.answerer_name,
  a.helpful AS helpfulness,
  ap.url
  FROM
  "Questions" q INNER JOIN "Answers" a ON q.id = a.question_id
  INNER JOIN "Answers_Photos" ap ON a.id = ap.answer_id
  LIMIT 1;`);
  res.status(200).send((JSON.stringify(questions)));
});

app.get('/answers', async (req, res) => {
  const rows = await process.postgresql.query('SELECT * FROM "Answers" LIMIT 20;');
  res.status(200).send((JSON.stringify(rows)));
});

app.get('/answers_photos', async (req, res) => {
  const rows = await process.postgresql.query('SELECT * FROM "Answers_Photos" LIMIT 20;');
  res.status(200).send((typeof(rows), JSON.stringify(rows)));
});

app.listen(3000, () => {
  console.log('App running at http://localhost:3000');
});


// const fs = require('fs');
// const { parse } = require('csv-parse');
// const parser = parse({columns: true}, function(err, records) {
//   console.log(records);
// })


// fs.createReadStream(__dirname + '/questions.csv').pipe(parser);

// SELECT q.id, q.product_id, q.body, q.date_written, q.asker_name, q.asker_email, q.reported, q.helpful, a.id FROM "Questions" q LEFT JOIN "Answers" a on q.id = a.question_id LIMIT 20