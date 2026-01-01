import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STATUSES = ["todo", "in-progress", "done"];

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [theme, setTheme] = useState("light"); // "light" or "dark"
  const [priority, setPriority] = useState("medium");
  const [view, setView] = useState("board"); // "board" | "timeline"

  useEffect(() => {
    const saved = localStorage.getItem("task-board-tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    const savedTheme = localStorage.getItem("task-board-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("task-board-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("task-board-theme", theme);
  }, [theme]);

  function handleAddTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      status: "todo",
      priority,
      justAdded: true,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDescription("");
    setPriority("medium");

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === newTask.id ? { ...task, justAdded: false } : task
        )
      );
    }, 250);
  }

  function handleStatusChange(id, newStatus) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function tasksForColumn(status) {
    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      return task.status === status;
    });
  }

  const isLight = theme === "light";

  const pageText = isLight ? "#402437" : "#FCE7F3";
  const pageBackground = isLight ? "#FFEAF0" : "#1F1020";
  const cardBackground = isLight ? "#FFE4EC" : "#2D1630";
  const cardBorder = isLight ? "#F9C2D0" : "#4B234F";
  const taskBackground = isLight ? "#FFFFFF" : "#3B1E3F";
  const taskBorder = isLight ? "#FDD6DF" : "#5B2A61";
  const subtleText = isLight ? "#A86A83" : "#E5B3CB";
  const descriptionText = isLight ? "#7A4C63" : "#F9D9E7";
  const buttonBg = isLight ? "#FF9AB5" : "#E879F9";
  const buttonText = isLight ? "#402437" : "#1F1020";
  const inputBorder = cardBorder;

  function reorderWithinColumn(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result) {
    const { destination, source } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus && source.index === destination.index) {
      return;
    }

    setTasks((prev) => {
      const sourceTasks = prev.filter((t) => t.status === sourceStatus);
      const otherTasks = prev.filter(
        (t) => t.status !== sourceStatus && t.status !== destStatus
      );
      const destTasks =
        sourceStatus === destStatus
          ? sourceTasks
          : prev.filter((t) => t.status === destStatus);

      if (sourceStatus === destStatus) {
        const reordered = reorderWithinColumn(
          sourceTasks,
          source.index,
          destination.index
        );
        return [...otherTasks, ...reordered];
      } else {
        const movingTask = sourceTasks[source.index];
        const newSourceTasks = Array.from(sourceTasks);
        newSourceTasks.splice(source.index, 1);

        const newDestTasks = Array.from(destTasks);
        newDestTasks.splice(destination.index, 0, {
          ...movingTask,
          status: destStatus,
        });

        return [...otherTasks, ...newSourceTasks, ...newDestTasks];
      }
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        color: pageText,
        backgroundColor: pageBackground,
        transition: "background-color 0.25s ease, color 0.25s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Top bar: title + theme toggle */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 600 }}>Task Board</h1>
        <button
          onClick={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          style={{
            width: 32,
            height: 32,
            borderRadius: "999px",
            border: "1px solid " + cardBorder,
            background: "transparent",
            color: pageText,
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        >
          {isLight ? "🌙" : "☀️"}
        </button>
      </div>

      {/* View tabs */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          gap: 8,
          marginBottom: 12,
          fontSize: "13px",
        }}
      >
        <button
          onClick={() => setView("board")}
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid " + cardBorder,
            background: view === "board" ? buttonBg : "transparent",
            color: view === "board" ? buttonText : pageText,
            cursor: "pointer",
            fontWeight: view === "board" ? 600 : 500,
            fontSize: "13px",
          }}
        >
          Board
        </button>
        <button
          onClick={() => setView("timeline")}
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid " + cardBorder,
            background: view === "timeline" ? buttonBg : "transparent",
            color: view === "timeline" ? buttonText : pageText,
            cursor: "pointer",
            fontWeight: view === "timeline" ? 600 : 500,
            fontSize: "13px",
          }}
        >
          Timeline
        </button>
      </div>

      {/* Centered Add Task card (show in both views) */}
      <form
        onSubmit={handleAddTask}
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "24px",
          padding: "16px",
          background: cardBackground,
          borderRadius: "16px",
          border: "1px solid " + cardBorder,
          boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
          transform: "translateY(0)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,0.22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.16)";
        }}
      >
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid " + inputBorder,
            background: taskBackground,
            color: pageText,
            fontSize: "14px",
          }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid " + inputBorder,
            background: taskBackground,
            color: pageText,
            fontSize: "14px",
          }}
        />

        {/* Priority select */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "8px",
            fontSize: "12px",
            alignItems: "center",
          }}
        >
          <span style={{ color: subtleText }}>Priority:</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: "999px",
              border: "1px solid " + inputBorder,
              background: taskBackground,
              color: pageText,
              fontSize: "12px",
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            padding: "9px 12px",
            borderRadius: "999px",
            border: "none",
            background: buttonBg,
            color: buttonText,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
            alignSelf: "flex-end",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 6px 14px rgba(0,0,0,0.24)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 10px rgba(0,0,0,0.18)";
          }}
        >
          Add Task
        </button>
      </form>

      {/* Main content: Board or Timeline */}
      {view === "board" ? (
        <div
          style={{
            width: "100%",
            maxWidth: 960,
          }}
        >
          {/* Filter */}
          <div style={{ marginBottom: "16px", fontSize: "14px" }}>
            <span style={{ marginRight: "8px" }}>Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid " + cardBorder,
                background: taskBackground,
                color: pageText,
                fontSize: "13px",
              }}
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Columns with DragDropContext */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              {STATUSES.map((statusKey) => {
                const columnTasks = tasksForColumn(statusKey);
                return (
                  <Droppable key={statusKey} droppableId={statusKey}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          background: cardBackground,
                          borderRadius: "16px",
                          padding: "10px",
                          border: "1px solid " + cardBorder,
                          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                          transition: "transform 0.15s ease",
                          minHeight: 80,
                        }}
                      >
                        <h2
                          style={{
                            fontSize: "16px",
                            marginBottom: "6px",
                            fontWeight: 600,
                          }}
                        >
                          {STATUS_LABELS[statusKey]} ({columnTasks.length})
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            fontSize: "13px",
                          }}
                        >
                          {columnTasks.length === 0 && (
                            <p
                              style={{
                                fontSize: "12px",
                                color: subtleText,
                                lineHeight: 1.4,
                              }}
                            >
                              {statusKey === "todo" &&
                                "📋 Nothing planned yet. Add your first task!"}
                              {statusKey === "in-progress" &&
                                "⚙️ No work in progress. Move something from To Do."}
                              {statusKey === "done" &&
                                "✅ Nothing done yet. You’ve got this!"}
                            </p>
                          )}

                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(dragProvided, snapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  style={{
                                    padding: "8px",
                                    borderRadius: "10px",
                                    background: taskBackground,
                                    border: "1px solid " + taskBorder,
                                    transform: task.justAdded
                                      ? "scale(0.96)"
                                      : "scale(1)",
                                    opacity: task.justAdded ? 0 : 1,
                                    boxShadow: snapshot.isDragging
                                      ? "0 10px 24px rgba(0,0,0,0.3)"
                                      : "none",
                                    transition:
                                      "transform 0.18s ease-out, box-shadow 0.15s ease, opacity 0.18s ease-out",
                                    ...dragProvided.draggableProps.style,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginBottom: "4px",
                                      gap: "8px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        flex: 1,
                                      }}
                                    >
                                      <h3
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: 600,
                                          color: pageText,
                                        }}
                                      >
                                        {task.title}
                                      </h3>
                                      {/* priority chip */}
                                      <span
                                        style={{
                                          alignSelf: "flex-start",
                                          padding: "2px 8px",
                                          borderRadius: "999px",
                                          fontSize: "11px",
                                          fontWeight: 500,
                                          background:
                                            task.priority === "high"
                                              ? "#FECACA"
                                              : task.priority === "medium"
                                              ? "#FDE68A"
                                              : "#BBF7D0",
                                          color:
                                            task.priority === "high"
                                              ? "#7F1D1D"
                                              : task.priority === "medium"
                                              ? "#78350F"
                                              : "#065F46",
                                        }}
                                      >
                                        {task.priority === "high"
                                          ? "High"
                                          : task.priority === "medium"
                                          ? "Medium"
                                          : "Low"}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleDelete(task.id)}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#FCA5A5",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  {task.description && (
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        color: descriptionText,
                                        marginBottom: "6px",
                                      }}
                                    >
                                      {task.description}
                                    </p>
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      alignItems: "center",
                                      marginTop: "2px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: subtleText,
                                        minWidth: 52,
                                      }}
                                    >
                                      Move to:
                                    </span>
                                    <select
                                      value={task.status}
                                      onChange={(e) =>
                                        handleStatusChange(
                                          task.id,
                                          e.target.value
                                        )
                                      }
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "999px",
                                        border: "1px solid " + cardBorder,
                                        background: taskBackground,
                                        color: pageText,
                                        fontSize: "12px",
                                        flex: 1,
                                      }}
                                    >
                                      {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          {STATUS_LABELS[s]}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      ) : (
        // TIMELINE VIEW
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontSize: "13px",
          }}
        >
          {(() => {
            const now = new Date();
            const todayString = now.toDateString();

            const tasksToday = tasks.filter((t) => {
              if (!t.createdAt) return false;
              return new Date(t.createdAt).toDateString() === todayString;
            });

            const doneToday = tasksToday.filter((t) => t.status === "done");
            const activeToday = tasksToday.filter((t) => t.status !== "done");

            const doneOthers = tasks.filter((t) => {
              if (!t.createdAt) return false;
              return (
                new Date(t.createdAt).toDateString() !== todayString &&
                t.status === "done"
              );
            });

            return (
              <>
                {/* Today - Active */}
                <section
                  style={{
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: cardBackground,
                    border: "1px solid " + cardBorder,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Today&apos;s focus
                  </h2>
                  {activeToday.length === 0 ? (
                    <p style={{ fontSize: "12px", color: subtleText }}>
                      🌤 Nothing planned for today yet.
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {activeToday.map((task) => (
                        <li
                          key={task.id}
                          style={{
                            padding: "6px 8px",
                            borderRadius: "10px",
                            background: taskBackground,
                            border: "1px solid " + taskBorder,
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: pageText,
                              }}
                            >
                              {task.title}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: subtleText,
                              }}
                            >
                              {STATUS_LABELS[task.status]}
                            </span>
                          </div>
                          {task.description && (
                            <p
                              style={{
                                fontSize: "12px",
                                color: descriptionText,
                                marginTop: 2,
                              }}
                            >
                              {task.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Today - Completed */}
                <section
                  style={{
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: cardBackground,
                    border: "1px solid " + cardBorder,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Completed today
                  </h2>
                  {doneToday.length === 0 ? (
                    <p style={{ fontSize: "12px", color: subtleText }}>
                      ✅ Nothing done yet. You&apos;ve got this!
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {doneToday.map((task) => (
                        <li
                          key={task.id}
                          style={{
                            padding: "6px 8px",
                            borderRadius: "10px",
                            background: taskBackground,
                            border: "1px solid " + taskBorder,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: pageText,
                            }}
                          >
                            {task.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Earlier completed */}
                <section
                  style={{
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: cardBackground,
                    border: "1px solid " + cardBorder,
                    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Completed earlier
                  </h2>
                  {doneOthers.length === 0 ? (
                    <p style={{ fontSize: "12px", color: subtleText }}>
                      📅 No older completed tasks yet.
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {doneOthers.map((task) => (
                        <li
                          key={task.id}
                          style={{
                            padding: "6px 8px",
                            borderRadius: "10px",
                            background: taskBackground,
                            border: "1px solid " + taskBorder,
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: pageText,
                              }}
                            >
                              {task.title}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: subtleText,
                              }}
                            >
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default App;
