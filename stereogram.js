/**
 * Stereogram.js - Core functionality for the PNGUIN Stereogram Generator
 * Version 5.0
 */

// Initialize the API handler
const apiHandler = new StabilityAPIHandler();

// Core Variables
let depthImg = null;
let patternImg = null;
const canvas = document.getElementById('stereogramCanvas');
const ctx = canvas.getContext('2d');
let defaultApiKey = "ENTER-API-KEY-HERE";
let isGenerating = false;

// DOM Elements - Input Controls
const depthInput = document.getElementById('depthMap');
const patternInput = document.getElementById('pattern');
const shiftStrengthSlider = document.getElementById('shiftStrength');
const patternScaleSlider = document.getElementById('patternScale');
const depthContrastSlider = document.getElementById('depthContrast');
const shiftStrengthValue = document.getElementById('shiftStrengthValue');
const patternScaleValue = document.getElementById('patternScaleValue');
const depthContrastValue = document.getElementById('depthContrastValue');
const hiddenMessageInput = document.getElementById('hiddenMessage');
const enableStegoCheckbox = document.getElementById('enableStego');
const formatSelect = document.getElementById('formatSelect');
const jpegQualityGroup = document.getElementById('jpegQualityGroup');
const jpegQualitySlider = document.getElementById('jpegQuality');
const jpegQualityValue = document.getElementById('jpegQualityValue');
const apiKeyInput = document.getElementById('apiKey');
const aiPromptInput = document.getElementById('aiPrompt');
const generateAIBtn = document.getElementById('generateAIBtn');

// DOM Elements - Preview
const depthMapContainer = document.getElementById('depthMapContainer');
const patternContainer = document.getElementById('patternContainer');
const depthPreviewImg = document.getElementById('depthPreviewImg');
const patternPreviewImg = document.getElementById('patternPreviewImg');
const depthPlaceholder = document.getElementById('depthPlaceholder');
const patternPlaceholder = document.getElementById('patternPlaceholder');

// DOM Elements - Loading and notifications
const loadingElement = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');

// Matrix Rain Effect Initialization
initializeMatrixEffect();

// Tab Navigation for Input Method (Manual/AI)
initializeInputTabs();

// Preview Tabs (Result/Depth/Pattern)
initializePreviewTabs();

// Collapsible Sections
initializeCollapsibles();

// Initialize Help Button
initializeHelp();

// Event Listeners for File Inputs
initializeFileInputs();

// Event Listeners for Sliders
initializeSliders();

// Event Listeners for Buttons
initializeButtons();

// Event Listener for Format Select
formatSelect.addEventListener('change', () => {
  jpegQualityGroup.style.display = formatSelect.value === 'jpeg' ? 'block' : 'none';
});

// Initialize with default API key
window.addEventListener('DOMContentLoaded', () => {
  apiKeyInput.value = defaultApiKey;
});

/**
 * Matrix Rain Effect (Grey Themed)
 */
function initializeMatrixEffect() {
  const matrixCanvas = document.getElementById('matrixBg');
  const matrixCtx = matrixCanvas.getContext('2d');
  
  // Set canvas dimensions and adjust on window resize
  function resizeMatrixCanvas() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  }
  
  resizeMatrixCanvas();
  window.addEventListener('resize', resizeMatrixCanvas);
  
  const columns = Math.floor(matrixCanvas.width / 20);
  const drops = Array(columns).fill(0);
  
  function drawMatrix() {
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    matrixCtx.fillStyle = '#aaa';  // Light grey matrix rain
    matrixCtx.font = '15px monospace';
    
    drops.forEach((y, index) => {
      const text = String.fromCharCode(Math.floor(Math.random() * 128));
      const x = index * 20;
      matrixCtx.fillText(text, x, y);
      drops[index] = y > 100 + Math.random() * 10000 ? 0 : y + 20;
    });
  }
  
  setInterval(drawMatrix, 50);
}

/**
 * Initialize Input Method Tabs (Manual/AI)
 */
