import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TripRecommendation {
  destination: string;
  activities: string; // Keep activities as a string with numbers intact
  reason: string;
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getTripRecommendation(touristId: string): Promise<TripRecommendation> {
    // Check if tourist exists
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: touristId },
      include: { user: true },
    });

    if (!tourist) {
      throw new NotFoundException(`Tourist with ID ${touristId} not found`);
    }

    // Get all past trips for this tourist with feedback
    const trips = await this.prisma.trip.findMany({
      where: { touristId },
      include: {
        feedbacks: true,
      },
    });

    if (!trips || trips.length === 0) {
      throw new HttpException(
        'Tourist has no trip history to base recommendations on',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Format trip data for AI prompt
    const tripHistory = trips.map(trip => {
      // Format destination
      let destinationText = '';
      if (typeof trip.tripDestination === 'object') {
        const dest = trip.tripDestination as any;
        destinationText = `Location: ${dest.location || 'Unknown'}, `;
        
        if (dest.attractions && Array.isArray(dest.attractions)) {
          destinationText += `Attractions: ${dest.attractions.join(', ')}`;
        }
      } else {
        destinationText = String(trip.tripDestination);
      }

      // Format feedback
      const feedbackText = trip.feedbacks && trip.feedbacks.length > 0
        ? `Feedback: ${trip.feedbacks.map(f => `Rating: ${f.rating}/5, Comment: ${f.comment}`).join(' | ')}`
        : 'No feedback provided';

      return `
        Trip Name: ${trip.name}
        Destination: ${destinationText}
        Price: ${trip.price}
        ${feedbackText}
      `;
    }).join('\n---\n');

    // Get tourist info
    const touristInfo = `
      Tourist Name: ${tourist.user.firstName} ${tourist.user.lastName}
      Nationality: ${tourist.nationality || 'Unknown'}
      Passport: ${tourist.passportNumber || 'Unknown'}
    `;

    // Generate recommendation using OpenRouter AI
    return this.generateAIRecommendation(touristInfo, tripHistory);
  }

  private async generateAIRecommendation(
    touristInfo: string,
    tripHistory: string,
  ): Promise<TripRecommendation> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new HttpException(
        'OpenRouter API key is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo',  // Using a more reliable model that's widely available
          messages: [
            {
              role: 'system',
              content: 
                'You are a travel recommendation system for Mlaku-Mulu Travel agency. Your task is to analyze a tourist\'s trip history and preferences, and recommend a new destination that they would enjoy. Provide a recommendation in a structured format with a destination, list of suggested activities, and reason for the recommendation based on their past trips and feedback.'
            },
            {
              role: 'user',
              content: `Based on the following tourist information and their trip history, please recommend a new destination they might enjoy.

              TOURIST INFORMATION:
              ${touristInfo}

              TRIP HISTORY:
              ${tripHistory}

              Please provide your recommendation in EXACTLY the following format:
              Destination: [Specific location/city/country]
              
              Activities:
              1. [First specific activity or attraction]
              2. [Second specific activity or attraction]
              3. [Third specific activity or attraction]
              4. [Fourth specific activity or attraction]
              5. [Fifth specific activity or attraction]
              
              Reason: [Brief explanation of why this destination matches their preferences based on past trips]`
            },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Safely handle the response data
      if (!response.data || !response.data.choices || !response.data.choices.length || 
          !response.data.choices[0].message || !response.data.choices[0].message.content) {
        throw new Error('Invalid response format from OpenRouter API');
      }
      
      const result = response.data.choices[0].message.content;
      let parsedResult: TripRecommendation;
      
      // Add some debugging to identify issues
      console.log('OpenRouter API response:', JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataKeys: Object.keys(response.data || {}),
        hasChoices: Boolean(response.data?.choices),
        choicesLength: response.data?.choices?.length || 0
      }));
      
      try {
        // First try to parse as JSON
        parsedResult = JSON.parse(result);
        
        // Validate the response structure
        if (!parsedResult.destination || !parsedResult.reason) {
          console.log('Invalid JSON structure, using text extraction instead');
          parsedResult = this.extractRecommendationFromText(result);
        }
        
        // Convert activities to string format if it's an array
        if (Array.isArray(parsedResult.activities)) {
          // Format array into numbered list
          parsedResult.activities = parsedResult.activities
            .map((activity, index) => `${index + 1}. ${activity}`)
            .join('\n');
        } else if (typeof parsedResult.activities !== 'string') {
          parsedResult.activities = String(parsedResult.activities);
        }
        
        return parsedResult;
      } catch (parseError) {
        // If the result can't be parsed as JSON, try to extract key parts
        console.log('Error parsing AI response as JSON, using text extraction instead:', parseError.message);
        console.log('Raw AI response:', result);
        
        // Create a response object by extracting info from text
        return this.extractRecommendationFromText(result);
      }
    } catch (error) {
      console.error(
        'Error generating trip recommendation:',
        error.response?.data || error.message,
      );

      // Return an error message instead of a fallback recommendation
      throw new HttpException(
        'AI recommendation service is currently unavailable. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private extractRecommendationFromText(text: string): TripRecommendation {
    // Simple extraction for non-JSON responses
    const destinationMatch = text.match(/Destination:\s*([^\n]+)/i);
    
    // Improved pattern to capture the entire activities section with numbered items
    // This matches "Activities:" followed by everything until "Reason:" or end of text
    let activitiesSection = '';
    
    // Using a more compatible regex without the 's' flag
    // First try to extract everything between Activities: and Reason:
    const sectionRegex = /Activities:([\s\S]*?)(?=Reason:|$)/i;
    const fullActivitiesMatch = text.match(sectionRegex);
    
    if (fullActivitiesMatch && fullActivitiesMatch[1]) {
      activitiesSection = fullActivitiesMatch[1].trim();
      console.log('Found full activities section:', activitiesSection);
    }
    
    const reasonMatch = text.match(/Reason:\s*([^\n]+(?:\n[^\n]+)*)/i);
    
    const destination = destinationMatch ? destinationMatch[1].trim() : 'Unknown destination';
    
    // Process the activities text to replace newlines with commas
    let activities = activitiesSection || 'No activities found.';
    
    // Replace newlines with commas while preserving the numbering
    if (activities !== 'No activities found.') {
      activities = activities.replace(/\n/g, ', ');
      console.log('Activities with commas instead of newlines:', activities);
    }
    
    const reason = reasonMatch ? reasonMatch[1].trim() : 'Based on your past trips and preferences';
    
    return {
      destination,
      activities,
      reason
    };
  }
}
