# Event Management 🗓️

This project is a simple web application for event management, allowing both **administrators** to create and manage events, and **users** to view, register for, and unregister from them. It uses JSON Server as a simulated REST API to persist data.

## 🚀 Features

### General Functionalities
* **Event Visualization**: Allows viewing a list of all available events.
* **Real-time Search Filter**: Search for events by name, description, location, or date in both admin and user views, updating results as you type.
* **Basic Authentication**: Simulates a login/logout system to differentiate between user and administrator roles.

### Administrator Functionalities (`#/crud`)
Users with an administrator role have access to a complete control panel for event management (CRUD - Create, Read, Update, Delete).
* **Create New Events**: Add new events with details such as name, description, date, time, location, and capacity.
* **List Events**: View a table with all created events, including the number of registered users and total capacity.
* **Edit Events**: Modify existing event details. Editing allows retaining the list of already registered users.
* **Delete Events**: Permanently delete events.
* **Capacity Management**: Set the maximum attendance capacity for each event.

### User Functionalities (`#/events`)
Logged-in users (or guests) can interact with available events.
* **View Available Events**: Browse all scheduled events.
* **Event Registration**: Join an event if capacity is available and if the user is not already registered.
* **Event Unregistration**: Cancel participation in an event they had registered for.
* **User Registered Events**: View a dedicated section with only the events the current user has registered for.
* **Capacity Validation**: The application automatically checks if an event has reached its maximum capacity before allowing registration.
* **Confirmation Messages**: Clear alerts to the user about the success or failure of registration/unregistration operations.

## 🛠️ Technologies Used

* **HTML5**: Web page structure.
* **CSS3**: Styles and visual design.
* **JavaScript (ES6+)**: Client-side logic, DOM manipulation, and API communication.
* **JSON Server**: To simulate a RESTful API and persist event and user data in a `db.json` file.

## ⚙️ Project Setup

To set up and run this project on your local machine, follow these steps:

### Prerequisites

Make sure you have the following installed:
* **Node.js** and **npm** (Node Package Manager).

### Installation Steps

1.  **Clone the repository** (if applicable) or download the project files.
2.  **Navigate to the project directory** in your terminal.

    ```bash
    cd your-event-project
    ```

3.  **Install JSON Server**:

    ```bash
    npm install -g json-server
    ```

4.  **Configure your `db.json`**:
    Create a file named `db.json` in the root of your project (or where JSON Server is configured) with the following structure.

    ```json
    {
      "users": [
        {
          "id": "admin123",
          "username": "admin",
          "password": "admin123",
          "role": "admin"
        },
        {
          "id": "visitor-456",
          "username": "user123",
          "password": "user123",
          "role": "user"
        }
      ],
      "events": [
        {
          "id": "event-001",
          "name": "Web Development Conference",
          "description": "A conference on the latest trends in frontend and backend development.",
          "date": "2025-08-15",
          "time": "09:00",
          "location": "Convention Center",
          "capacity": 1000,
          "registeredUsers": []
        },
        {
          "id": "event-002",
          "name": "React and Vue Workshop",
          "description": "Hands-on session on the most popular JavaScript frameworks.",
          "date": "2025-09-01",
          "time": "14:00",
          "location": "Training Room 3",
          "capacity": 30,
          "registeredUsers": []
        },
        {
          "id": "event-003",
          "name": "Cybersecurity Webinar",
          "description": "Online talk on how to protect your applications.",
          "date": "2025-09-10",
          "time": "18:00",
          "location": "Online",
          "capacity": 500,
          "registeredUsers": [
            "visitor-456"
          ]
        },
        {
          "id": "9edb",
          "name": "clase",
          "description": "programming tutorials",
          "date": "2025-07-16",
          "time": "10:19",
          "location": "cra 26$76b-47",
          "capacity": 8,
          "registeredUsers": []
        }
      ]
    }
    ```

### Project Execution

1.  **Start JSON Server**:
    Open a terminal and run the following command to start your REST API:

    ```bash
    json-server --watch db.json --port 3000
    ```
    This will start the server at `http://localhost:3000`. Keep this terminal open.

2.  **Install dependencies**:
    ```bash
    npm i
    ```
3.  **Run the host**:
    ```bash
    npm run dev
    ```

## 🗺️ Project Structure
```
your-event-project/
├── index.html                  # Main application page.
├── db.json                     # Simulated database for JSON Server.
├── src/
│   ├── css/
│   │   └── style.css           # Main application styles.
│   ├── controllers/
│   │   ├── auth.services.js    # Authentication logic (login/logout).
│   │   └── events.services.js  # Logic for event management (CRUD, registration, unregistration, filters).
│   ├── views/
│   │   ├── login.html          # View for the login form.
│   │   ├── events.html         # View for users (display and manage event registrations).
│   │   └── crudEvents.html     # View for administrators (event CRUD).
│   └── router.js               # Application routing based on URL hash.
└── README.md                   # This file.
```

## 🔑 Test Accounts

You can use the following credentials to test the different functionalities:

* **Administrator**:
    * **Username**: `admin`
    * **Password**: `admin123`
    * Access to event CRUD at `#/crud`.
    * Access to the events view at `#/events` to register for an event.

* **Standard User**:
    * **Username**: `user123`
    * **Password**: `user123`
    * Access to the events view at `#/events` to register for an event.