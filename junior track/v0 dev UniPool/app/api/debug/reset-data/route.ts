import { NextResponse } from "next/server";
import { SeedDataService } from "@/services/SeedDataService";
import { AuthService } from "@/services/AuthService";

export async function GET() {
  try {
    // Clear all data
    SeedDataService.clearAllData();

    // For good measure, also reset via AuthService
    await AuthService.resetDatabase();

    return NextResponse.json({
      success: true,
      message: "All test data removed successfully",
    });
  } catch (error: any) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset data",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
