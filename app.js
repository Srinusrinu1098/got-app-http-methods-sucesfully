const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const dbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server successfully running :http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db Error:${e.message}`);
    process.exit(1);
  }
};

dbToServer();

// get

const checkStatusAndPriority = (request) => {
  return request.priority !== undefined && request.status !== undefined;
};
const checkStatusAndPriority1 = (request) => {
  return request.priority !== undefined;
};
const checkStatusAndPriority2 = (request) => {
  return request.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getQuery = null;
  switch (true) {
    case checkStatusAndPriority(request.query):
      getQuery = `
            SELECT * FROM todo WHERE priority ='${priority}' AND status = '${status}' AND todo LIKE '%${search_q}%' ;`;
      break;
    case checkStatusAndPriority1(request.query):
      getQuery = `
            SELECT * FROM todo WHERE priority ='${priority}';`;
      break;
    case checkStatusAndPriority2(request.query):
      getQuery = `
            SELECT * FROM todo WHERE status = '${status}';`;
      break;
    default:
      getQuery = `
            SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});

// get id

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQueryWithId = `
    SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(getQueryWithId);
  response.send(dbResponse);
});

//post
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
     INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//put

const checkStatus = (dbObject) => {
  return dbObject.status !== undefined;
};
const checkStatus1 = (dbObject) => {
  return dbObject.todo !== undefined;
};
const checkStatus2 = (dbObject) => {
  return dbObject.priority !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { priority = "", status = "", todo = "" } = request.body;
  let putQuery = null;
  let dbResponse = null;
  switch (true) {
    case checkStatus(request.body):
      putQuery = `
            UPDATE todo SET status = '${status}' where id = ${todoId};`;
      dbResponse = await db.run(putQuery);
      response.send("Status Updated");
      break;
    case checkStatus1(request.body):
      putQuery = `
            UPDATE todo SET todo = '${todo}' where id = ${todoId};`;
      dbResponse = await db.run(putQuery);
      response.send("Todo Updated");
      break;
    case checkStatus2(request.body):
      putQuery = `
            UPDATE todo SET priority = '${priority}' where id = ${todoId};`;
      dbResponse = await db.run(putQuery);
      response.send("Priority Updated");
      break;

    default:
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQueryWithId = `
    DELETE FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.run(getQueryWithId);
  response.send("Todo Deleted");
});

module.exports = app;
