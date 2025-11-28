// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToDo {
    struct Task {
        uint id;
        string content;
        bool completed;
        uint timestamp;
    }
    
    mapping(address => Task[]) private userTasks;
    mapping(address => uint) private taskCounter;
    
    event TaskCreated(address indexed user, uint taskId, string content);
    event TaskCompleted(address indexed user, uint taskId);
    event TaskDeleted(address indexed user, uint taskId);
    
    // Create a new task
    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task content cannot be empty");
        
        uint taskId = taskCounter[msg.sender];
        
        userTasks[msg.sender].push(Task({
            id: taskId,
            content: _content,
            completed: false,
            timestamp: block.timestamp
        }));
        
        taskCounter[msg.sender]++;
        
        emit TaskCreated(msg.sender, taskId, _content);
    }
    
    // Toggle task completion status
    function toggleTask(uint _index) public {
        require(_index < userTasks[msg.sender].length, "Task does not exist");
        
        userTasks[msg.sender][_index].completed = !userTasks[msg.sender][_index].completed;
        
        emit TaskCompleted(msg.sender, userTasks[msg.sender][_index].id);
    }
    
    // Delete a task
    function deleteTask(uint _index) public {
        require(_index < userTasks[msg.sender].length, "Task does not exist");
        
        uint taskId = userTasks[msg.sender][_index].id;
        
        // Move the last element to the deleted position and pop
        userTasks[msg.sender][_index] = userTasks[msg.sender][userTasks[msg.sender].length - 1];
        userTasks[msg.sender].pop();
        
        emit TaskDeleted(msg.sender, taskId);
    }
    
    // Get all tasks for the caller
    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
    
    // Get a specific task by index
    function getTask(uint _index) public view returns (Task memory) {
        require(_index < userTasks[msg.sender].length, "Task does not exist");
        return userTasks[msg.sender][_index];
    }
    
    // Get total number of tasks
    function getTaskCount() public view returns (uint) {
        return userTasks[msg.sender].length;
    }
    
    // Get number of completed tasks
    function getCompletedCount() public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userTasks[msg.sender].length; i++) {
            if (userTasks[msg.sender][i].completed) {
                count++;
            }
        }
        return count;
    }
}