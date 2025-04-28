# Socket.io Chat Room Demo

A simple real-time chat application using Socket.io and Express that allows users to join different course-specific chat rooms.

## Features

- Real-time messaging between users
- Multiple chat rooms (CS134, CS143, CS144)
- User join/leave notifications
- Simple, intuitive interface

## Prerequisites

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

## Getting Started

### Installation

1. Clone this repository

`git clone https://github.com/yourusername/socket-chatroom.git`
`cd socket-chatroom`

2. Install dependencies

`npm install`

3. Start the server

`npm start`

4. Open your browser to `http://localhost:1919`

## How to Use

1. Enter your username in the input field
2. Select a chat room from the dropdown menu
3. Click "Join" to enter the chat room
4. Type messages in the input field at the bottom and press Enter or click "Send"
5. You'll see messages from other users in the same room in real-time

## Project Structure

- `app.js`: Server-side code (Socket.io and Express)
- `public/index.html`: Client-side code and UI

## Technology Stack

- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Frontend**: HTML, CSS, JavaScript

## License

MIT

## Acknowledgments

- Built with Socket.io (https://socket.io/)
- Uses Express.js (https://expressjs.com/)
