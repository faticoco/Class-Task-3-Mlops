import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${apiUrl}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`${apiUrl}/tasks/${editingTask}`, taskData);
        setEditingTask(null);
      } else {
        await axios.post(`${apiUrl}/tasks`, taskData);
      }
      setTaskData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEdit = (task) => {
    setTaskData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setEditingTask(task._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleComplete = async (id, completed) => {
    try {
      await axios.patch(`${apiUrl}/tasks/${id}`, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MLOps Task Manager</h1>
        <p>Organize your course tasks efficiently</p>
      </header>
      <main>
        <div className="form-container">
          <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={taskData.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={taskData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Priority:</label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="submit">
                {editingTask ? "Update Task" : "Add Task"}
              </button>
              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskData({
                      title: "",
                      description: "",
                      priority: "medium",
                      dueDate: "",
                    });
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="tasks-container">
          <h2>Your Tasks</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add your first task above!</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-card ${
                    task.completed ? "task-completed" : ""
                  }`}
                >
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span
                      className={`priority-badge ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className="due-date">
                      Due: {formatDate(task.dueDate)}
                    </span>
                    <span className="created-date">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => handleComplete(task._id, task.completed)}
                      className={
                        task.completed ? "undo-button" : "complete-button"
                      }
                    >
                      {task.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => handleEdit(task)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer>
        <p>MLOps Course Task Manager - Keep track of your assignments</p>
      </footer>
    </div>
  );
}

export default App;
