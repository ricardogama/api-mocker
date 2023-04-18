const express = require('express')
const bodyParser = require('body-parser');
const { STATUS_CODES, METHODS } = require('http');
const { is, validate } = require('./validate');
const { getMocks, createMock, deleteMocks, matchRequest } = require('./mocks');

// Application.
const app = module.exports = express();

// Parse JSON body.
app.use(bodyParser.json());
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Get mocks state.
app.get('/mocks', (req, res) => res.send(getMocks()));

// Create mock.
app.post('/mocks', (req, res) => {
  const errors = validate(req.body || {}, {
    response: {
      status: [is.Required(), is.Choice(Object.keys(STATUS_CODES).map(code => Number(code)))],
      body: is.Body(),
      headers: is.Headers()
    },
    method: [is.Required(), is.Choice(METHODS)],
    path: [is.Required(), is.String(), is.NotBlank()],
    body: is.Body(),
    headers: is.Headers(),
    times: [is.Integer(), is.GreaterThanOrEqual(1)],
    query: is.Query(),
    anytime: is.Boolean()
  });

  if (errors !== true) {
    return res.status(400).send(errors);
  }

  createMock(req.body);

  res.sendStatus(201);
});

// Delete mocks.
app.delete('/mocks', (req, res) => {
  deleteMocks();

  res.sendStatus(204);
});

// Record request.
app.use(function (req, res, next) {
  match = matchRequest(req);

  if (!match) {
    return res.sendStatus(204);
  }

  res.
    // Join headers arrays.
    set(Object.keys(match.headers || {}).reduce((c, k) => {
      c[k] = match.headers[k].join(',');
      return c
    }, {})).
    status(match.status).
    send(match.body);
})
