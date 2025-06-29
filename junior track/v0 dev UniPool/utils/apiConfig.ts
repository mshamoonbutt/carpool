// utils/apiConfig.ts

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    auth: {
      login: string;
      register: string;
      verifyEmail: string;
      getCurrentUser: string;
    };
    rides: {
      getAll: string;
      search: string;
      create: string;
      getById: string;
      update: string;
      cancel: string;
    };
    bookings: {
      create: string;
      getByUserId: string;
      getByRideId: string;
      cancel: string;
    };
  };
  isApiOnline: boolean;
}

// Function to check if the API is available
let _isApiOnline = false;

// Create and export the config object
export const apiConfig: ApiConfig = {
  baseUrl: "http://localhost:8000",
  endpoints: {
    auth: {
      login: "/api/users/login",
      register: "/api/users/register",
      verifyEmail: "/api/users/verify-email",
      getCurrentUser: "/api/users/me",
    },
    rides: {
      getAll: "/api/rides",
      search: "/api/rides/search",
      create: "/api/rides",
      getById: "/api/rides/{id}",
      update: "/api/rides/{id}",
      cancel: "/api/rides/{id}/cancel",
    },
    bookings: {
      create: "/api/bookings",
      getByUserId: "/api/bookings/user/{userId}",
      getByRideId: "/api/bookings/ride/{rideId}",
      cancel: "/api/bookings/{id}/cancel",
    },
  },
  get isApiOnline() {
    return _isApiOnline;
  },
  set isApiOnline(value) {
    _isApiOnline = value;
  },
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Use the root API endpoint for health check
    const response = await fetch(`${apiConfig.baseUrl.replace(/\/api$/, "")}`, {
      signal: controller.signal,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    // Try to parse the response to verify it's a proper API endpoint
    const data = await response.json();
    const isValidApi = response.ok && data && (data.message || data.status);

    apiConfig.isApiOnline = isValidApi;
    console.log("API health check result:", isValidApi ? "online" : "offline");
    return isValidApi;
  } catch (error) {
    console.error("API health check failed:", error);
    apiConfig.isApiOnline = false;
    return false;
  }
};
