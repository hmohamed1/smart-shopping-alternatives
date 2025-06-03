
import axios from "axios";
import { Product } from "@/types/product";

// Define the backend API base URL
const API_BASE_URL = "http://localhost:3001/api"; // Adjust if your backend runs elsewhere

export const findAlternativeProducts = async (
  input: string | File, // Input can be a URL string or a File object
  isUrl: boolean
): Promise<{
  originalProduct: Product | null;
  alternatives: Product[];
  error?: string;
}> => {
  try {
    let response;

    if (isUrl && typeof input === 'string') {
      // --- Handle URL Input ---
      console.log(`Sending URL to backend: ${input}`);
      response = await axios.post(`${API_BASE_URL}/find-by-url`, { url: input });
      console.log("Backend response (URL):", response.data);

    } else if (!isUrl && input instanceof File) {
      // --- Handle Image Input ---
      console.log(`Sending image to backend: ${input.name}`);
      const formData = new FormData();
      formData.append("productImage", input); // Key must match backend (upload.single('productImage'))

      response = await axios.post(`${API_BASE_URL}/find-by-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Backend response (Image):", response.data);

    } else {
      // --- Handle Invalid Input ---
      console.error("Invalid input type for findAlternativeProducts:", input, isUrl);
      return {
        originalProduct: null,
        alternatives: [],
        error: "Invalid input provided.",
      };
    }

    // --- Process Successful Response ---
    // Ensure the response structure matches what the backend sends
    const { originalProduct, alternatives, message } = response.data;

    // Basic validation of response data (can be more robust)
    if (!originalProduct || !Array.isArray(alternatives)) {
        console.error("Unexpected response structure from backend:", response.data);
        return {
            originalProduct: null,
            alternatives: [],
            error: "Received invalid data from the server."
        }
    }

    // Add savings calculation (optional, could also be done in backend)
    const calculatedAlternatives = alternatives.map(alt => ({
        ...alt,
        // Ensure prices are numbers for calculation
        savings: (originalProduct?.price && typeof originalProduct.price === 'number' && alt.price && typeof alt.price === 'number')
                 ? parseFloat((originalProduct.price - alt.price).toFixed(2))
                 : undefined // Or 0 if you prefer
    }));


    return {
      originalProduct: originalProduct || null, // Ensure it's null if undefined
      alternatives: calculatedAlternatives,
    };

  } catch (error) {
    // --- Handle API Errors ---
    console.error("Error calling backend API:", error);
    let errorMessage = "An unexpected error occurred while contacting the server.";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Backend Error Response:", error.response.data);
        // Use the error message from the backend if available
        errorMessage = error.response.data?.error || `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "Could not connect to the server. Please ensure it's running.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Error setting up request: ${error.message}`;
      }
    } else if (error instanceof Error) {
         errorMessage = error.message;
    }

    return {
      originalProduct: null,
      alternatives: [],
      error: errorMessage,
    };
  }
};
