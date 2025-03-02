# Stability AI Stereogram Creator

A powerful tool to create custom stereograms using AI-generated or custom images. This application leverages the Stability AI API to generate depth maps and patterns, allowing you to create stunning 3D stereogram illusions.

![Stereogram Creator Interface](https://raw.githubusercontent.com/penguinlalo/stabilityai-stereogram-creator/main/screenshot.png)

## Features

- **Create stereograms** from depth maps and pattern images
- **AI-powered generation** of depth maps and pattern textures using Stability AI
- **Steganography support** to hide secret messages in your stereograms
- **Custom settings** to adjust depth effect, pattern scale, and contrast
- **Multiple output formats** including PNG and JPEG
- **Decode functionality** to extract hidden messages from stereograms

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Stability AI API key
  - Get one at [platform.stability.ai](https://platform.stability.ai/)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/penguinlalo/stabilityai-stereogram-creator.git
   ```

2. Set your Stability AI API key:
   - Open each of the following files:
     - `stereogram.js`
     - `api-handler.js`
     - `generate_image.php`
     - `index.html`
   - Replace all instances of `ENTER-API-KEY-HERE` with your actual Stability AI API key

3. Launch the application:
   - Double-click on `index.html` to open it in your browser
   - For the PHP functionality, you'll need to run it on a PHP-capable server

## How to Use

### Manual Image Creation

1. **Upload a depth map**:
   - Click "Browse" in the Depth Map section
   - Select a grayscale image where white represents areas closest to the viewer and black represents distant areas

2. **Upload a pattern**:
   - Click "Browse" in the Pattern section
   - Select a seamless repeating pattern image

3. **Adjust settings**:
   - Shift Strength: Controls the intensity of the 3D effect
   - Pattern Scale: Adjusts the size of the repeating pattern
   - Depth Contrast: Enhances or reduces contrast in the depth map

4. **Generate the stereogram**:
   - Click "Execute Stereogram" to create your stereogram
   - View the result in the preview area

### AI-Powered Generation

1. **Switch to AI Gen tab**:
   - In the Input Images section, click on the "AI Gen" tab

2. **Enter a prompt**:
   - Describe what you want the AI to generate

3. **Choose generation type**:
   - Select "Depth Map" to generate a 3D structure
   - Select "Pattern" to generate a repeating texture

4. **Generate**:
   - Click "Generate with AI"
   - Wait for the AI to create your image

5. **Proceed with stereogram creation**:
   - Once generated, you can adjust settings and create your stereogram

### Steganography (Hidden Messages)

1. **Enter a message**:
   - Type your secret message in the "Hidden Payload" field
   - Ensure "Enable Steganography" is checked

2. **Generate the stereogram**:
   - The message will be embedded invisibly in the image

3. **Extract a hidden message**:
   - Click "Decrypt Payload"
   - Upload a stereogram containing a hidden message
   - Click "Run Decryptor" to reveal the message

## How to View Stereograms

To see the 3D effect in stereograms:

1. Position your face close to the screen
2. Relax your eyes as if looking through the image at a distant point
3. Slowly move back from the screen while maintaining the relaxed gaze
4. The hidden 3D image should gradually appear

## Troubleshooting

- If the API doesn't respond, verify your API key is correct and has sufficient credits
- If stereograms are difficult to view, try adjusting the Shift Strength to a lower value
- For optimal viewing, ensure your display brightness and contrast are at comfortable levels
- If you cannot see the 3D effect, try viewing in a well-lit environment without screen glare

## Technology

- HTML5, CSS3, and JavaScript for the frontend
- PHP for backend API functionality
- Stability AI API for AI-generated images

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to Stability AI for their powerful image generation API
- Inspired by the Magic Eye stereograms of the 1990s

---

Created by [PenguinLalo](https://github.com/penguinlalo) | © 2025
