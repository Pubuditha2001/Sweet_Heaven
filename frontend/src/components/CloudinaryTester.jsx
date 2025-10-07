import React, { useState } from "react";
import {
  debugCloudinaryConfig,
  runCloudinaryTest,
} from "../utils/cloudinaryDebug";

export default function CloudinaryTester() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigCheck = () => {
    const config = debugCloudinaryConfig();
    setTestResult({
      type: "config",
      data: config,
      success: !!(config.cloudName && config.uploadPreset),
    });
  };

  const handleUploadTest = async () => {
    setIsLoading(true);
    try {
      await runCloudinaryTest();
      setTestResult({
        type: "upload",
        success: true,
        message: "Upload test completed successfully!",
      });
    } catch (error) {
      setTestResult({
        type: "upload",
        success: false,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #ddd",
        borderRadius: "8px",
        margin: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3>🔧 Cloudinary Configuration Tester</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={handleConfigCheck}
          style={{
            padding: "10px 15px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Check Configuration
        </button>

        <button
          onClick={handleUploadTest}
          disabled={isLoading}
          style={{
            padding: "10px 15px",
            backgroundColor: isLoading ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Testing Upload..." : "Test Upload"}
        </button>
      </div>

      {testResult && (
        <div
          style={{
            padding: "15px",
            backgroundColor: testResult.success ? "#d4edda" : "#f8d7da",
            border: `1px solid ${testResult.success ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: "4px",
            color: testResult.success ? "#155724" : "#721c24",
          }}
        >
          <h4>{testResult.success ? "✅ Success" : "❌ Error"}</h4>

          {testResult.type === "config" && (
            <div>
              <p>Configuration Status:</p>
              <ul>
                <li>
                  Cloud Name:{" "}
                  {testResult.data.cloudName ? "✅ Set" : "❌ Missing"}
                </li>
                <li>
                  Upload Preset:{" "}
                  {testResult.data.uploadPreset ? "✅ Set" : "❌ Missing"}
                </li>
                <li>Environment: {testResult.data.mode}</li>
                <li>Development Mode: {testResult.data.dev ? "Yes" : "No"}</li>
              </ul>
            </div>
          )}

          {testResult.type === "upload" && <p>{testResult.message}</p>}
        </div>
      )}

      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>How to use:</strong>
        </p>
        <ol>
          <li>Click "Check Configuration" to verify environment variables</li>
          <li>Click "Test Upload" to test actual Cloudinary upload</li>
          <li>Check browser console for detailed debug information</li>
        </ol>
        <p>
          <strong>Expected environment variables:</strong>
        </p>
        <ul>
          <li>VITE_CLOUDINARY_CLOUD_NAME</li>
          <li>VITE_CLOUDINARY_UPLOAD_PRESET</li>
        </ul>
      </div>
    </div>
  );
}