function initializeInputTabs() {
  const inputTabs = document.querySelectorAll('[data-input-tab]');
  const inputContents = document.querySelectorAll('.input-tab-content');
  
  inputTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-input-tab');
      
      // Remove active class from all tabs and contents
      inputTabs.forEach(t => t.classList.remove('active'));
      inputContents.forEach(c => c.style.display = 'none');
      
      // Add active class to clicked tab and show its content
      tab.classList.add('active');
      document.getElementById(`${tabName}InputTab`).style.display = 'block';
    });
  });
}

/**
 * Initialize Preview Tabs (Result/Depth/Pattern)
 */
function initializePreviewTabs() {
  const previewTabs = document.querySelectorAll('[data-preview]');
  const previewContents = document.querySelectorAll('.preview-content');
  
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const previewName = tab.getAttribute('data-preview');
      
      // Remove active class from all tabs and contents
      previewTabs.forEach(t => t.classList.remove('active'));
      previewContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and its content
      tab.classList.add('active');
      document.getElementById(`${previewName}Preview`).classList.add('active');
    });
  });
}

/**
 * Initialize Collapsible Sections
 */
function initializeCollapsibles() {
  const collapsibles = document.querySelectorAll('.collapsible-header');
  
  collapsibles.forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('active');
      const content = header.nextElementSibling;
      
      if (header.classList.contains('active')) {
        content.style.maxHeight = '1000px'; // Set a large value to accommodate any content
      } else {
        content.style.maxHeight = '0';
      }
    });
  });
}

/**
 * Initialize Help Button and Modal
 */
function initializeHelp() {
  const helpButton = document.getElementById('helpButton');
  const helpModal = document.getElementById('helpModal');
  const closeHelpModal = document.getElementById('closeHelpModal');
  
  helpButton.addEventListener('click', () => {
    helpModal.style.display = 'block';
  });
  
  closeHelpModal.addEventListener('click', () => {
    helpModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });
}

/**
 * Initialize File Input Handlers
 */
function initializeFileInputs() {
  depthInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    
    depthImg = new Image();
    depthImg.onload = () => {
      // Update preview
      updateImagePreview(depthMapContainer, depthImg.src);
      updateImagePreview(depthPreviewImg, depthImg.src, depthPlaceholder);
      
      // Generate stereogram if both images are loaded
      if (patternImg) {
        canvas.width = depthImg.width;
        canvas.height = depthImg.height;
        generateStereogram();
      }
    };
    depthImg.src = URL.createObjectURL(file);
  });
  
  patternInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    
    patternImg = new Image();
    patternImg.onload = () => {
      // Update preview
      updateImagePreview(patternContainer, patternImg.src);
      updateImagePreview(patternPreviewImg, patternImg.src, patternPlaceholder);
      
      // Generate stereogram if both images are loaded
      if (depthImg) {
        canvas.width = depthImg.width;
        canvas.height = depthImg.height;
        generateStereogram();
      }
    };
    patternImg.src = URL.createObjectURL(file);
  });
}

/**
 * Update Image Preview
 * @param {HTMLElement} container - Container element for the image/thumbnail
 * @param {string} src - Image source URL
 * @param {HTMLElement} placeholder - Optional placeholder element to hide
 */
function updateImagePreview(container, src, placeholder = null) {
  if (container instanceof HTMLImageElement) {
    // If container is an image element
    container.src = src;
    container.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } else {
    // If container is a div containing a placeholder
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    container.appendChild(img);
  }
}

/**
 * Initialize Slider Controls
 */
function initializeSliders() {
  shiftStrengthSlider.addEventListener('input', () => {
    shiftStrengthValue.textContent = shiftStrengthSlider.value;
    debouncedGenerate();
  });
  
  patternScaleSlider.addEventListener('input', () => {
    patternScaleValue.textContent = patternScaleSlider.value;
    debouncedGenerate();
  });
  
  depthContrastSlider.addEventListener('input', () => {
    depthContrastValue.textContent = depthContrastSlider.value;
    debouncedGenerate();
  });
  
  jpegQualitySlider.addEventListener('input', () => {
    jpegQualityValue.textContent = jpegQualitySlider.value;
  });
}

