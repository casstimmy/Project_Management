function formatPath(path = "") {
  return path
    .split(".")
    .map((part) => part.replace(/([A-Z])/g, " $1"))
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildValidationDetails(error) {
  if (!error?.errors) return [];

  return Object.values(error.errors).map((issue) => ({
    field: issue.path || "",
    message: issue.message || "Invalid value",
    kind: issue.kind || "validation",
  }));
}

export function buildApiError(error, fallbackMessage = "Request failed") {
  if (error?.name === "ValidationError") {
    const details = buildValidationDetails(error);
    return {
      status: 400,
      body: {
        error: details[0]?.message || fallbackMessage,
        details,
      },
    };
  }

  if (error?.name === "CastError") {
    return {
      status: 400,
      body: {
        error: `${formatPath(error.path)} is invalid`,
        details: [
          {
            field: error.path || "",
            message: `${formatPath(error.path)} is invalid`,
            kind: "cast",
          },
        ],
      },
    };
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return {
      status: 409,
      body: {
        error: `${formatPath(field)} already exists`,
        details: [
          {
            field,
            message: `${formatPath(field)} already exists`,
            kind: "duplicate",
          },
        ],
      },
    };
  }

  return {
    status: 500,
    body: { error: fallbackMessage },
  };
}

export function sendApiError(res, error, fallbackMessage = "Request failed") {
  const { status, body } = buildApiError(error, fallbackMessage);
  return res.status(status).json(body);
}
