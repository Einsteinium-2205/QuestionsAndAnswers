import express from 'express';
import postgresql from './postgresql.js';

postgresql();

const app = express();

app.use(express.json());

app.get('/qa/questions/:question_id/answers/' , async (req, res) => {
  const answers = await process.postgresql.query(`
  SELECT json_build_object(
    'answers', json_agg(
      json_build_object(
        'id', a.id,
        'body',
        a.body,
        'date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + a.date_written * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        'answerer_name', a.answerer_name,
        'helpfulness', a.helpful,
        'photos', (SELECT coalesce (json_agg(json_build_object(
          'photo_id', ap.id,
          'url', ap.url
    )), '[]')
    from "Answers_Photos" ap where ap.answer_id = a.id and a.reported = false)
  )
    )
  ) from "Answers" a where question_id = ${req.params.question_id} and reported = false
  ;`)
  res.status(200).send(JSON.stringify(answers));
})

app.get('/qa/questions/:product_id/:count?', async (req, res) => {
  const questions = await process.postgresql.query(`
  SELECT json_build_object (
    'question_id', id,
    'question_body', q.body,
    'question_date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + q.date_written * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
    'asker_name', q.asker_name,
    'question_helpfulness', q.helpful,
    'reported', q.reported,
    'answers', (SELECT coalesce(
        json_agg(json_build_object(
          'id', a.id,
          'body',
          a.body,
          'date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + a.date_written * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
          'answerer_name', a.answerer_name,
          'helpfulness', a.helpful,
          'photos', (SELECT coalesce (json_agg(json_build_object(
            'photo_id', ap.id,
            'url', ap.url
      )), '[]')
      from "Answers_Photos" ap where ap.answer_id = a.id and a.reported = false)
    )
    ), '[]') from "Answers" a where question_id = q.id)
  ) from "Questions" q
  where product_id = ${req.params.product_id} and reported = false LIMIT ${req.params.count || 5}
;`)
  res.status(200).send((JSON.stringify({'product_id': req.params.product_id, 'results': questions})));
});

app.post('/qa/questions', async (req, res) => {
  let data = req.body
  const questions = await process.postgresql.query(`
  INSERT INTO "Questions" (
    product_id, body, date_written, asker_name, asker_email, reported, helpful)
    VALUES (
      ${data.product_id}, '${data.body}', ${Date.now()}, '${data.name}', '${data.email}', false, 0)
  ;`)
  res.status(201).send('CREATED')
})

app.get('/qa/questions/:question_id/answers/' , async (req, res) => {
  const answers = await process.postgresql.query(`
  SELECT json_build_object(
    'answers', json_agg(
      json_build_object(
        'id', a.id,
        'body',
        a.body,
        'date', (SELECT to_char(TIMESTAMP WITH Time Zone 'epoch' + a.date_written * INTERVAL '1 millisecond', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
        'answerer_name', a.answerer_name,
        'helpfulness', a.helpful,
        'photos', (SELECT coalesce (json_agg(json_build_object(
          'photo_id', ap.id,
          'url', ap.url
    )), '[]')
    from "Answers_Photos" ap where ap.answer_id = a.id and a.reported = false)
  )
    )
  ) from "Answers" a where question_id = ${req.params.question_id} and reported = false
  ;`)
  res.status(200).send(JSON.stringify(answers));
});

// app.post('/qa/questions/:question_id/answers', async (req, res) => {
//   console.log(req)

//   // id           | integer                |           | not null |
//   // product_id   | integer                |           | not null |
//   // body         | character varying(255) |           | not null |
//   // date_written | bigint                 |           | not null |
//   // asker_name   | character varying(255) |           | not null |
//   // asker_email  | character varying(255) |           | not null |
//   // reported     | boolean                |           | not null |
//   // helpful

//   res.status(201).send('CREATED')
// })

app.put('/qa/questions/:question_id/helpful',  async (req, res) => {
  const markQuestionHelpful = await process.postgresql.query(`
    UPDATE "Questions"
    SET helpful = helpful + 1
    WHERE id = ${req.params.question_id}
  ;`)
  res.status(204).send()
})

app.put('/qa/questions/:question_id/report',  async (req, res) => {
  const reportQuestion = await process.postgresql.query(`
    UPDATE "Questions"
    SET reported = true
    WHERE id = ${req.params.question_id}
  ;`)
  res.status(204).send()
})

app.put('/qa/questions/:answer_id/helpful',  async (req, res) => {
  const reportQuestion = await process.postgresql.query(`
    UPDATE "Answers"
    SET helpful = helpful + 1
    WHERE id = ${req.params.answer_id}
  ;`)
  res.status(204).send()
})

app.put('/qa/questions/:answer_id/report',  async (req, res) => {
  const reportQuestion = await process.postgresql.query(`
    UPDATE "Answers"
    SET reported = false
    WHERE id = ${req.params.answer_id}
  ;`)
  res.status(204).send()
})

app.listen(3000, () => {
  console.log('App running at http://localhost:3000');
});