/**
 * Initialize Button Event Handlers
 */
function initializeButtons() {
  // Generate Stereogram
  document.getElementById('generateBtn').addEventListener('click', generateStereogram);
  
  // Download Button
  document.getElementById('downloadBtn').addEventListener('click', downloadStereogram);
  
  // Decrypt Modal
  document.getElementById('decodeHiddenBtn').addEventListener('click', () => {
    document.getElementById('decodeModal').style.display = 'block';
  });
  
  document.getElementById('decodeBtn').addEventListener('click', decodeHiddenMessage);
  
  document.getElementById('closeDecodeModal').addEventListener('click', () => {
    document.getElementById('decodeModal').style.display = 'none';
  });
  
  // AI Generation
  generateAIBtn.addEventListener('click', generateWithAI);
}

/**
 * Download generated stereogram
 */
function downloadStereogram() {
  if (!canvas.width || !canvas.height) {
    showNotification("No stereogram has been generated yet", true);
    return;
  }
  
  const format = formatSelect.value;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? parseFloat(jpegQualitySlider.value) : 1;
  const link = document.createElement('a');
  link.download = `stereogram.${format}`;
  link.href = canvas.toDataURL(mimeType, quality);
  link.click();
  showNotification("Stereogram downloaded successfully");
}

/**
 * Generate with AI using Stability API
 */
async function generateWithAI() {
  const prompt = aiPromptInput.value.trim();
  const genType = document.querySelector('input[name="genType"]:checked').value;
  const apiKey = apiKeyInput.value.trim() || defaultApiKey;
  
  if (!prompt) {
    showNotification("Please enter a prompt for AI generation", true);
    return;
  }
  
  if (isGenerating) {
    showNotification("AI generation already in progress", true);
    return;
  }
  
  isGenerating = true;
  showLoading("Generating with AI...");
  
  try {
    const result = await apiHandler.generateSpecializedImage(
      prompt, 
      apiKey, 
      genType === 'depthMap',
      updateLoadingProgress
    );
    
    if (!result.success) {
      throw new Error(result.error || "Failed to generate image");
    }
    
    // Load the generated image
    const img = new Image();
    img.onload = () => {
      if (genType === 'depthMap') {
        depthImg = img;
        updateImagePreview(depthMapContainer, result.imageData);
        updateImagePreview(depthPreviewImg, result.imageData, depthPlaceholder);
      } else {
        patternImg = img;
        updateImagePreview(patternContainer, result.imageData);
        updateImagePreview(patternPreviewImg, result.imageData, patternPlaceholder);
      }
      
      // Generate stereogram if both images are available
      if (depthImg && patternImg) {
        canvas.width = depthImg.width;
        canvas.height = depthImg.height;
        generateStereogram();
      }
      
      showNotification(`AI ${genType === 'depthMap' ? 'depth map' : 'pattern'} generated successfully`);
      hideLoading();
    };
    img.src = result.imageData;
    
  } catch (error) {
    console.error("AI generation error:", error);
    showNotification("Failed to generate image with AI: " + error.message, true);
    hideLoading();
  } finally {
    isGenerating = false;
  }
}

/**
 * Update loading progress display
 * @param {Object} progressInfo - Progress information object
 */
function updateLoadingProgress(progressInfo) {
  const { stage, message, progress } = progressInfo;
  loadingText.textContent = message || `Processing (${Math.round(progress * 100)}%)...`;
}

/**
 * Show loading indicator
 * @param {string} message - Optional loading message
 */
function showLoading(message = "Processing...") {
  loadingText.textContent = message;
  loadingElement.style.display = 'block';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  loadingElement.style.display = 'none';
}

