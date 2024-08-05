# User Management API Project Documentation

## Project Setup

This project is a RESTful API for managing user registration, authentication, and profile management using Node.js and
NestJS.

### Prerequisites

- Node.js: Version 16.x or 18.x
- npm: Version 7.x or 8.x

### Clone the Repository

Clone the repository from GitHub:

```sh
git clone <repository-url>
cd user-management
```

## Install Dependencies

Install the necessary dependencies:

```sh
npm install
```

## Environment Variables

Copy the .env.sample as .env

## Running the Application

You can run the application in different modes using the following npm scripts:

### Development Mode

```
npm run start:dev
```

### Production Mode

``` 
npm run build
npm run start:prod
```

## Running Tests

### Run all tests:

```
Run tests in watch mode:
```

### Run tests in watch mode:

```
npm run test:watch
```

### Run tests with coverage:

```
npm run test:cov
```

### Debug tests:

```
npm run test:debug
```

### Run end-to-end (E2E) tests:

```
npm run test:e2e
```

Debug mode: Starts the application in debug mode with hot-reloading enabled.

```
npm run start:debug
```

## Database Setup

I used SQLlite no config is required

## API Documentation

The API documentation is automatically generated using Swagger. You can access the Swagger documentation
at http://localhost:3000/api after starting the application.

## Improvements

### Logging

#### Additional Improvements
- logging: To add logging, we can integrate a more comprehensive logging system
  such as Winston
- Create a file named jest.setup.js for setuping the database (currently its setup inside each e2e test)
- Input Validation: Ensure all input data is validated using classes and decorators provided by class-validator and
  class-transformer.
- Error Handling: Implement a global error handling mechanism to standardize API responses for errors.
- Enhancing Error Handling with Custom Error Classes: by creating custom error classes to handle specific types of errors
  such as validation errors, database errors.
- Rate Limiting: Implement rate limiting to protect the API from abuse.
- Security Enhancements: Add security enhancements such as Helmet for setting HTTP headers, and CORS for cross-origin
  resource sharing.
- Performance Monitoring: Integrate performance monitoring tools such as New Relic or AppDynamics to monitor the API's
  performance in real-time.
- Api response: Implement a standard API response format to ensure consistency across all API endpoints.
- - **Success response**
```json 
{
  "success": true,
  "data": {}
}
```
- - **Error response**
```json
{
  "status": "validation_failed",
  "message": "Validation errors occurred",
  "details": [
    {
      "field": "username",
      "value": "john_doe",
      "location": "body",
      "issue": "too_short",
      "description": "The username must be at least 5 characters long."
    },
    {
      "field": "email",
      "value": "john.doe@example",
      "location": "body",
      "issue": "invalid_format",
      "description": "The email format is invalid."
    }
  ],
  "timestamp": "2024-08-05T12:34:56.789Z"
}
```