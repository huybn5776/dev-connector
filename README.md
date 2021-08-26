# Dev Connector

A simple [MREN Stack](https://www.mongodb.com/mern-stack) practise project 

# Features

- Create user, profile, user experiences/educations
- Listing all users
- Create posts, comments and likes.

# Strucle

- core: interface and utils that share between client and server project
- client: react project
- server: express project
- root directory: eslint, prettier config share among whole project

# Packages used

- client: 
  - Http request: axios
  - Styling: scss, css module, clsx
  - State managment: redux, redux-observable, typesafe-actions, reselect
  - Validation: yup
- server:
  - Routing: routing-controller
  - Data model transfer: class-transformer, AutoMapper TypeScript
  - Validation: class-validator
  - E2E testing: jest, supertest

---

Original idea from [Udemy course](https://www.udemy.com/course/mern-stack-front-to-back/)