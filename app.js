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
  const { status, priority } = request.query;
  const get_tasks_query = `
        SELECT 
            *
        FROM
             tasks_table 
        WHERE
            1=1
        ORDER BY due_date ASC;
    `;

  if (priority) {
    get_tasks_query += `AND priority = ?`;
  }

  if (status) {
    get_tasks_query += `AND status = ?`;
  }

  const values = [];
  if (status) values.push(status);
  if (priority) values.push(priority);

  db.query(get_tasks_query, values, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Get Task");
      return;
    }
    response.status(200).json(result);
  });
});

// Edit Task API
app.patch("/edit_tasks", (request, response) => {
  const taskId = request.query.task_id;
  const editTaskDetails = request.body;
  const { editPriority, editStatus } = editTaskDetails;

  const edit_task_query = `
    UPDATE tasks_table 
    SET
        priority = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        task_id = ?;`;
  db.query(
    edit_task_query,
    [editPriority, editStatus, taskId],
    (err, resut) => {
      if (err) {
        response.status(500).json("Cannot Update Task");
        return;
      }
      response.status(200).json("Task Updated SuccessFully");
    }
  );
});

// Delete Task API
app.delete("/tasks", (request, response) => {
  const taskId = request.query.task_id;
  const delete_task_query = `
        DELETE FROM
            tasks_table 
        WHERE 
             task_id = ${taskId};
    `;

  db.query(delete_task_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Delete Task");
      return;
    }
    response.status(200).json("Task Deleted Successfully");
  });
});

// Get Insights API
app.get("/get_insights", (request, response) => {
  const total_open_query = `
        SELECT 
            COUNT(*) AS totalOpen
        FROM 
            tasks_table
        WHERE status = "open" ;`;

    
        const priority_query = `
             SELECT priority, COUNT(*) as priorityDistribution
            FROM  tasks_table
            GROUP BY priority
            ORDER BY priorityDistribution ASC;
        `;

        const due_soon_query = `
            SELECT COUNT(*) AS dueSoonCount 
            FROM tasks_table
            WHERE due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY);
        `
       

      

  db.query(total_open_query, (err, totalOpenCountResult) => {
    if(err){
        response.status(500).json("Cannot Fetch Open Count");
    console.log("191", err)
    return
    }

    db.query(priority_query, (err2, priorityDistributionResult) => {
        if(err2) {
            response.status(500).json("Cannot Fetch Priority distribution");
        console.log("193", err2);
            return 
        } 
        db.query(due_soon_query, (err3, dueSoonCountResult) => {
            if(err3){
                response.status(500).json("Cannot Get Due Soon Count");
            console.log("197", err3);
            return 
            } 

            response.status(200).json({
                totalOpenCount: totalOpenCountResult[0].totalOpen,
                priorityDistribution: priorityDistributionResult,
                dueSoonCount : dueSoonCountResult  
            })
            console.log("202", totalOpenCountResult, priorityDistributionResult, dueSoonCountResult);
        })
    })
  })
});
