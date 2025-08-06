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
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },

    assignee: {
      name: String,
      email: String,
    },

    dueDate: {
      type: Date,
    },

    type: {
      type: String,
      enum: ["team", "personal"],
      default: "team",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    comments: [
      {
        user: {
          name: String,
          email: String,
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