/**
 * Notification System
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error notification
 */
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = isError ? 'error' : '';
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

/**
 * Generate Stereogram
 * Creates a stereogram based on the depth map and pattern
 */
function generateStereogram() {
  if (!depthImg || !patternImg) {
    showNotification("[ERR] SYS requires depth map and pattern image.", true);
    return;
  }
  
  showLoading("Generating stereogram...");
  
  // Use setTimeout to allow the loading indicator to appear
  setTimeout(() => {
    try {
      canvas.width = depthImg.width;
      canvas.height = depthImg.height;
      
      const shiftStrength = parseInt(shiftStrengthSlider.value);
      const patternScale = parseFloat(patternScaleSlider.value);
      const contrast = parseFloat(depthContrastSlider.value);
      
      // Create the pattern canvas with scaling
      const patternWidth = patternImg.width * patternScale;
      const patternHeight = patternImg.height * patternScale;
      
      // Create off-screen canvas for pattern tiling
      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const offCtx = offCanvas.getContext('2d');
      
      // Tile the pattern
      for (let y = 0; y < canvas.height; y += patternHeight) {
        for (let x = 0; x < canvas.width; x += patternWidth) {
          offCtx.drawImage(patternImg, x, y, patternWidth, patternHeight);
        }
      }
      let patternData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Process depth map with contrast adjustment
      const depthCanvas = document.createElement('canvas');
      depthCanvas.width = depthImg.width;
      depthCanvas.height = depthImg.height;
      const depthCtx = depthCanvas.getContext('2d');
      depthCtx.drawImage(depthImg, 0, 0);
      let depthData = depthCtx.getImageData(0, 0, canvas.width, canvas.height);
      depthData = adjustContrast(depthData, contrast);
      
      // Generate the stereogram
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const depthValue = depthData.data[index] / 255;
          const shift = Math.floor(depthValue * shiftStrength);
          
          // Calculate source position with wraparound
          let srcX = (x + shift) % canvas.width;
          if (srcX < 0) srcX += canvas.width;
          
          const srcIndex = (y * canvas.width + srcX) * 4;
          
          // Copy pixel data
          patternData.data[index] = patternData.data[srcIndex];
          patternData.data[index + 1] = patternData.data[srcIndex + 1];
          patternData.data[index + 2] = patternData.data[srcIndex + 2];
          patternData.data[index + 3] = 255; // Force opacity
        }
      }
      
      // Apply steganography if enabled
      if (enableStegoCheckbox.checked && hiddenMessageInput.value) {
        embedMessage(patternData, hiddenMessageInput.value);
      }
      
      // Draw the final stereogram
      ctx.putImageData(patternData, 0, 0);
      
      // Switch to result tab
      document.querySelector('[data-preview="result"]').click();
      
      hideLoading();
      showNotification("Stereogram generated successfully");
    } catch (error) {
      console.error("Error generating stereogram:", error);
      hideLoading();
      showNotification("Error generating stereogram: " + error.message, true);
    }
  }, 100);
}

/**
 * Adjust contrast of image data
 * @param {ImageData} imageData - Image data to adjust
 * @param {number} contrast - Contrast adjustment factor
 * @returns {ImageData} - Adjusted image data
 */
function adjustContrast(imageData, contrast) {
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(Math.max(factor * (data[i] - 128) + 128, 0), 255);
    data[i + 1] = data[i + 2] = data[i]; // Make grayscale
  }
  
  return imageData;
}

/**
 * Steganography Functions
 */

/**
 * Embed a message in image data using LSB steganography
 * @param {ImageData} imageData - Image data to embed message in
 * @param {string} message - Message to embed
 */
