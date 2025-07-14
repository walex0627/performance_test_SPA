// --- User permission logic for the admin role ---

let currentEventEditId = null;
const eventsURL = "http://localhost:3000/events";

// --- API Communication Functions (fetch) ---

export async function getEventsData() {
    try {
        const resp = await fetch(eventsURL);

        if (!resp.ok) {
            throw new Error(`HTTP Error! Status: ${resp.status}`);
        }
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error("Error fetching event data:", error);
        return [];
    }
}

export async function sendEventData(eventFormData) {
    try {
        const resp = await fetch(eventsURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventFormData)
        });

        if (resp.ok) {
            alert("Event created successfully.");
        } else {
            const errorText = await resp.text();
            throw new Error(`Error creating event: ${resp.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("Error sending event data:", error);
        alert("An error occurred while creating the event.");
    }
}

export async function updateEvent(eventData) {
    const idToUpdate = eventData.id || currentEventEditId;

    if (!idToUpdate) {
        console.error("No event ID to update.");
        alert("Could not identify the event to update.");
        return false;
    }

    try {
        const resp = await fetch(`${eventsURL}/${idToUpdate}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (resp.ok) {
            return true;
        } else {
            const errorText = await resp.text();
            throw new Error(`Error updating event: ${resp.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("Error updating event:", error);
        alert("Error updating the event.");
        return false;
    }
}

export async function deleteEvent(id) {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
        const resp = await fetch(`${eventsURL}/${id}`, {
            method: 'DELETE'
        });

        if (resp.ok) {
            alert("Event deleted successfully.");
            return true;
        } else {
            const errorText = await resp.text();
            throw new Error(`Error deleting event: ${resp.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting the event.");
        return false;
    }
}

// --- UI Manipulation Functions (Form and Table) ---

export async function setupCrudEvents() {
    // References to DOM elements from crudEvents.html
    const eventForm = document.getElementById("eventForm");
    const eventIdField = document.getElementById("eventId");
    const eventNameField = document.getElementById("eventName");
    const eventDescriptionField = document.getElementById("eventDescription");
    const eventDateField = document.getElementById("eventDate");
    const eventTimeField = document.getElementById("eventTime");
    const eventLocationField = document.getElementById("eventLocation");
    const eventCapacityField = document.getElementById("eventCapacity");
    const saveEventBtn = document.getElementById("saveEventBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const eventsTableBody = document.getElementById("eventsTableBody");
    const searchAdminInput = document.getElementById("searchAdminInput");

    // Function to clear the form and reset the editing state
    function clearForm() {
        eventForm.reset();
        eventIdField.value = "";
        saveEventBtn.textContent = "Create Event";
        cancelEditBtn.style.display = "none";
        currentEventEditId = null;
    }

    // Function to populate the form with event data
    async function fillFormForEdit(id) {
        try {
            const resp = await fetch(`${eventsURL}/${id}`);
            if (!resp.ok) {
                throw new Error(`Error getting event for editing: ${resp.status}`);
            }
            const data = await resp.json();

            eventNameField.value = data.name;
            eventDescriptionField.value = data.description;
            eventDateField.value = data.date;
            eventTimeField.value = data.time;
            eventLocationField.value = data.location;
            eventCapacityField.value = data.capacity;

            eventIdField.value = data.id;
            currentEventEditId = data.id;
            saveEventBtn.textContent = "Update Event";
            cancelEditBtn.style.display = "inline-block";

            alert(`Editing event: ${data.name}`);
        } catch (error) {
            console.error("Error populating form for editing:", error);
            alert("Error loading event data for editing.");
        }
    }

    // Function to render the events table (now with filter)
    const renderEventsTable = async (searchTerm = '') => {
        eventsTableBody.innerHTML = '<tr class="bg-white"><td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Loading events...</td></tr>';
        const allEvents = await getEventsData();
        eventsTableBody.innerHTML = '';

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Filters events based on the search term
        const filteredEvents = allEvents.filter(event =>
            event.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.description.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.location.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.date.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (filteredEvents.length === 0) { // Uses filteredEvents here

            eventsTableBody.innerHTML = '<tr class="bg-white"><td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">No events to display with this filter.</td></tr>';
            return;
        }

        filteredEvents.forEach(event => { // Iterates over filtered events
            const row = document.createElement('tr');

            row.className = 'bg-white hover:bg-gray-50'; 
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${event.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${event.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.time}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.location}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.capacity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.registeredUsers ? event.registeredUsers.length : 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="edit-event-btn text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer" data-id="${event.id}">Edit</button>
                    <button class="delete-event-btn text-red-600 hover:text-red-900 cursor-pointer" data-id="${event.id}">Delete</button>
                </td>
            `;
            eventsTableBody.appendChild(row);
        });

        // Event listeners for edit and delete
        eventsTableBody.querySelectorAll('.edit-event-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                await fillFormForEdit(e.target.dataset.id);
            });
        });

        eventsTableBody.querySelectorAll('.delete-event-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const success = await deleteEvent(e.target.dataset.id);
                if (success) {
                    await renderEventsTable(searchAdminInput.value);
                }
            });
        });
    };

    // --- Form Event Handlers ---

    // Handle form submission (Create or Update)
    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const eventData = {
            name: eventNameField.value.trim(),
            description: eventDescriptionField.value.trim(),
            date: eventDateField.value,
            time: eventTimeField.value,
            location: eventLocationField.value.trim(),
            capacity: parseInt(eventCapacityField.value, 10),
            registeredUsers: []
        };


        if (currentEventEditId) {
            const existingEvent = await (await fetch(`${eventsURL}/${currentEventEditId}`)).json();
            eventData.registeredUsers = existingEvent.registeredUsers || [];
            eventData.id = currentEventEditId;
        }


        // Basic validation
        if (!eventData.name || !eventData.description || !eventData.date || !eventData.time ||
            !eventData.location || isNaN(eventData.capacity) || eventData.capacity <= 0) {
            alert("Please fill in all event fields correctly.");
            return;
        }

        let successOperation = false;
        if (currentEventEditId) {
            successOperation = await updateEvent(eventData);
            if (successOperation) alert("Event updated successfully.");
        } else {
            successOperation = await sendEventData(eventData);
        }


        if (successOperation) {
            clearForm();
            await renderEventsTable(searchAdminInput.value);
        }
    });


    cancelEditBtn.addEventListener('click', clearForm);

    // Filter to search events from the admin
    searchAdminInput.addEventListener('input', () => {
        renderEventsTable(searchAdminInput.value);
    });

    // --- Initialization ---
    await renderEventsTable();
}

// --- User permission logic for the user role ---

export async function registerForEvent(eventId, userId) {
    if (!userId) {
        alert("You must log in to register for an event.");
        return false;
    }

    try {
        const response = await fetch(`${eventsURL}/${eventId}`);
        if (!response.ok) throw new Error(`Event not found: ${response.status}`);
        const event = await response.json();

        if (!event.registeredUsers) {
            event.registeredUsers = [];
        }

        if (event.registeredUsers.length >= event.capacity) {
            alert("This event no longer has available capacity.");
            return false;
        }

        if (event.registeredUsers.includes(userId)) {
            alert("You are already registered for this event.");
            return false;
        }

        event.registeredUsers.push(userId);

        const success = await updateEvent(event);

        if (success) {
            alert("You have successfully registered for the event!");
            return true;
        } else {
            alert("Could not complete registration.");
            return false;
        }
    } catch (error) {
        console.error("Error registering for the event:", error);
        alert("An error occurred while trying to register.");
        return false;
    }
}

export async function unregisterFromEvent(eventId, userId) {
    if (!userId) {
        alert("Cannot unregister: user not identified.");
        return false;
    }

    try {
        const response = await fetch(`${eventsURL}/${eventId}`);
        if (!response.ok) throw new Error(`Event not found: ${response.status}`);
        const event = await response.json();

        if (!event.registeredUsers || !event.registeredUsers.includes(userId)) {
            alert("You are not registered for this event.");
            return false;
        }

        event.registeredUsers = event.registeredUsers.filter(id => id !== userId);

        const success = await updateEvent(event);

        if (success) {
            alert("You have successfully unregistered from the event.");
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error unregistering from the event:", error);
        alert("An error occurred while trying to unregister.");
        return false;
    }
}

export async function getUserRegisteredEvents() {
    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser ? currentUser.id : null;

    if (!userId) {
        console.warn("No user ID to get registered events.");
        return [];
    }
    try {
        const allEvents = await getEventsData();
        return allEvents.filter(event =>
            event.registeredUsers && event.registeredUsers.includes(userId)
        );
    } catch (error) {
        console.error("Error getting user registered events:", error);
        return [];
    }
}

export async function setupUserEventsView() {

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUserId = currentUser ? currentUser.id : null;

    const allEventsList = document.getElementById("allEventsList");
    const myRegisteredEventsList = document.getElementById("myRegisteredEventsList");
    const searchUserInput = document.getElementById("searchUserInput");

    // Function to render the complete list of available events
    //Filter
    const renderAllEvents = async (searchTerm = '') => {

        allEventsList.innerHTML = '<li class="p-4 text-gray-500 italic">Loading available events...</li>';
        const allEvents = await getEventsData();
        allEventsList.innerHTML = '';

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        // Filters events based on the search term
        const filteredEvents = allEvents.filter(event =>
            event.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.description.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.location.toLowerCase().includes(lowerCaseSearchTerm) ||
            event.date.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (filteredEvents.length === 0) {
            allEventsList.innerHTML = '<li class="p-4 text-gray-500 italic">No available events match the search.</li>';
            return;
        }

        filteredEvents.forEach(event => {
            const isRegistered = currentUserId && event.registeredUsers && event.registeredUsers.includes(currentUserId);
            const isFull = event.registeredUsers && event.registeredUsers.length >= event.capacity;

            const li = document.createElement('li');
            li.className = 'bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200';
            li.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${event.name}</h3>
                <p class="text-gray-700 mb-1"><strong>Description:</strong> ${event.description}</p>
                <p class="text-gray-600 text-sm mb-1"><strong>Date:</strong> ${event.date} <strong>Time:</strong> ${event.time}</p>
                <p class="text-gray-600 text-sm mb-2"><strong>Location:</strong> ${event.location}</p>
                <p class="text-gray-600 text-sm mb-4"><strong>Capacity:</strong> <span class="${isFull ? 'text-red-600 font-bold' : 'text-green-600'}">${event.registeredUsers ? event.registeredUsers.length : 0}</span>/${event.capacity}</p>

                ${currentUserId ? `
                    <button class="register-event-btn cursor-pointer
                                  ${isRegistered || isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            data-id="${event.id}" ${isRegistered || isFull ? 'disabled' : ''}>
                        ${isRegistered ? 'Already Registered' : (isFull ? 'Full' : 'Register')}
                    </button>
                    ${isRegistered ? `
                    <button class="unregister-event-btn cursor-pointer
                                  bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded
                                  focus:outline-none focus:shadow-outline ml-2"
                            data-id="${event.id}">Unregister</button>` : ''}
                ` : `
                    <p class="text-gray-500 italic">Log in to register for events.</p>
                `}
                <hr class="my-4 border-gray-200">
            `;
            allEventsList.appendChild(li);
        });

        if (currentUserId) {
            allEventsList.querySelectorAll('.register-event-btn').forEach(button => {
                if (!button.disabled) {
                    button.addEventListener('click', async (e) => {
                        const eventId = e.target.dataset.id;
                        const success = await registerForEvent(eventId, currentUserId);
                        if (success) {
                            await renderAllEvents(searchUserInput.value);
                            await renderMyRegisteredEvents();
                        }
                    });
                }
            });

            allEventsList.querySelectorAll('.unregister-event-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const eventId = e.target.dataset.id;
                    const success = await unregisterFromEvent(eventId, currentUserId);
                    if (success) {
                        await renderAllEvents(searchUserInput.value);
                        await renderMyRegisteredEvents();
                    }
                });
            });
        }
    };

    const renderMyRegisteredEvents = async () => { 
        myRegisteredEventsList.innerHTML = '<li class="p-4 text-gray-500 italic">Loading your registrations...</li>';
        if (!currentUserId) {
            myRegisteredEventsList.innerHTML = '<li class="p-4 text-gray-500 italic">Log in to view your registered events.</li>';
            return;
        }
        const registeredEvents = await getUserRegisteredEvents();
        myRegisteredEventsList.innerHTML = '';

        if (registeredEvents.length === 0) {
            myRegisteredEventsList.innerHTML = '<li class="p-4 text-gray-500 italic">You are not yet registered for any events.</li>';
            return;
        }

        registeredEvents.forEach(event => {
            const li = document.createElement('li');
            li.className = 'bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200';
            li.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${event.name}</h3>
                <p class="text-gray-700 mb-1"><strong>Date:</strong> ${event.date} <strong>Time:</strong> ${event.time}</p>
                <p class="text-gray-600 text-sm mb-2"><strong>Location:</strong> ${event.location}</p>
                <p class="text-gray-700 mb-4">${event.description}</p>
                <button class="unregister-event-btn cursor-pointer
                              bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded
                              focus:outline-none focus:shadow-outline"
                        data-id="${event.id}">Unregister</button>
                <hr class="my-4 border-gray-200">
            `;
            myRegisteredEventsList.appendChild(li);
        });

        myRegisteredEventsList.querySelectorAll('.unregister-event-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const eventId = e.target.dataset.id;
                const success = await unregisterFromEvent(eventId, currentUserId);
                if (success) {
                    await renderAllEvents(searchUserInput.value);
                    await renderMyRegisteredEvents();
                }
            });
        });
    };


    searchUserInput.addEventListener('input', () => {
        renderAllEvents(searchUserInput.value);
    });

    await renderAllEvents();
    await renderMyRegisteredEvents();
}