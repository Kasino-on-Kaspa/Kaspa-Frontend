import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LogEntry {
  username: string;
  result: string;
  bet: string;
  payout: string;
  game?: string;
  timestamp: number;
}

interface LogState {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, "timestamp">) => void;
  clearLogs: () => void;
}

const MAX_LOGS = 50; // Maximum number of logs to store

const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) =>
        set((state) => {
          const timestamp = Date.now();
          const newLog = { ...log, timestamp };

          console.log("Attempting to add log:", {
            newLog,
            currentLogsCount: state.logs.length,
            firstExistingLog: state.logs[0],
          });

          // Check if a similar log exists within the last 5 seconds
          const duplicates = state.logs.filter(
            (existingLog) =>
              existingLog.username === log.username &&
              existingLog.bet === log.bet &&
              existingLog.payout === log.payout &&
              timestamp - existingLog.timestamp < 5000, // 5 seconds threshold
          );

          if (duplicates.length > 0) {
            console.log("Duplicate log(s) found:", {
              newLog,
              duplicates: duplicates.map((d) => ({
                username: d.username,
                bet: d.bet,
                payout: d.payout,
                timestamp: d.timestamp,
                age: timestamp - d.timestamp + "ms",
              })),
            });
            return state; // Don't add duplicate log
          }

          const updatedLogs = [newLog, ...state.logs.slice(0, MAX_LOGS - 1)];
          console.log("Adding new log:", {
            newLog,
            totalLogs: updatedLogs.length,
            firstThreeLogs: updatedLogs.slice(0, 3).map((l) => ({
              username: l.username,
              timestamp: l.timestamp,
            })),
          });

          return { logs: updatedLogs };
        }),
      clearLogs: () => {
        console.log("Clearing all logs");
        set({ logs: [] });
      },
    }),
    {
      name: "kasino-logs",
      version: 1, // Add version for better migration handling
    },
  ),
);

export default useLogStore;
