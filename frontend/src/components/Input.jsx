import React from "react";

const Input = ({ inputValue, onChangeHandler, addTask, dueDate, onDueDateChange, isEditing, updateTask }) => {
    const onKeyPressHandler = (event) => {
        if (event.key === 'Enter') {
            if (isEditing) {
                updateTask();
            } else {
                addTask();
            }
        }
    };

    return (
        <div className="flex flex-col w-full box-border p-2 space-y-2">
            <input
                type="text"
                name="task"
                onChange={onChangeHandler}
                value={inputValue}
                placeholder="Add new task..."
                onKeyPress={onKeyPressHandler}
                className="w-full bg-white h-10 border rounded box-border p-2"
            />
            <div className="flex">
                <input
                    type="date"
                    name="dueDate"
                    value={dueDate}
                    onChange={onDueDateChange}
                    onKeyPress={onKeyPressHandler}
                    className="bg-gray-600 text-white h-9 p-2 mt-2 border border-white rounded uppercase"
                />
                <button className='btn mt-2 ml-2 shadow-md bg-green-500 text-white p-2 rounded-xl hover:bg-green-800 hover:shadow-inner transition ease-out duration-500' onClick={isEditing ? updateTask : addTask}>
                    {isEditing ? "Update Task" : "Add Task"}
                </button>
            </div>
        </div>
    );
};

export default Input;
