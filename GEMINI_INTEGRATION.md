# Gemini API Integration for Custom Cake Designer

## Overview

This implementation integrates Google's Gemini AI into the Sweet Heaven cake designer to generate intelligent prompts for realistic cake images based on user selections.

## Architecture

### Backend Components

#### 1. Environment Configuration

```bash
# Add to backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. API Endpoint

- **Route**: `POST /api/gemini/generate-cake-image`
- **Controller**: `controllers/geminiController.js`
- **Service**: `utils/geminiService.js`

#### 3. Request Format

```json
{
  "size": "medium",
  "shape": "circle",
  "baseColor": "#f5d0e6",
  "topIcingColor": "#ffffff",
  "sideIcingColor": "#ffc0cb",
  "flavor": "vanilla",
  "decorations": ["flowers", "pearls"],
  "theme": "elegant",
  "occasion": "birthday",
  "customText": "Happy Birthday",
  "style": "realistic"
}
```

#### 4. Response Format

```json
{
  "success": true,
  "data": {
    "imageUrl": null,
    "enhancedPrompt": "Create a realistic photograph of a beautiful...",
    "originalPrompt": "Create a realistic photograph of a beautiful...",
    "generatedAt": "2025-09-16T...",
    "parameters": {...},
    "note": "Enhanced prompt generated. Image generation will be available when integrated with image generation service."
  }
}
```

### Frontend Components

#### 1. API Client

- **File**: `frontend/src/api/gemini.js`
- **Functions**:
  - `generateCakeImage(cakeData)`: Calls the backend API
  - `transformCakeDataForAPI(cakeData, selections)`: Transforms designer data for API

#### 2. UI Integration

- **Enhanced Controls**: Added AI generation button in `Controls.jsx`
- **Loading States**: Spinner and disabled states during generation
- **Error Handling**: Display error messages to users
- **Image Display**: Shows generated results below 3D preview

## Security Features

### Backend Security

1. **Environment Variables**: API key stored securely in `.env`
2. **Input Validation**: Validates required fields and data types
3. **Error Handling**: Doesn't expose internal errors to client
4. **Rate Limiting**: Ready for implementation (placeholder included)

### Frontend Security

1. **Error Boundaries**: Graceful error handling
2. **Input Sanitization**: Clean data before API calls
3. **Loading States**: Prevents multiple concurrent requests

## Prompt Engineering

### Intelligent Prompt Building

The `buildCakePrompt()` function creates detailed, context-aware prompts:

1. **Size Descriptions**: "small, delicate" vs "large, impressive"
2. **Shape Context**: "round" vs "heart-shaped" vs "hexagonal"
3. **Color Intelligence**: Hex colors converted to descriptive text
4. **Flavor Context**: Adds appropriate cake and frosting descriptions
5. **Decoration Mapping**: Translates selections to visual descriptions
6. **Theme & Occasion**: Contextualizes the cake's purpose
7. **Professional Photography Terms**: Ensures high-quality results

### Example Generated Prompt

```
Create a realistic photograph of a beautiful medium-sized round cake with soft pink base cake topped with pristine white frosting featuring vanilla sponge with classic vanilla frosting decorated with delicate buttercream flowers, elegant edible pearls in an elegant, sophisticated style perfect for a birthday celebration with "Happy Birthday" written on it placed on a clean white ceramic cake stand against a soft, neutral background with professional lighting. The image should be high quality, well-lit, and showcase the cake's details clearly. Studio photography style with soft shadows and appetizing presentation. Photorealistic, professional bakery quality, highly detailed.
```

## Current Implementation Status

### ✅ Completed Features

- [x] Backend API endpoint with full validation
- [x] Gemini SDK integration
- [x] Intelligent prompt engineering
- [x] Frontend UI integration
- [x] Loading states and error handling
- [x] Comprehensive error boundaries
- [x] Security best practices
- [x] Environment configuration

### 🔄 Current Limitation

- **Image Generation**: Currently generates enhanced prompts only
- **Reason**: Gemini AI currently focuses on text generation
- **Solution**: Ready to integrate with image generation services like:
  - OpenAI DALL-E 3
  - Stable Diffusion
  - Midjourney API

## How to Use

### 1. Setup

```bash
# Backend
cd backend
npm install @google/generative-ai

# Add GEMINI_API_KEY to .env file
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### 2. Start Services

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

### 3. Using the Feature

1. Open Custom Cake Designer
2. Configure cake (shape, size, colors)
3. Click "✨ Generate AI Image ✨"
4. View enhanced prompt (image generation coming soon)

## Future Enhancements

### Phase 2: Image Generation Integration

```javascript
// Example integration with DALL-E 3
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateActualImage(enhancedPrompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}
```

### Phase 3: Advanced Features

- [ ] Multiple style options (realistic, artistic, cartoon)
- [ ] Batch generation with variations
- [ ] User prompt customization
- [ ] Image editing and refinement
- [ ] Integration with cake ordering system

## API Rate Limiting (To Implement)

```javascript
// Example rate limiting with express-rate-limit
const rateLimit = require("express-rate-limit");

const aiGenerationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many AI generation requests, please try again later.",
  },
});

router.post(
  "/generate-cake-image",
  aiGenerationLimit,
  generateCakeImageController
);
```

## Error Handling

### Backend Errors

- Invalid API key
- Network failures
- Invalid request data
- Rate limiting

### Frontend Errors

- Network connectivity
- Invalid responses
- User input validation
- Component state errors

## Testing

### Manual Testing

1. Test with various cake configurations
2. Test error scenarios (invalid API key, network issues)
3. Test loading states and user experience
4. Test prompt quality and relevance

### Automated Testing (Future)

```javascript
// Example test
describe("Gemini Integration", () => {
  it("should generate appropriate prompts", async () => {
    const cakeData = {
      size: "medium",
      shape: "circle",
      baseColor: "#f5d0e6",
    };

    const result = await generateCakeImage(cakeData);
    expect(result.enhancedPrompt).toContain("medium-sized round cake");
    expect(result.enhancedPrompt).toContain("soft pink");
  });
});
```

## Conclusion

The Gemini integration provides a solid foundation for AI-enhanced cake visualization. The system is secure, scalable, and ready for future enhancements with actual image generation capabilities.

The intelligent prompt engineering ensures high-quality, contextually appropriate descriptions that will produce excellent results when connected to image generation services.
