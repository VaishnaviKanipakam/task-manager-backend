const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');

app.use(express.json());
app.use(cors());

let db = null;
const initializeDbAndServer = async() => {
    try{
        db = mysql.createConnection({
        host: "localhost",
        user: "vaishu",
        password: "Bharu@96",
        database: "task_manager_backend",
        insecureAuth : true
        });
        app.listen(3004 , () => {
            console.log("app listening at 3004...")
        })
        db.connect(function(err) {
            if (err) throw err;
            console.log("Conected!")
        })  
    } catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDbAndServer();


// POST Task API
app.post("/tasks", (request, response) => {
    const taskDetails = request.body 
    const {title, description, status, dueDate} = taskDetails
    const create_task_table = `
        CREATE TABLE IF NOT EXISTS  task_manager (
            task_id INTEGER NOT NULL AUTO_INCREMENT,
            title VARCHAR (1000),
            description TEXT(5000),
            status VARCHAR (1000),
            due_date VARCHAR (1000),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (task_id)
        );`;

        db.query(create_task_table, (err, result) => {
            if(err){
                response.status(500)
                return
            }
            
            else if (title !== "" && description !== "" && status !== "" && dueDate !== ""){
            const post_task_details = `
                INSERT INTO
                    task_manager (title, description, status, due_date)
                values (
                        "${title}", "${description}", "${status}", "${dueDate}"
                );`;

                db.query(post_task_details, (err, result) => {
                    if(err){
                        response.status(500).json("Cannot Create Task")
                        return
                    }
                    response.status(200).json("Task Created Successfully")
                })
            }else{
                response.status(500).json("Fill all the Required Fields")
            }
                

        })
    
})


// GET Task API
app.get("/tasks", (request, response) => {
    const get_tasks_query = `
        SELECT 
            *
        FROM
             task_manager ;
    `;

    db.query(get_tasks_query, (err, result) => {
        if(err){
            response.status(500).json("Cannot Get Task")
            return
        }
        response.status(200).json(result)
    })
})


// Edit Task API
app.put("/tasks", (request, response) => {
    const id = request.query.id 
    const editTaskDetails = request.body 
    const {editTitle, editDescription, editStatus, editDueDate} = editTaskDetails

    if (editTitle !== "" && editDescription !== "" && editStatus !== "" && editDueDate !== ""){
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
        if(err){
            response.status(500).json("Cannot Update Task")
            return 
        }
        response.status(200).json("Task Updated SuccessFully")
    })
    }else{
        response.status(500).json("Fill All The Fields")
    }
})


// Delete Task API
app.delete("/tasks", (request, response) => {
    const id = request.query.id 
    const delete_task_query = `
        DELETE FROM
            task_manager
        WHERE 
             task_id = ${id};
    `;

    db.query(delete_task_query, (err, result) => {
        if(err){
            response.status(500).json("Cannot Delete Task")
            return 
        }
        response.status(200).json("Task Deleted Successfully")
    })
})
