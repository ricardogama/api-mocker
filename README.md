# api-mocker

Server to mock and record API requests.

## Status

[![Build Status](https://travis-ci.com/Teamwork/api-mocker.svg?branch=master)](https://travis-ci.com/Teamwork/api-mocker) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](/LICENSE)

## Overview

Running integration tests of applications that query a third party API is sometimes not reliable due to rate limit constraints, which can easily be hit when these tests run on consecutive pipelines, or even locally in development phase.

This server is designed to mock any API when writing integration tests, enabling you to dynamically define what requests to expect and what they should return, and also ensure no unexpected requests were queried.

## Related

- [api-mocker-go](https://github.com/ricardogama/api-mocker-go) - Go SDK for [api-mocker](https://github.com/ricardogama/api-mocker)
- [gripmock](https://github.com/tokopedia/gripmock) - gRPC Mock Server

## Usage

You can run the server directly with the `start` script:

```sh
$ npm start
```

The server will listen on port `3000` by default, but you can override it with the `PORT` environment variable:

```sh
$ PORT=3005 npm start
Mocking on port 3005
```

You can also run the server in a Docker container:

```sh
$ docker run -d -p 3000:3000 teamwork/api-mocker:latest
```

If you have the local environment defined in a `docker-compose.yml` file:

```yml
aws:
  container_name: aws
  image: teamwork/api-mocker
  environment:
    PORT: 3005
  ports:
    - 3005:3005
```

## Specification

The following endpoints enable you to define the test scenario for each test.

Any other request is recorded and either pulled from the expected list or added to the unexpected list.

**And unexpected request returns a 204 response.**

- [`POST /mocks`](#post-mocks)
- [`GET /mocks`](#get-mocks)
- [`DELETE /mocks`](#delete-mocks)

### `POST /mocks`

This endpoint enables you to register a mock. If there is a request match, the defined response is returned and the mock is popped from the expected list.

#### Request body

```json
{
  "method": "<string | required | must be a valid HTTP method>",
  "path": "<string | required>",
  "headers": "<object | optional | all values must be strings>",
  "body": "<object | optional>",
  "times": "<number | optional>",
  "response": {
    "status": "<number | required | must be a valid HTTP status code>",
    "headers": "<object | optional | all values must be strings>",
    "body": "<object | optional>"
  }
}
```

Example:

```json
{
  "method": "POST",
  "path": "/foo",
  "headers": {
    "x-user-id": "1"
  },
  "body": {
    "foo": "bar"
  },
  "response": {
    "status": 201,
    "headers": {
      "foo": "biz"
    },
    "body": {
      "biz": "baz"
    }
  }
}
```

### Responses

- 201 - Mock registered with success.
- 400 - Invalid request, the invalid fields will be returned on the response body.

In the following example the `path` fields is missing:

```json
{
  "path": {
    "__class__": "Violation",
    "assert": {
      "__class__": "HaveProperty",
      "__parentClass__": "Assert",
      "groups": [],
      "node": "path"
    },
    "value": {
      "method": "POST",
      "headers": {
        "x-user-id": "1"
      },
      "body": {
        "foo": "bar"
      },
      "response": {
        "status": 201,
        "body": {
          "biz": "baz"
        }
      }
    },
    "violation": {
      "value": "path"
    }
  }
}
```

### `GET /mocks`

This endpoint returns the current expected and unexpected requests. Usually you will query this endpoint in the end of each test making sure both are empty, otherwise meaning that a request that you expected was not queried, or there was a request that you did not expect.

#### Responses

- 200 - Returns the list of expected and unexpected requests.

```json
{
  "expected": "<[]object | list of expected requests>",
  "unexpected": "<[]object | list of unexpected requests>"
}
```

Example:

```json
{
  "expected": [
    {
      "method": "PUT",
      "path": "/campaigns/trigger/send",
      "body": {
        "api_key": "API_KEY",
        "recipients": [
          {
            "external_user_id": "1111"
          },
          {
            "external_user_id": "2222"
          }
        ]
      },
      "response": {
        "status": 204
      }
    }
  ],
  "unexpected": [
    {
      "method": "POST",
      "path": "/campaigns/trigger/send",
      "headers": {
        "host": "localhost:3005",
        "user-agent": "Go-http-client/1.1",
        "content-length": "405",
        "content-type": "application/json",
        "accept-encoding": "gzip"
      },
      "body": {
        "api_key": "API_KEY",
        "campaign_id": "campaign-1",
        "recipients": [
          {
            "external_user_id": "1111"
          },
          {
            "external_user_id": "2222"
          }
        ]
      }
    }
  ]
}
```

### `DELETE /mocks`

This endpoint clears the expected and unexpected list of requests, and is usually called in the beginning of a test.

#### Responses

- 204 - Mocks cleared with success.

# License

[MIT](/LICENSE)
