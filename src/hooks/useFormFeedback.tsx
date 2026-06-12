import { useState } from "react";

export function useFormFeedback() {
  const [error, setError] =
    useState("");

  function clearError() {
    setError("");
  }

  return {
    error,
    setError,
    clearError,
  };
}