/**
 * AI API Contract
 * This defines the interface that other team members can use
 * for AI-related operations.
 */
export const AIAPI = {
  /**
   * Get ride recommendations for a user
   * @param {string} userId The user ID
   * @returns {Promise<Array>} Recommended rides
   */
  getRecommendations: async (userId) => {
    throw new Error('Not implemented');
  },
  
  /**
   * Match rides based on user request
   * @param {Object} request The ride request
   * @returns {Promise<Array>} Sorted matching rides
   */
  matchRides: async (request) => {
    throw new Error('Not implemented');
  },
  
  /**
   * Parse and normalize location text
   * @param {string} text The location text
   * @returns {Promise<Object>} Normalized location data
   */
  parseLocation: async (text) => {
    throw new Error('Not implemented');
  },
  
  /**
   * Estimate journey time between two locations
   * @param {string} pickup Pickup location
   * @param {string} dropoff Dropoff location
   * @returns {Promise<Object>} Journey estimate
   */
  estimateJourneyTime: async (pickup, dropoff) => {
    throw new Error('Not implemented');
  }
};

export default AIAPI;
