# app-pictionary
Full stack web implementation of the game Pictionary

## Introduction
This project is a work-in-progress (WIP) full stack implementation of the game Pictionary. The objective was to learn general modern web programming practices, APIs and frameworks, from the point of view of someone who didn't have any prior web development experience (except for basic HTML and CSS).

### About the game
Pictionary is a game where one player (the host) has to draw a randomly chosen word for the other players to guess it. The drawing shoudn't contain any words or letters, and the drawer shouldn't give any other hint except for the image itself (e.g. the host can't speak to give hints). The first player to discover the word gains the maximum ammount of points, while each consecutive discovery earns the player less points (e.g. the second player to guess will gain more points than the fifth one).


### Features
The user, upon entering the site should:
- Be able to see all registred users
- Be able to login as a normal user or as an administrator (requires a password)
- See the list of available matches
- Join in an available match if logged in
- Inside a match, a player should:
    - Be able to input text (to guess the word)
    - See the white board being drawn by the match host (it shouldn't be editable by the user)
- Inside a match, the host should:
    - Receive a random word to draw
    - Be able to draw in the whiteboard


## Front end
Programming language: JavaScript

Implemented using:
- CSS Framework: Bootstrap 4
- JavaScript Framework: Vue.js 

## Back end
Programming language: JavaScript

Implemented using:
-  Database management system: MySQL 8.0.19
-  Object-relational mapping: Sequelize
-  JavaScript runtime environment: Node.js 12.14.0
-  Web application framework: Express
-  Express view engine: EJS (Embedded JavaScript)


Socket.io was used for the interaction between users (chat and whiteboard). Bootstrap and Vue.js compiled files are directly present in the source

## File organization
`server.js` has all code relative to back end responses (Express, EJS) and also implements all communication with MySQL.
`views`contains the `.ejs` files that EJS will render to HTML files. These HTMLs are the final pages that appear in the browser.
`front` contains two other folders, `scripts` and `styles` that have the front end `.js` and `.css` files respectively.


## Installing instructions
#### You must have MySQL installed in your machine! Installation varies according to operating system. 
#### If you already have Node.js installed, skip to step 3.

1. If you haven't Node installed, you can install it via nvm:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
```
2. Restart the terminal, and then run
```
nvm use 12.14.0 
```
3. Clone this repository, then inside it run
```
npm install
```
this will install all needed dependencies for the project.

## Running
Simply run
```
node server.js <database name> <DB user> <DB password> <DB address> <DB port>
```
where `<database name>`, `<DB user>`, `<DB password>`, `<DB address>` and `<DB port>` are respectively your MySQL database name, user, password, address (default: localhost) and port (default: 3306).

Access the site by entering `http://localhost:3000`

## Tested environment
- Operating System: Fedora 30, KDE Plasma Spin
- MySQL installed following instructions from the official Fedora docs: https://docs.fedoraproject.org/en-US/quick-docs/installing-mysql-mariadb/

## Results
The project is incomplete due to time constraints, but the core elements of the game are present. The whiteboard and chat implementations of this project are adapted versions of demos given by Socket.io.
### Initial page and login
For this implementation of the game, the index page lists all registred users and available matches to join. The user should sign up or login with a name before being able to enter a room (A window asking for login will appear if he/she tries to do so).

Upon sending the username, the site automatically creates a new user (and immediately logs in) if the entered name is not found inside the database, or automatically logs in if the entered name is found.

#### Limitations
- The current way names are displayed is a (very rough) draft (doesn't use Bootstrap classes, for example), but it works correctly.
- A page reload will sign out the user, forcing them to login again everytime the page is realoaded.

#### Login/sign up as a normal user or as an administrator
The authentification system is very basic. For the moment, normal users don't have a password, needing only their usernames to login. It's possible to try to login/sign up as an administrator, but it requires a global password stored in-code as a hash. 

For testing purposes: the global administrator password is `Centrale$upelec1`

### Administrators
Currently administrators has the same privileges as a normal user, with the addition of being able to add words into the database (an extra option will appear in the navigation bar).

### Creating a match
Once logged in, a user can create a match (he/she will be the match drawer if done so) by clicking the blue button named "Create a new match". From there he/she should choose a room name and the maximum allowed number of players, which will be then saved in the database. Once finished the match drawer will be redirected to his/her newly created room, being able to draw freely on the whiteboard and also to chat with anyone in the room. A random word from the database list will be chosen and only visible to the host.

#### Limitations
- It isn't possible to erase any written data on the whiteboard at the moment.
- New users entering the room won't see messages and drawings done before he/she joined.
- The room lacks a list of users inside it.

### Joining a match
A logged user can also join a room from the list of available matches (if there are any). Joining one he/she will be able to chat, but cannot edit the whiteboard.
#### Limitations
- Currently, there is no verification of the number of users in a room.
- Also, there is no point system and no winning verification.

## Conclusion
Although the implementation of the game is far from complete, the essential elements of it (i.e. communication, authentication system, creation of rooms, whiteboard and chat, etc.) are functional and most of the total work is done. During the course of doing this project I've learned a lot of JavaScript tools from the beginning (Node.js, Express, Sequelize, Bootstrap, etc.) and even JavaScript itself (I haven't used it much until then), being an excellent way to quickly learn the general environment and the work of a web developer.
