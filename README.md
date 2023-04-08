# Connect People

Connect People is a social networking site designed to help people connect and create activities with others. This project was originally developed as a college graduate project in software development and has since been updated to include new features and technologies.

## Features

- Create and manage activities
- Manage activity attendees
- Manage user profiles
- Login with another social network account (e.g. Facebook)
- Email verification for account authentication

## Technologies

- Back-end: .NET 6
- Front-end: React 18
- Database: PostgreSQL via Docker

## Deployment

The project has been deployed and is accessible on the internet through Fly.io at https://connect-people.fly.dev. We have also implemented a continuous deployment workflow using GitHub Actions, which automatically deploys the latest changes to the main branch.

## Installation

### Back-end

1. Clone the repository using the following command:

```
git clone https://github.com/your-username/connect-people.git
```

2. Navigate to the API folder and run the following command to restore dependencies:

```
dotnet restore
```

3. Run the following command to run the API:

```
dotnet run
```

### Front-end

1. Navigate to the client-app folder and run the following command to install dependencies:

```
npm install
```

2. Run the following command to start the client-app:

```
npm start
```

## Notes

This project is a proof of concept for the implementation of a social networking site and can be further developed to include more advanced features and functionalities. If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request.
