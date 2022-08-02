import express from 'express';
import postgresql from './postgresql.js';

postgresql();

const app = express();


app.get('/qa/questions/product_id=:product_id', async (req, res) => {
  const questions = await process.postgresql.query(`
  SELECT json_build_object (
    'question_id', id,
    'question_body', q.body,
    'question_date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + q.date_written::bigint * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    'asker_name', q.asker_name,
    'question_helpfulness', q.helpful,
    'reported', q.reported,
    'answers', (SELECT coalesce(json_agg(json_build_object(
      'id', a.id,
      'body',
      a.body,
      'date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + a.date_written::bigint * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
      'answerer_name', a.answerer_name,
      'helpfulness', a.helpful,
      'photos', (SELECT coalesce (json_agg(json_build_object(
        'photo_id', ap.id,
        'url', ap.url
      )), '[]')
      from "Answers_Photos" ap where ap.answer_id = a.id)
    )
    ), '[]') from "Answers" a where question_id = q.id)
  ) from "Questions" q
  where product_id = ${req.params.product_id}

;`)
  res.status(200).send((JSON.stringify(questions)));
});

//      'date', a.date_written,
//to_char(TIMESTAMP WITH Time Zone 'epoch' + a.date_written * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:)

app.get('/photos/answer_id=:answer_id' , async (req, res) => {
  const photos = await process.postgresql.query(`
  select array_agg(url)
  from "Answers_Photos"
  where answer_id
  in (select id from "Answers" where id = ${req.params.answer_id})
  ;`)
  res.status(200).send(JSON.stringify(photos));
});

app.listen(3000, () => {
  console.log('App running at http://localhost:3000');
});


// const fs = require('fs');
// const { parse } = require('csv-parse');
// const parser = parse({colphns: true}, function(err, records) {
//   console.log(records);
// })


// fs.createReadStream(__dirname + '/questions.csv').pipe(parser);

// SELECT q.id, q.product_id, q.body, q.date_written, q.asker_name, q.asker_email, q.reported, q.helpful, a.id FROM "Questions" q LEFT JOIN "Answers" a on q.id = a.question_id LIMIT 20