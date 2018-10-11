const { isEqual } = require('lodash');

// Stores created mocks.
let expected = [];

// Stores unexpected requests.
let unexpected = [];

// Get mocks state.
exports.getMocks = () => ({
  expected,
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
  for (const i in expected) {
    const mock = expected[i];

    if (req.path != mock.path || req.method != mock.method) {
      continue;
    }

    if (mock.headers) {
      if (!isEqual(req.headers, {...req.headers, ...mock.headers})) {
        continue;
      }
    }

    if (mock.body) {
      if (!isEqual(mock.body, req.body)) {
        continue;
      }
    }

    if (mock.query && !isEqual(mock.query, req.query)) {
      continue;
    }

    // Remove match from expected.
    expected.splice(i, 1);

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
