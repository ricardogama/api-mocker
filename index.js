const port = require('config').get('port');

// Start server.
require('./src/app').listen(port, () => console.log(`Mocking on port ${port}`));
