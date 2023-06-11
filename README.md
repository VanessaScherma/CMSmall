[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/8AapHqUJ)
# Exam #1: "CMSmall"
## Student: s317904 SCHERMA VANESSA 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- GET `/api/sessions/current`
  - request parameters: credentials for passport authentication
  - response body: user info
  - response status: 200 success, 401 not authenticated

- POST `/api/sessions`
  - request parameters: credentials for passport authentication, content-type application/json
  - request body: credentials
  - response body: user info
  - response status: 201 successful login, 401 wrong credentials

- DELETE `/api/sessions/current`
  - request parameters: credentials for passport authentication
  - response body: none
  - response status: 200 successful logout

- GET `/api/pages`
  - request parameters: none
  - response body: list of all pages
  - response status: 200 success, 500 database error

- POST `/api/pages/:id/contents`
  - request parameters and request body content
  - response body content


## Database Tables

- Table `user` - contains id, email, password, salt, name, admin
- Table `page` - contains id, title, authorId, creationDate, publicationDate
- Table `content` - contains id, type, body, pageId, order

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)
