import React, { useState } from "react";

const LocalStorageTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");

  const testLocalStorage = () => {
    try {
      // Test basic localStorage functionality
      const testKey = "test_key";
      const testValue = { message: "Hello World", timestamp: Date.now() };

      // Write test
      localStorage.setItem(testKey, JSON.stringify(testValue));

      // Read test
      const retrieved = localStorage.getItem(testKey);
      const parsed = JSON.parse(retrieved || "{}");

      // Clean up
      localStorage.removeItem(testKey);

      setTestResult(
        `✅ localStorage working: ${parsed.message} at ${new Date(
          parsed.timestamp
        ).toLocaleTimeString()}`
      );

      // Test ambassadors data specifically
      const ambassadorsData = localStorage.getItem("ambassadors");
      console.log("Current ambassadors data:", ambassadorsData);
    } catch (error) {
      setTestResult(`❌ localStorage error: ${error}`);
      console.error("localStorage test failed:", error);
    }
  };

  const clearAmbassadorsData = () => {
    try {
      localStorage.removeItem("ambassadors");
      localStorage.removeItem("editingAmbassador");
      setTestResult("🗑️ Cleared ambassadors data from localStorage");
    } catch (error) {
      setTestResult(`❌ Error clearing data: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2">
        Debug: localStorage Test
      </h3>
      <div className="space-x-2">
        <button
          onClick={testLocalStorage}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Test localStorage
        </button>
        <button
          onClick={clearAmbassadorsData}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear Ambassador Data
        </button>
      </div>
      {testResult && (
        <div className="mt-2 p-2 bg-white rounded text-sm">{testResult}</div>
      )}
    </div>
  );
};

export default LocalStorageTest;
