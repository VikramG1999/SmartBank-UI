export const errMsg = (err) => {
  const data = err.response?.data;
  if (data?.message) return data.message;
  if (!err.response) return "Cannot reach the server. Please check that the backend is running.";
  if (err.response.status === 401) return "Session expired. Please login again.";
  if (err.response.status === 400) return "Please check the values you entered";
  return "Something went wrong";
};

export const money = (v) =>
  v === null || v === undefined
    ? "-"
    : Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const amountRules = {
  required: "Please enter an amount",
  pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter a valid amount (max 2 decimals)" },
  validate: (v) => Number(v) > 0 || "Amount must be greater than 0",
};

// opens the calendar when the user clicks anywhere inside a date or month input
export const openPicker = (e) => {
  try {
    e.target.showPicker();
  } catch (err) {
    // older browsers: the normal behaviour stays
  }
};