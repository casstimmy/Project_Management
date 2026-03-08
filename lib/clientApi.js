export async function readApiError(response, fallbackMessage = "Request failed") {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const details = Array.isArray(payload?.details) ? payload.details : [];
  const fieldErrors = details.reduce((acc, item) => {
    if (item?.field && !acc[item.field]) {
      acc[item.field] = item.message || fallbackMessage;
    }
    return acc;
  }, {});

  return {
    message: payload?.error || fallbackMessage,
    details,
    fieldErrors,
  };
}

export function toOptionalObjectId(value) {
  return value ? value : undefined;
}

export function toOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toOptionalDate(value) {
  return value ? value : undefined;
}
