/**
 * API Handler for Stability AI requests
 * Enhanced version with improved error handling and progress tracking
 */

class StabilityAPIHandler {
    constructor(defaultApiKey = 'ENTER-API-KEY-HERE') {
      this.defaultApiKey = defaultApiKey;
      this.apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
      this.isGenerating = false;
    }
  
    /**
     * Generate an image using Stability AI API with improved error handling
     * @param {string} prompt - The text prompt to generate an image from
     * @param {string} apiKey - Optional API key (uses default if not provided)
     * @param {string} outputFormat - Image format ('jpeg' or 'png')
     * @param {function} onProgress - Optional callback for progress updates
     * @returns {Promise<Object>} - Promise resolving to { success: true, imageData: "data:..." }
     */
    async generateImage(prompt, apiKey = null, outputFormat = 'jpeg', onProgress = null) {
      // Validate inputs
      if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt is required');
      }
      
      if (this.isGenerating) {
        throw new Error('Another generation is already in progress');
      }
      
      this.isGenerating = true;
      const key = apiKey || this.defaultApiKey;
      
      // Notify about progress
      if (onProgress) onProgress({ 
        stage: 'start', 
        message: 'Starting API request...',
        progress: 0.1
      });
      
      try {
        // Create FormData for multipart/form-data
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('output_format', outputFormat);
        
        if (onProgress) onProgress({ 
          stage: 'sending', 
          message: 'Sending request to Stability AI...',
          progress: 0.2
        });
        
        // Call the Stability API with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
        
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Accept': 'image/*'
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMsg = `API error (${response.status})`;
          
          try {
            const errorBody = await response.text();
            errorMsg = `${errorMsg}: ${errorBody}`;
          } catch (e) {
            // If we can't parse the error body, just use the status code
          }
          
          throw new Error(errorMsg);
        }
        
        if (onProgress) onProgress({ 
          stage: 'processing', 
          message: 'Processing image data...',
          progress: 0.7
        });
        
        // Get the image data as blob
        const blob = await response.blob();
        
        if (onProgress) onProgress({ 
          stage: 'finalizing', 
          message: 'Finalizing image...',
          progress: 0.9
        });
        
        // Convert blob to data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.isGenerating = false;
            if (onProgress) onProgress({ 
              stage: 'complete', 
              message: 'Image generation complete',
              progress: 1.0
            });
            resolve({
              success: true,
              imageData: reader.result
            });
          };
          reader.onerror = () => {
            this.isGenerating = false;
            reject(new Error('Failed to read image data'));
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        this.isGenerating = false;
        console.error('Error generating image:', error);
        return {
          success: false,
          error: error.message || 'Unknown error occurred'
        };
      }
    }
  
    /**
     * Enhanced version for specialized depth map generation
     * @param {string} prompt - Base prompt to describe the scene/object
     * @param {string} apiKey - Optional API key
     * @param {boolean} isDepthMap - Whether to optimize prompt for depth map generation
     * @param {function} onProgress - Optional progress callback
     * @returns {Promise<Object>} - Promise resolving to image data
     */
    async generateSpecializedImage(prompt, apiKey = null, isDepthMap = false, onProgress = null) {
      let finalPrompt = prompt;
      
      // Enhance the prompt for depth map generation with improved instructions
      if (isDepthMap) {
        finalPrompt = `Depth map for ${prompt}. Clear grayscale image where white areas represent objects closest to the viewer and black areas represent the background or distant objects. Please create strong contrast between foreground and background elements with smooth gradients for mid-range depths. The depth map should clearly define object boundaries and spatial relationships.`;
      } else {
        // For pattern generation, optimize for repeating seamless textures
        finalPrompt = `${prompt}. Create a seamless repeating pattern with medium contrast and subtle details. Ensure the pattern has no obvious seams when tiled and has good variance in texture while maintaining consistency.`;
      }
      
      return this.generateImage(finalPrompt, apiKey, 'jpeg', onProgress);
    }
    
    /**
     * Generate random patterns specifically optimized for stereograms
     * @param {string} style - Style description (e.g., "geometric", "natural", "abstract")
     * @param {string} apiKey - Optional API key
     * @param {function} onProgress - Optional progress callback
     * @returns {Promise<Object>} - Promise resolving to image data
     */
    async generatePattern(style, apiKey = null, onProgress = null) {
      const patternPrompt = `Seamless repeating pattern for stereogram with ${style} style. Create a texture with medium contrast, no distinct focal points, and a balanced distribution of elements. The pattern should be subtle enough not to distract from the 3D effect, yet detailed enough to make the stereogram work effectively. Ensure the pattern can be tiled without visible seams.`;
      return this.generateImage(patternPrompt, apiKey, 'jpeg', onProgress);
    }
    
    /**
     * Cancels any current generation if possible
     * @returns {boolean} - True if a generation was canceled, false otherwise
     */
    cancelGeneration() {
      if (!this.isGenerating) {
        return false;
      }
      
      this.isGenerating = false;
      return true;
    }
  }
  
  // For direct usage in browser
  if (typeof window !== 'undefined') {
    window.StabilityAPIHandler = StabilityAPIHandler;
  }
  
  // For Node.js/CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StabilityAPIHandler;
  }