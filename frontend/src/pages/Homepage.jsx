import React, { useState, useEffect } from 'react';
import Input from '../components/Input.jsx';
import DeleteTask from './DeleteTask.jsx';
import { useHttpClient } from '../shared/hooks/http-hook.jsx';
import { v4 as uuidv4 } from 'uuid';

const Homepage = () => {
  const { sendRequest } = useHttpClient();

  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const token = userData?.token;
  const userId = userData?.userId;

  // Sync local tasks to server and prevent duplication
  const syncLocalTasks = async () => {
    if (!token) return; // Exit if not logged in

    const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];

    if (localTasks.length === 0) return; // Exit if no local tasks

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch server tasks');
      }

      const responseData = await response.json();
      const serverTasks = responseData.tasks;

      // Filter out tasks that already exist on the server (compare IDs)
      const newLocalTasks = localTasks.filter(
        (localTask) =>
          !serverTasks.some((serverTask) => serverTask._id === localTask._id)
      );

      // Add new local tasks to the server
      for (const task of newLocalTasks) {
        try {
          const responseData = await sendRequest(
            'http://localhost:5000/api/tasks',
            'POST',
            JSON.stringify({
              description: task.description,
              date: task.date,
              completed: task.completed,
            }),
            {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            }
          );
          // Store the server-generated ID in the local task
          task._id = responseData.task._id; 
          // Add the updated task to the state and local storage
          setTasks((prevTasks) => [...prevTasks, task]); 
          const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];
          localTasks.push(task);
          localStorage.setItem('localTasks', JSON.stringify(localTasks));
        } catch (error) {
          console.error('Failed to sync local tasks', error);
        }
      }

      // Clear local tasks after syncing
      localStorage.removeItem('localTasks');
    } catch (error) {
      console.error('Error syncing local tasks', error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) {
        const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];
        setTasks(localTasks); // Load local tasks if not logged in
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/tasks/user/${userId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const responseData = await response.json();
        setTasks(responseData.tasks);
        await syncLocalTasks(); // Sync local tasks after fetching
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [sendRequest, userId, token]);

  const onChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const onDueDateChange = (event) => {
    setDueDate(event.target.value);
  };

  const addTask = async () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        description: inputValue,
        date: dueDate || null,
        // completed: false, // Default completed to false
      };

      if (token) {
        // User is logged in, so send a request to the server
        try {
          const responseData = await sendRequest(
            'http://localhost:5000/api/tasks',
            'POST',
            JSON.stringify(newTask),
            {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            }
          );
          setTasks(prevTasks => [...prevTasks, responseData.task]);
        } catch (error) {
          console.error('Failed to add task', error);
        }
      } else {
        // User is not logged in, add task to local state and localStorage
        const newLocalTask = {
          ...newTask,
          _id: uuidv4(),
        };
        const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];

        localTasks.push(newLocalTask);
        localStorage.setItem('localTasks', JSON.stringify(localTasks));
        setTasks(prevTasks => [...prevTasks, newLocalTask]);
      }

      setInputValue('');
      setDueDate('');
    }
  };

  const handleEdit = (task) => {
    setInputValue(task.description);
    setDueDate(task.date || '');
    setEditTaskId(task._id);
  };

  const cancelEdit = () => {
    setInputValue('');
    setDueDate('');
    setEditTaskId(null);
  };

  const updateTaskHandler = async () => {
    if (inputValue.trim() !== '') {
      const updatedTask = {
        description: inputValue,
        date: dueDate || null,
      };

      if (token) {
        // User is logged in, update task on server
        try {
          await sendRequest(
            `http://localhost:5000/api/tasks/${editTaskId}`,
            'PATCH',
            JSON.stringify(updatedTask),
            {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
            }
          );
          setTasks(prevTasks => prevTasks.map(task =>
            task._id === editTaskId ? { ...task, ...updatedTask } : task
          ));
        } catch (error) {
          console.error('Failed to update task', error);
        }
      } else {
        // User is not logged in, update task locally
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === editTaskId ? { ...task, ...updatedTask } : task
        ));
      }

      setEditTaskId(null);
      setInputValue('');
      setDueDate('');
    }
  };

  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    if (token) {
      // User is logged in, delete task on server
      try {
        await sendRequest(
          `http://localhost:5000/api/tasks/${taskToDelete._id}`,
          'DELETE',
          null,
          {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          }
        );
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskToDelete._id));
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    } else {
      // User is not logged in, delete task locally
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskToDelete._id));
      // Also remove from localStorage if needed
      const localTasks = JSON.parse(localStorage.getItem('localTasks')) || [];
      localStorage.setItem('localTasks', JSON.stringify(localTasks.filter(task => task._id !== taskToDelete._id)));
    }

    setTaskToDelete(null);
    setShowDeleteModal(false);
  };

  const toggleTaskCompletion = async (taskId) => {
    const taskToToggle = tasks.find(task => task._id === taskId);
    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };

    if (token) {
      // User is logged in, update task completion on server
      try {
        await sendRequest(
          `http://localhost:5000/api/tasks/${taskId}`,
          'PATCH',
          JSON.stringify(updatedTask),
          {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          }
        );
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === taskId ? updatedTask : task
        ));
      } catch (error) {
        console.error('Failed to toggle task completion', error);
      }
    } else {
      // User is not logged in, update task completion locally
      setTasks(prevTasks => prevTasks.map(task =>
        task._id === taskId ? updatedTask : task
      ));
    }
  };

  if (loading) {
    return <p className='text-8xl'>Loading...</p>; // loading state
  }

  if (error) {
    return <p className='text-8xl'>Error: {error}</p>; // error handling
  }

  return (
    <div className="w-full">
      <Input
        inputValue={inputValue}
        onChangeHandler={onChangeHandler}
        addTask={addTask}
        dueDate={dueDate}
        onDueDateChange={onDueDateChange}
        isEditing={editTaskId !== null}
        updateTask={updateTaskHandler}
      />
      <div className="flex w-full">
        <ul className="w-full flex flex-col">
          {tasks.map((task) => (
            <li key={task._id} className="w-full mb-2 pr-2 pl-2 animate-fadeInUp">
              {editTaskId === task._id ? (
                <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={onChangeHandler}
                    onKeyPress={(event) => event.key === 'Enter' && updateTaskHandler()}
                    className="w-9/12 bg-white h-10 border rounded box-border p-2"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={onDueDateChange}
                    onKeyPress={(event) => event.key === 'Enter' && updateTaskHandler()}
                    className="bg-gray-600 h-10 text-white p-2 mt-2 border border-white rounded uppercase"
                  />
                  <div className="flex">
                    <button className="btn shadow-md bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 self-end mr-2" onClick={updateTaskHandler}>Update</button>
                    <button className="btn shadow-md bg-red-500 text-white p-2 rounded-full hover:bg-red-600 self-end" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <label className="bg-white flex justify-between items-center w-full p-2 border rounded shadow-sm h-12">
                  <input type="checkbox" className="mr-2 h-4 w-4 text-white" checked={task.completed} onChange={() => toggleTaskCompletion(task._id)} />
                  <span className={`flex-1 ${task.completed ? 'line-through' : ''}`}>{task.description}</span>
                  {task.date && <span className="flex-1 text-right mr-4 uppercase font-extralight text-sm"> <span className="font-medium text-zinc-500">Due Date: </span>{task.date}</span>}
                  <div className="flex space-x-2">
                    <button className="btn shadow-md rounded-full p-2 px-3 bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => handleEdit(task)}>Edit</button>
                    <button className="btn rounded-full shadow-md bg-red-500 text-white p-2 hover:bg-red-600" onClick={() => confirmDelete(task)}>Delete</button>
                  </div>
                </label>
              )}
            </li>
          ))}
        </ul>
      </div>
      <DeleteTask
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Homepage;