# College Graduate Project in Software Development
## Overview
This project is a college graduate project in software development, focused on building a social networking site. The goal of the project is to create a platform for people to connect, create activities, and manage attendees and profiles.

## Features
- Create and manage activities
- Manage activity attendees
- Manage user profiles
- Login with another social network account (e.g. Facebook)
- Email verification for account authentication

## Directory Structure
The project follows Clean Architecture CQRS Intermediate Template and has separate folders for:

- API: Contains the API endpoints and controllers.
- Application: Contains the application layer and implements the use cases.
- Domain: Contains the domain entities, services and interfaces.
- Infrastructure: Contains the implementation of the interfaces defined in the domain layer.
- Persistence: Contains the implementation of data access.
- client-app: Contains the front-end application.
## Technologies
- Back-end: .NET 7
- Front-end: React 18
- Database: SQL Lite (can be easily converted to other relational databases like MS SQL, MySQL, etc.)
## Deployment
The project has been deployed and is accessible on the internet through fly.io.

## Installation
### Back-end
1. Install .NET 7 using the CLI by running the following command in your terminal:
```
dotnet install
```
Navigate to the API folder and run the following command to restore dependencies:
```
dotnet restore
```
Run the following command to run the API:
```
dotnet run
```
### Front-end
Navigate to the client-app folder and run the following command to install dependencies:
```
npm install
```
Run the following command to start the client-app:
```
npm start
```
## Note
This project serves as a proof of concept for the implementation of a social networking site and can be further developed to include more advanced features and functionalities.
