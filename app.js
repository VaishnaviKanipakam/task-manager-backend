const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

app.use(express.json());
app.use(cors());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = mysql.createConnection({
      host: "localhost",
      user: "vaishu",
      password: "Bharu@96",
      database: "task_manager_backend",
      insecureAuth: true,
    });
    const port = 3004;
    app.listen(port, () => {
      console.log(`app listening at ${port}...`);
    });
    db.connect(function (err) {
      if (err) throw err;
      console.log("Conected!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// POST Task API
app.post("/tasks", (request, response) => {
  const taskDetails = request.body;
  const { title, description, priority, dueDate, status } = taskDetails;
  const create_task_table = `
        CREATE TABLE IF NOT EXISTS  tasks_table (
            task_id INTEGER NOT NULL AUTO_INCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
            due_date TEXT NOT NULL,
            status Enum('Open', 'In Progress', 'Done') NOT NULL DEFAULT 'Open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (task_id)
        );`;

  db.query(create_task_table, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Create Table");
      console.log("56", err);
      return;
    }

    const post_task_details = `
                INSERT INTO
                    tasks_table (title, description, priority, due_date, status)
                values (
                        ?, ?, ?, ?, ?
                );`;

    db.query(
      post_task_details,
      [title, description, priority, dueDate, status],
      (err, result) => {
        if (err) {
          response.status(500).json("Cannot Add Task");
          console.log("73", err);
          return;
        }
        response.status(200).json("Task Created Successfully");
        console.log("77", result);
      }
    );
  });
});

// GET Task API
app.get("/get_tasks", (request, response) => {
  const get_tasks_query = `
        SELECT 
            *
        FROM
             tasks_table 
        ORDER BY due_date ASC;
    `;

  db.query(get_tasks_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Get Task");
      return;
    }
    response.status(200).json(result);
  });
});

// Edit Task API
app.put("/tasks", (request, response) => {
  const id = request.query.id;
  const editTaskDetails = request.body;
  const { editTitle, editDescription, editStatus, editDueDate } =
    editTaskDetails;

  if (
    editTitle !== "" &&
    editDescription !== "" &&
    editStatus !== "" &&
    editDueDate !== ""
  ) {
    const edit_task_query = `
    UPDATE task_manager
    SET
        title = "${editTitle}",
        description = "${editDescription}",
        status = "${editStatus}",
        due_date = "${editDueDate}",
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        task_id = ${id};

    `;
    db.query(edit_task_query, (err, resut) => {
      if (err) {
        response.status(500).json("Cannot Update Task");
        return;
      }
      response.status(200).json("Task Updated SuccessFully");
    });
  } else {
    response.status(500).json("Fill All The Fields");
  }
});

// Delete Task API
app.delete("/tasks", (request, response) => {
  const id = request.query.id;
  const delete_task_query = `
        DELETE FROM
            task_manager
        WHERE 
             task_id = ${id};
    `;

  db.query(delete_task_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Delete Task");
      return;
    }
    response.status(200).json("Task Deleted Successfully");
  });
});
