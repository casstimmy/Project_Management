import mongoose, { Schema, models } from "mongoose";

const TaskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    status: {
      type: String,
      enum: ["todo", "inprogress", "review", "blocked", "done"],
      default: "todo",
    },

    assignee: {
      name: String,
      email: String,
      avatar: String, // 👤 helps display in UI
    },

    startDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    duration: Number, // auto-calc from start & due dates if needed

    type: {
      type: String,
      enum: ["task", "milestone", "phase"],
      default: "task",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    progress: {
      type: Number, // 0–100
      default: 0,
    },

    styles: {
      progressColor: String,
      progressSelectedColor: String,
      barColor: String,
    },

    comments: [
      {
        user: {
          name: String,
          email: String,
          avatar: String,
        },
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default models.Task || mongoose.model("Task", TaskSchema);
