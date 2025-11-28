"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTaskContract } from "@/hooks/useContract";

const SampleIntegration = () => {
  const { isConnected } = useAccount();
  const [taskContent, setTaskContent] = useState("");
  const [taskIndex, setTaskIndex] = useState("");

  const { data, actions, state } = useTaskContract();

  const handleCreate = async () => {
    if (!taskContent) return;
    await actions.createTask(taskContent);
    setTaskContent("");
  };

  const handleToggle = async () => {
    if (taskIndex === "") return;
    await actions.toggleTask(Number(taskIndex));
  };

  const handleDelete = async () => {
    if (taskIndex === "") return;
    await actions.deleteTask(Number(taskIndex));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-3">Task Contract</h2>
          <p>Please connect your wallet to interact with the contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Task Contract</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <p className="text-xs">Total Tasks</p>
          <p className="text-2xl font-semibold">{data.taskCount}</p>
        </div>
        <div classname="p-4 border rounded-lg">
          <p className="text-xs">Completed</p>
          <p className="text-2xl font-semibold">{data.completedCount}</p>
        </div>
      </div>

      {/* Create */}
      <div className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Task content..."
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleCreate}
          disabled={state.isLoading}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          {state.isLoading ? "Processing..." : "Create Task"}
        </button>
      </div>

      {/* Manage */}
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Task index"
          value={taskIndex}
          onChange={(e) => setTaskIndex(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          onClick={handleToggle}
          disabled={state.isLoading}
          className="w-full p-2 bg-yellow-500 text-black rounded"
        >
          Toggle Complete
        </button>

        <button
          onClick={handleDelete}
          disabled={state.isLoading}
          className="w-full p-2 bg-red-600 text-white rounded"
        >
          Delete Task
        </button>
      </div>

      {/* Hash */}
      {state.hash && (
        <div className="mt-6 p-4 border rounded">
          <p className="text-xs font-mono break-all">{state.hash}</p>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="mt-6 p-4 border border-red-600 bg-red-100 rounded">
          <p className="text-sm text-red-600">{state.error.message}</p>
        </div>
      )}
    </div>
  );
};

export default SampleIntegration;
