const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = user;
  return next();
}

function checksExistsToDos(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: "ID Not Found!" });
  }

  request.todo = todo;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExist = users.some((user) => user.username == username);

  if (usernameAlreadyExist) {
    return response.status(400).json({ error: "User already exists" });
  } else {
    const newUser = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };
    users.push(newUser);
    return response.status(200).send(newUser);
  }
});

app.get("/users", (request, response) => {
  return response.status(201).send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodos = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodos);
  return response.status(201).send(newTodos);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsToDos,
  (request, response) => {
    const { title, deadline } = request.body;
    const { todo } = request;

    todo.title = title;
    todo.deadline = deadline;

    return response.status(201).send(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsToDos,
  (request, response) => {
    const { todo } = request;

    todo.done = true;
    return response.status(201).send(todo);
  }
);
app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsToDos,
  (request, response) => {
    const { user } = request;
    const { todo } = request;

    user.todos.splice(todo, 1);
    return response.status(204).json();
  }
);

module.exports = app;
