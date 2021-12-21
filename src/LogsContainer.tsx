import { Console, Hook, Unhook } from "console-feed";
import { HookedConsole, Message } from "console-feed/lib/definitions/Console";
import React, { useEffect, useState } from "react";

export const LogsContainer = () => {
  const [logs, setLogs] = useState<Message[]>([]);

  // run once!
  useEffect(() => {
    Hook(window.console, (log) => setLogs((currLogs) => [...currLogs, log]), false);
    return () => {
      Unhook(window.console as HookedConsole);
    };
  }, []);

  return (
    <>
      <h4>Console</h4>
      <div className="consoleWrapper">
        <Console
          styles={{
            PADDING: "0.5rem",
          }}
          logs={logs as any}
          variant="dark"
        />
      </div>
      <button
        className="clearConsoleButton"
        onClick={() => {
          setLogs([]);
        }}
      >
        Clear Console
      </button>
    </>
  );
};
