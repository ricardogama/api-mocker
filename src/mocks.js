const { isEqual, isArray } = require('lodash');

// Compare object with string arrays, for headers and query.
const isHeaderEqual = isQueryEqual = (expected, actual) => {
  // Sort all arrays.
  for (const values of Object.values(expected)) {
    values.sort()
  }

  for (const values of Object.values(actual)) {
    values.sort()
  }

  return isEqual(expected, actual)
}

// Stores created mocks.
let expected = [];

// Stores unexpected requests.
let unexpected = [];

// Get mocks state.
exports.getMocks = () => ({
  expected: expected.filter(mock => !mock.anytime),
  unexpected
});

// Clear mocks state.
exports.deleteMocks = () => {
  expected = [];
  unexpected = [];
};

// Add new mock.
exports.createMock = data => {
  const times = data.times || 1;

  // Lower case headers.
  if (data.headers) {
    data.headers = Object.keys(data.headers).reduce((c, k) => {
      c[k.toLowerCase()] = data.headers[k]
      return c
    }, {});
  }

  for (let i=0; i < times; i++) {
    expected.push(data);
  }
};

// Match a request against the expected mocks.
// If there is a match, the mock is returned and removed from the expected list.
// Otherwise, the request is added to the unexpected list.
exports.matchRequest = req => {
  // Transform query single values to array.
  req.query = Object.keys(req.query).reduce((c, k) => {
    if (!isArray(req.query[k])) {
      c[k] = [req.query[k]]
    } else {
      c[k] = req.query[k]
    }
    return c
  }, {});

  // Split headers values by comma.
  req.headers = Object.keys(req.headers).reduce((c, k) => {
    c[k] = req.headers[k].split(',').map(h => h.trim());
    return c
  }, {});

  for (const i in expected) {
    const mock = expected[i];

    if (req.path != mock.path || req.method != mock.method) {
      continue;
    }

    if (mock.headers) {
      if (!isHeaderEqual(req.headers, {...req.headers, ...mock.headers})) {
        console.log(
          "Unexpected request headers for call to " + req.method + " " + req.path +
          "\nExpected:\n" + JSON.stringify(mock.headers) + "\nActual:\n" + JSON.stringify(req.headers)
        );
        continue;
      }
    }

    if (mock.body) {
      if (!isEqual(mock.body, req.body)) {
        console.log(
          "Unexpected request body for call to " + req.method + " " + req.path +
          "\nExpected:\n" + JSON.stringify(mock.body) + "\nActual:\n" + JSON.stringify(req.body)
        );
        continue;
      }
    }

    if (mock.query && !isQueryEqual(mock.query, req.query)) {
      console.log(
        "Unexpected request query for call to " + req.method + " " + req.path +
        "\nExpected:\n" + JSON.stringify(mock.query) + "\nActual:\n" + JSON.stringify(req.query)
      );
      continue;
    }

    if (!mock.anytime) {
      // Remove match from expected.
      expected.splice(i, 1);
    }

    return mock.response;
  }

  // Mark request as unexpected.
  unexpected.push({
    method: req.method,
    headers: req.headers,
    body: req.body,
    path: req.path,
    query: req.query
  });
}