function embedMessage(imageData, message) {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const length = messageBytes.length;
  const lengthBytes = new Uint32Array([length]);
  const dataToEmbed = new Uint8Array(4 + length);
  
  // Store length followed by message bytes
  dataToEmbed.set(new Uint8Array(lengthBytes.buffer), 0);
  dataToEmbed.set(messageBytes, 4);
  
  const data = imageData.data;
  let byteIndex = 0;
  let bitInByte = 0;
  
  // Embed data bits in the least significant bit of each color channel
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      
      for (let c = 0; c < 3; c++) { // Process RGB channels
        if (byteIndex < dataToEmbed.length) {
          const bit = (dataToEmbed[byteIndex] >> (7 - bitInByte)) & 1;
          data[index + c] = (data[index + c] & 0xFE) | bit;
          
          bitInByte++;
          if (bitInByte === 8) {
            bitInByte = 0;
            byteIndex++;
          }
        } else return; // Done embedding
      }
      
      if (byteIndex >= dataToEmbed.length) return; // Done embedding
    }
  }
  
  if (byteIndex < dataToEmbed.length) {
    showNotification('[ERR] Payload too large for image.', true);
  }
}

/**
 * Generator function to iterate through bits in image data
 * @param {ImageData} imageData - Image data to extract bits from
 * @yields {number} - Next bit from the image
 */
function* bitIterator(imageData) {
  const data = imageData.data;
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        yield data[index + c] & 1;
      }
    }
  }
}

/**
 * Extract a hidden message from image data
 * @param {ImageData} imageData - Image data containing hidden message
 * @returns {string} - Extracted message or error
 */
function decodeMessage(imageData) {
  const bitGen = bitIterator(imageData);
  let lengthBinary = '';
  
  // Extract length (32 bits)
  for (let i = 0; i < 32; i++) {
    const bit = bitGen.next().value;
    if (bit === undefined) return '[ERR] Image too small';
    lengthBinary += bit;
  }
  
  const length = parseInt(lengthBinary, 2);
  if (length <= 0 || length > 10000) {
    return '[ERR] Invalid payload length detected';
  }
  
  let messageBinary = '';
  
  // Extract message bits
  for (let i = 0; i < length * 8; i++) {
    const bit = bitGen.next().value;
    if (bit === undefined) return '[ERR] Payload incomplete';
    messageBinary += bit;
  }
  
  // Convert binary to bytes
  const messageBytes = [];
  for (let i = 0; i < messageBinary.length; i += 8) {
    messageBytes.push(parseInt(messageBinary.substring(i, i + 8), 2));
  }
  
  // Convert bytes to text
  try {
    return new TextDecoder().decode(new Uint8Array(messageBytes));
  } catch (e) {
    return '[ERR] Failed to decode message';
  }
}

/**
 * Decode a hidden message from an image file
 */
function decodeHiddenMessage() {
  const fileInput = document.getElementById('decodeImage');
  if (!fileInput.files[0]) {
    showNotification('[ERR] Upload an image to decrypt.', true);
    return;
  }
  
  const img = new Image();
  img.onload = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    
    try {
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
      const decodedMessage = decodeMessage(imageData);
      document.getElementById('decodedMessage').value = decodedMessage;
      
      if (decodedMessage.startsWith('[ERR]')) {
        showNotification('Error decoding message: ' + decodedMessage, true);
      } else {
        showNotification('Message decoded successfully');
      }
    } catch (error) {
      console.error("Error decoding message:", error);
      showNotification('Error decoding message: ' + error.message, true);
      document.getElementById('decodedMessage').value = '[ERR] Failed to process image';
    }
  };
  
  img.onerror = () => {
    showNotification('[ERR] Failed to load image', true);
  };
  
  img.src = URL.createObjectURL(fileInput.files[0]);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Create debounced version of generateStereogram
const debouncedGenerate = debounce(generateStereogram, 300);

// Close all modals when clicking outside them
window.addEventListener('click', (event) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Initialize canvas size observer to handle window resizing
const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    if (entry.target === document.querySelector('.preview-container')) {
      // Update canvas size if a stereogram exists
      if (depthImg && patternImg) {
        generateStereogram();
      }
    }
  }
});

// Observe the preview container for size changes
resizeObserver.observe(document.querySelector('.preview-container'));