// services/AuthService.ts
import { ApiAuthService } from "./ApiAuthService";
import { apiConfig, checkApiHealth } from "@/utils/apiConfig";
import { withFallback } from "@/utils/apiUtils";

interface User {
  id: string;
  email: string;
  name: string;
  role: "driver" | "rider" | "both";
  gender: string;
  phone: string;
  password: string;
  userType: "student" | "faculty";
  ratings: {
    driver: { total: number; count: number } | null;
    rider: { total: number; count: number } | null;
  };
  createdAt: string;
}

interface EmailValidation {
  isValid: boolean;
  userType: "student" | "faculty" | null;
  error: string | null;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export class AuthService {
  // Check API availability on startup
  static {
    checkApiHealth().then((isOnline) => {
      console.log(
        `API is ${isOnline ? "online" : "offline"}. Using ${
          isOnline ? "backend API" : "localStorage"
        }.`
      );
    });
  }
  // Valid email domains for FCC
  private static readonly VALID_DOMAINS = [
    "@formanite.fccollege.edu.pk", // Students
    "@fccollege.edu.pk", // Faculty and Staff
  ];

  private static readonly DB_KEY = "unipool_db";
  private static readonly CURRENT_USER_KEY = "unipool_current_user";

  /**
   * Initialize database with seed data from db.json if localStorage is empty
   */
  static async initializeDatabase(): Promise<void> {
    try {
      // Check if data already exists in localStorage
      const existingData = localStorage.getItem(this.DB_KEY);

      if (!existingData) {
        console.log(
          "No existing data found. Loading seed data from db.json..."
        );

        // Load initial data from db.json
        const response = await fetch("/db.json");

        if (!response.ok) {
          throw new Error(`Failed to fetch db.json: ${response.status}`);
        }

        const initialData = await response.json();

        // Validate the data structure
        if (!initialData.users || !Array.isArray(initialData.users)) {
          throw new Error("Invalid db.json structure: missing users array");
        }

        // Save to localStorage
        localStorage.setItem(this.DB_KEY, JSON.stringify(initialData));
        console.log("✅ Database initialized with seed data:", {
          users: initialData.users.length,
          rides: initialData.rides?.length || 0,
          bookings: initialData.bookings?.length || 0,
        });
      } else {
        console.log("✅ Database already initialized with existing data");
      }
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);

      // Fallback: Create empty database structure
      const fallbackData = {
        users: [],
        rides: [],
        bookings: [],
      };

      localStorage.setItem(this.DB_KEY, JSON.stringify(fallbackData));
      console.log("📝 Initialized with empty database structure");
    }
  }

  /**
   * Reset database to initial seed data (useful for testing)
   */
  static async resetDatabase(): Promise<void> {
    try {
      // Clear existing data from all services
      localStorage.removeItem(this.DB_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);

      // Clear other service data that might contain test data
      localStorage.removeItem("unipool_rides");
      localStorage.removeItem("unipool_bookings");
      localStorage.removeItem("unipool_users");
      localStorage.removeItem("unipool_ratings");

      // For good measure, also clear any SeedDataService data
      localStorage.removeItem("unipool_seed_data");

      // Reinitialize
      await this.initializeDatabase();
      console.log("🔄 Database reset to initial seed data");
    } catch (error) {
      console.error("❌ Failed to reset database:", error);
    }
  }

