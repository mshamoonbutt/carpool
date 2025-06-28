// services/AIService.js
// Senior Track Implementation - AI Integration Service

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  }

  // Route Matching & Recommendations
  async getRecommendations(userId, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId,
          context: {
            currentTime: new Date().toISOString(),
            timezone: 'Asia/Karachi',
            ...context
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }

  async matchRides(request) {
    try {
      const response = await fetch(`${this.baseURL}/ai/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Ride matching failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Match rides error:', error);
      throw error;
    }
  }

  // Location Parsing & Normalization
  async parseLocation(text) {
    try {
      // First try to parse with AI if API key is available
      if (this.openaiApiKey) {
        return await this.parseLocationWithAI(text);
      }

      // Fallback to rule-based parsing
      return this.parseLocationWithRules(text);
    } catch (error) {
      console.error('Parse location error:', error);
      // Return basic parsing as fallback
      return this.parseLocationWithRules(text);
    }
  }

  async parseLocationWithAI(text) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a location parser for Lahore, Pakistan. Parse the given text and return a JSON object with:
              {
                "normalized": "Standard location name",
                "area": "General area (e.g., DHA, Gulberg, Model Town)",
                "phase": "Phase number if applicable",
                "type": "residential|commercial|university|landmark",
                "confidence": 0.0-1.0
              }
              
              Common areas in Lahore: DHA (Phases 1-11), Gulberg (I-V), Model Town, Johar Town, Faisal Town, Wapda Town, Bahria Town, Askari (X, XI), Cantt, Canal Bank, Mall Road, FCC University, LUMS, etc.`
            },
            {
              role: 'user',
              content: `Parse this location: "${text}"`
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error('AI parsing failed');
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      
      return {
        original: text,
        ...parsed,
        parsedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI location parsing error:', error);
      throw error;
    }
  }

  parseLocationWithRules(text) {
    const normalized = text.trim();
    const lowerText = normalized.toLowerCase();

    // DHA Phases
    if (lowerText.includes('dha')) {
      const phaseMatch = lowerText.match(/phase\s*(\d+)/i);
      const phase = phaseMatch ? phaseMatch[1] : '';
      return {
        original: text,
        normalized: `DHA Phase ${phase}`,
        area: 'DHA',
        phase: phase,
        type: 'residential',
        confidence: 0.9
      };
    }

    // Gulberg
    if (lowerText.includes('gulberg')) {
      const phaseMatch = lowerText.match(/(\d+)/);
      const phase = phaseMatch ? phaseMatch[1] : '';
      return {
        original: text,
        normalized: `Gulberg ${phase}`,
        area: 'Gulberg',
        phase: phase,
        type: 'residential',
        confidence: 0.9
      };
    }

    // Universities
    if (lowerText.includes('fcc') || lowerText.includes('forman')) {
      return {
        original: text,
        normalized: 'FCC University',
        area: 'Ferozepur Road',
        phase: '',
        type: 'university',
        confidence: 0.95
      };
    }

    // Common areas
    const commonAreas = {
      'model town': { normalized: 'Model Town', area: 'Model Town', type: 'residential' },
      'johar town': { normalized: 'Johar Town', area: 'Johar Town', type: 'residential' },
      'faisal town': { normalized: 'Faisal Town', area: 'Faisal Town', type: 'residential' },
      'wapda town': { normalized: 'Wapda Town', area: 'Wapda Town', type: 'residential' },
      'bahria town': { normalized: 'Bahria Town', area: 'Bahria Town', type: 'residential' },
      'askari': { normalized: 'Askari', area: 'Askari', type: 'residential' },
      'cantt': { normalized: 'Lahore Cantt', area: 'Cantt', type: 'residential' },
      'mall road': { normalized: 'Mall Road', area: 'Mall Road', type: 'commercial' },
      'canal bank': { normalized: 'Canal Bank', area: 'Canal Bank', type: 'residential' }
    };

    for (const [key, value] of Object.entries(commonAreas)) {
      if (lowerText.includes(key)) {
        return {
          original: text,
          normalized: value.normalized,
          area: value.area,
          phase: '',
          type: value.type,
          confidence: 0.8
        };
      }
    }

    // Default fallback
    return {
      original: text,
      normalized: normalized,
      area: 'Unknown',
      phase: '',
      type: 'unknown',
      confidence: 0.3
    };
  }

  // Smart Suggestions
  async getOptimalPickupPoints(driverRoute, riderLocation) {
    try {
      const response = await fetch(`${this.baseURL}/ai/pickup-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          driverRoute,
          riderLocation,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get pickup suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get pickup suggestions error:', error);
      // Return basic suggestions as fallback
      return this.getBasicPickupSuggestions(driverRoute, riderLocation);
    }
  }

  getBasicPickupSuggestions(driverRoute, riderLocation) {
    // Simple rule-based pickup point suggestions
    const suggestions = [];
    
    // Check if rider location is along the route
    if (driverRoute.includes(riderLocation)) {
      suggestions.push({
        location: riderLocation,
        type: 'exact_match',
        confidence: 0.9,
        reason: 'Rider location is directly on driver route'
      });
    }

    // Suggest nearby landmarks
    const nearbyLandmarks = this.findNearbyLandmarks(riderLocation);
    suggestions.push(...nearbyLandmarks);

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  findNearbyLandmarks(location) {
    // Simple mapping of locations to nearby landmarks
    const landmarkMap = {
      'DHA Phase 1': ['DHA Phase 1 Gate', 'DHA Phase 1 Market'],
      'DHA Phase 2': ['DHA Phase 2 Gate', 'DHA Phase 2 Market'],
      'Gulberg III': ['Gulberg III Market', 'Gulberg III Park'],
      'Model Town': ['Model Town Market', 'Model Town Park'],
      'FCC University': ['FCC University Gate', 'FCC University Parking']
    };

    const landmarks = landmarkMap[location] || [];
    return landmarks.map(landmark => ({
      location: landmark,
      type: 'nearby_landmark',
      confidence: 0.7,
      reason: `Nearby landmark to ${location}`
    }));
  }

  // Journey Time Estimation
  async estimateJourneyTime(origin, destination, time = null) {
    try {
      const response = await fetch(`${this.baseURL}/ai/estimate-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          origin,
          destination,
          time: time || new Date().toISOString(),
          timezone: 'Asia/Karachi'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to estimate journey time');
      }

      return await response.json();
    } catch (error) {
      console.error('Estimate journey time error:', error);
      // Return basic estimation as fallback
      return this.getBasicTimeEstimation(origin, destination);
    }
  }

  getBasicTimeEstimation(origin, destination) {
    // Simple rule-based time estimation
    const baseTimes = {
      'DHA Phase 1': 25,
      'DHA Phase 2': 23,
      'DHA Phase 3': 20,
      'DHA Phase 4': 18,
      'DHA Phase 5': 15,
      'Gulberg III': 12,
      'Gulberg IV': 10,
      'Model Town': 8,
      'FCC University': 0
    };

    const originTime = baseTimes[origin] || 15;
    const destTime = baseTimes[destination] || 15;
    const estimatedTime = Math.abs(originTime - destTime);

    return {
      estimatedMinutes: estimatedTime,
      confidence: 0.6,
      factors: ['distance', 'traffic_patterns'],
      note: 'Basic estimation based on area distances'
    };
  }

  // Pattern Recognition
  async analyzeUserPatterns(userId) {
    try {
      const response = await fetch(`${this.baseURL}/ai/patterns/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze user patterns');
      }

      return await response.json();
    } catch (error) {
      console.error('Analyze user patterns error:', error);
      throw error;
    }
  }

  async predictLikelyDestinations(userId, pickupLocation, time) {
    try {
      const response = await fetch(`${this.baseURL}/ai/predict-destinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId,
          pickupLocation,
          time,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to predict destinations');
      }

      return await response.json();
    } catch (error) {
      console.error('Predict destinations error:', error);
      // Return basic predictions as fallback
      return this.getBasicDestinationPredictions(pickupLocation, time);
    }
  }

  getBasicDestinationPredictions(pickupLocation, time) {
    const hour = new Date(time).getHours();
    const predictions = [];

    // Morning patterns (7-10 AM): Residential → Universities
    if (hour >= 7 && hour <= 10) {
      if (pickupLocation.includes('DHA') || pickupLocation.includes('Gulberg')) {
        predictions.push({
          destination: 'FCC University',
          confidence: 0.8,
          reason: 'Morning commute to university'
        });
      }
    }

    // Evening patterns (3-7 PM): Universities → Residential
    if (hour >= 15 && hour <= 19) {
      if (pickupLocation.includes('FCC')) {
        predictions.push(
          {
            destination: 'DHA Phase 1',
            confidence: 0.7,
            reason: 'Evening return to residential area'
          },
          {
            destination: 'Gulberg III',
            confidence: 0.6,
            reason: 'Evening return to residential area'
          }
        );
      }
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  // Utility Methods
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // AI Usage Documentation
  getAIUsageSummary() {
    return {
      features: [
        'Location parsing and normalization',
        'Route matching and recommendations',
        'Journey time estimation',
        'Pattern recognition',
        'Destination prediction',
        'Optimal pickup point suggestions'
      ],
      models: this.openaiApiKey ? ['OpenAI GPT-3.5-turbo'] : ['Rule-based fallback'],
      endpoints: [
        '/api/ai/recommendations',
        '/api/ai/match',
        '/api/ai/pickup-suggestions',
        '/api/ai/estimate-time',
        '/api/ai/patterns/:userId',
        '/api/ai/predict-destinations'
      ]
    };
  }
}

export default new AIService(); 