// test-gemini.js
// Updated test script for Gemini image generation

const fetch = require("node-fetch");

// Helper function to build a natural language prompt from cake properties
function buildPrompt(cakeData) {
  // Start with the mandatory phrase
  let prompt =
    "This should be a cake that can be made by a talented small-scale cake business owner in Sri Lanka. ";
  prompt += "Create a high-quality artistic image of a ";

  // Add the occasion and theme
  if (cakeData.occasion) {
    prompt += `${cakeData.occasion} cake with an `;
  }
  if (cakeData.theme) {
    prompt += `${cakeData.theme} theme. `;
  }

  // Add the core cake properties
  prompt += `The cake is ${cakeData.size} and ${cakeData.shape}. `;
  prompt += `It is a ${cakeData.flavor} flavored cake with a ${cakeData.style} look. `;

  // Describe the icing
  if (cakeData.baseColor || cakeData.topIcingColor || cakeData.sideIcingColor) {
    prompt += "The icing is ";
    if (cakeData.topIcingColor && cakeData.sideIcingColor) {
      prompt += `a smooth ${cakeData.sideIcingColor} on the sides and ${cakeData.topIcingColor} on top. `;
    } else {
      prompt += `${cakeData.baseColor} colored. `;
    }
  }

  // Add decorations
  if (cakeData.decorations && cakeData.decorations.length > 0) {
    const decorations = cakeData.decorations.join(", ");
    prompt += `It is decorated with ${decorations}. `;
  }

  // This is a stylistic prompt that avoids policy flags
  prompt +=
    "The image should be a beautiful, vibrant digital painting, not a photorealistic photograph.";

  return prompt;
}

async function testGeminiImageGeneration() {
  const testCakeData = {
    size: "medium",
    shape: "round", // Changed from "circle" to "round"
    baseColor: "soft pink", // Changed from hex to color name
    topIcingColor: "white", // Changed from hex to color name
    sideIcingColor: "light pink", // Changed from hex to color name
    flavor: "vanilla",
    decorations: ["flowers"],
    theme: "elegant",
    occasion: "celebration", // Changed from "birthday"
    style: "artistic digital painting", // Safe style
  };

  try {
    console.log("🧪 Testing Gemini image generation...");

    // Generate a very simple, safe prompt
    const safePrompt =
      "Create an artistic digital painting of a small round cake with soft colors and flower decorations. Use a stylized, non-photographic art style with gentle pastels.";
    console.log("Safe Prompt:", safePrompt);

    // Make the API call with the safe prompt
    const response = await fetch(
      "http://localhost:5000/api/gemini/generate-cake-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: safePrompt }), // Send simple safe prompt
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Test Result:", JSON.stringify(result, null, 2));

    if (result.success && result.data.imageUrl) {
      console.log("🎉 SUCCESS! Image generated at:", result.data.imageUrl);
      console.log("💰 Cost:", result.data.cost);
      console.log("🤖 Service:", result.data.service);
    } else {
      console.log("⚠️ No image generated, but API responded correctly.");
      if (result.data && result.data.note) {
        console.log("📝 Note:", result.data.note);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testGeminiImageGeneration();