  /**
   * Validates if email has correct FCC domain
   */
  static validateEmail(email: string): EmailValidation {
    if (!email || typeof email !== "string") {
      return {
        isValid: false,
        userType: null,
        error: "Email is required",
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for student domain
    if (normalizedEmail.endsWith("@formanite.fccollege.edu.pk")) {
      return {
        isValid: true,
        userType: "student",
        error: null,
      };
    }

    // Check for faculty/staff domain
    if (normalizedEmail.endsWith("@fccollege.edu.pk")) {
      return {
        isValid: true,
        userType: "faculty",
        error: null,
      };
    }

    // Invalid domain
    return {
      isValid: false,
      userType: null,
      error:
        "Please use your FCC email address (@formanite.fccollege.edu.pk for students or @fccollege.edu.pk for faculty/staff)",
    };
  }

  /**
   * Register a new user with email verification
   */
  static async register(userData: {
    email: string;
    name: string;
    role: "driver" | "rider" | "both";
    gender: string;
    phone: string;
    password: string;
  }): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const { email, name, role, gender, phone, password } = userData;

          // Validate email domain
          const emailValidation = this.validateEmail(email);
          if (!emailValidation.isValid) {
            reject(new Error(emailValidation.error || "Invalid email"));
            return;
          }

          // Check if user already exists
          const existingUser = this.getUserByEmail(email);
          if (existingUser) {
            reject(new Error("An account with this email already exists"));
            return;
          }

          // Validate required fields
          if (!name || !role || !phone) {
            reject(new Error("Please fill in all required fields"));
            return;
          }

          // Gender and password are required for all users
          if (!gender) {
            reject(new Error("Gender selection is required"));
            return;
          }

          if (!password) {
            reject(new Error("Password is required"));
            return;
          }

          // Create new user
          const newUser: User = {
            id: this.generateUserId(),
            email: email.toLowerCase().trim(),
            name: name.trim(),
            role,
            gender,
            password,
            phone: phone.trim(),
            userType: emailValidation.userType || "student", // Default to student if null
            ratings: {
              driver:
                role === "driver" || role === "both"
                  ? { total: 0, count: 0 }
                  : null,
              rider:
                role === "rider" || role === "both"
                  ? { total: 0, count: 0 }
                  : null,
            },
            createdAt: new Date().toISOString(),
          };

          // Save user to localStorage
          this.saveUser(newUser);
          this.setCurrentUser(newUser);

          console.log("✅ User registered successfully:", newUser.email);
          resolve(newUser);
        } catch (error) {
          console.error("❌ Registration error:", error);
          reject(new Error("Registration failed. Please try again."));
        }
      }, 300); // Simulate network delay
    });
  }

  /**
   * Login user with email verification (keeping your current signature)
   */
  static async login(email: string, password: string): Promise<User | null> {
    // First check if API is available
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log("Attempting API login...");
        // Try to login with API first
        const apiUser = await ApiAuthService.login({ email, password });

        // Convert API user to local format
        const user: User = {
          id: apiUser.id.toString(),
          email: apiUser.email,
          name: apiUser.name,
          role: apiUser.role as any,
          gender: "unknown", // API might not have this field
          phone: apiUser.phone,
          password: "", // Don't store real password
          userType: "student", // Default
          ratings: {
            driver: null,
            rider: null,
          },
          createdAt: apiUser.created_at,
        };

        // Store the logged in user locally
        this.setCurrentUser(user);
        console.log("✅ User logged in successfully via API:", user.email);
        return user;
      } catch (error) {
        console.warn("API login failed, falling back to localStorage:", error);
        // Fall back to localStorage login
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate email domain
          const emailValidation = this.validateEmail(email);
          if (!emailValidation.isValid) {
            reject(new Error(emailValidation.error || "Invalid email"));
            return;
          }

          // Find user by email
          const user = this.getUserByEmail(email);
          if (!user) {
            reject(
              new Error(
                "No account found with this email address. Please register first."
              )
            );
            return;
          }

          // Validate password
          if (!password || user.password !== password) {
            reject(new Error("Invalid password. Please try again."));
            return;
          }

          // Set current user
          this.setCurrentUser(user);
          console.log(
            "✅ User logged in successfully via localStorage:",
            user.email
          );
          resolve(user);
        } catch (error) {
          console.error("❌ Login error:", error);
          reject(new Error("Login failed. Please try again."));
        }
      }, 300);
    });
  }

  /**
   * Get user by email
   */
  private static getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return (
      users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase().trim()
      ) || null
    );
  }

  /**
   * Get all users from localStorage
   */
  private static getAllUsers(): User[] {
    try {
      const data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
      return data.users || [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  /**
   * Save user to localStorage
   */
  private static saveUser(user: User): void {
    try {
      const data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
      if (!data.users) data.users = [];

      data.users.push(user);
      localStorage.setItem(this.DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving user:", error);
    }
  }

  /**
   * Set current user in localStorage
   */
  static setCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting current user:", error);
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Logout current user
   */
  static logout(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Generate unique user ID
   */
  private static generateUserId(): string {
    return "u" + Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Get database stats (useful for debugging)
   */
  static getDatabaseStats(): {
    users: number;
    rides: number;
    bookings: number;
  } {
    try {
      const data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
      return {
        users: data.users?.length || 0,
        rides: data.rides?.length || 0,
        bookings: data.bookings?.length || 0,
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      return { users: 0, rides: 0, bookings: 0 };
    }
  }

  /**
   * Get all data (useful for debugging)
   */
  static getAllData(): any {
    try {
      return JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
    } catch (error) {
      console.error("Error getting all data:", error);
      return {};
    }
  }

  /**
   * Clear all users from the database
   */
  static async clearAllUsers(): Promise<void> {
    try {
      // Get current data
      const data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");

      // Clear users array but keep other data
      data.users = [];

      // Save back to localStorage
      localStorage.setItem(this.DB_KEY, JSON.stringify(data));

      // Clear current user as well
      localStorage.removeItem(this.CURRENT_USER_KEY);

      console.log("✅ All users cleared from database");
    } catch (error) {
      console.error("❌ Failed to clear users:", error);
    }
  }
}
