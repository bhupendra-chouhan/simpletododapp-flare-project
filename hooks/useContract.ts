"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractABI, contractAddress } from "@/lib/contract";

export interface TaskData {
  id: number;
  content: string;
  completed: boolean;
  timestamp: number;
}

export interface ContractData {
  taskCount: number;
  completedCount: number;
  tasks: TaskData[];
}

export interface ContractState {
  isLoading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  hash: `0x${string}` | undefined;
  error: Error | null;
}

export interface ContractActions {
  createTask: (content: string) => Promise<void>;
  toggleTask: (index: number) => Promise<void>;
  deleteTask: (index: number) => Promise<void>;
}

export const useTaskContract = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);

  const { data: taskCount, refetch: refetchTaskCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getTaskCount",
    query: { enabled: !!address },
  });

  const { data: completedCount, refetch: refetchCompletedCount } =
    useReadContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "getCompletedCount",
      query: { enabled: !!address },
    });

  const { data: allTasks, refetch: refetchTasks } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getTasks",
    query: { enabled: !!address },
  });

  const {
    writeContractAsync,
    data: hash,
    error,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (allTasks) {
      setTasks(
        (allTasks as any[]).map((t) => ({
          id: Number(t.id),
          content: t.content,
          completed: t.completed,
          timestamp: Number(t.timestamp),
        }))
      );
    }
  }, [allTasks]);

  useEffect(() => {
    if (isConfirmed) {
      refetchTaskCount();
      refetchTasks();
      refetchCompletedCount();
    }
  }, [isConfirmed, refetchTaskCount, refetchTasks, refetchCompletedCount]);

  const createTask = async (content: string) => {
    if (!content) return;
    try {
      setIsLoading(true);
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "createTask",
        args: [content],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (index: number) => {
    try {
      setIsLoading(true);
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "toggleTask",
        args: [BigInt(index)],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (index: number) => {
    try {
      setIsLoading(true);
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "deleteTask",
        args: [BigInt(index)],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const data: ContractData = {
    taskCount: taskCount ? Number(taskCount as bigint) : 0,
    completedCount: completedCount ? Number(completedCount as bigint) : 0,
    tasks,
  };

  const actions: ContractActions = { createTask, toggleTask, deleteTask };

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  };

  return { data, actions, state };
};
