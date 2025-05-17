import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

// Define an interface for our sentiment analysis result
export interface SentimentResult {
  type: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  confidence: number;
  raw?: any;
}

@Injectable()
export class SentimentService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const apiKey = this.configService.get<string>("OPENROUTER_API_KEY");

    if (!apiKey) {
      throw new HttpException(
        "OpenRouter API key is not configured",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a sentiment analysis tool. Analyze the following text and respond with ONLY one of these words: POSITIVE, NEUTRAL, or NEGATIVE.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = response.data.choices[0].message.content
        .trim()
        .toUpperCase();
      let type: "POSITIVE" | "NEUTRAL" | "NEGATIVE";

      switch (result) {
        case "POSITIVE":
          type = "POSITIVE";
          break;
        case "NEGATIVE":
          type = "NEGATIVE";
          break;
        default:
          type = "NEUTRAL";
      }

      // Return sentiment result without writing to database
      // The feedback service will handle persistence
      return {
        type,
        confidence: 0.8, // Mock confidence value
        raw: response.data,
      };
    } catch (error) {
      console.error(
        "Error analyzing sentiment:",
        error.response?.data || error.message,
      );

      // Return fallback neutral sentiment if API fails
      return {
        type: "NEUTRAL",
        confidence: 0.5,
        raw: { error: error.message },
      };
    }
  }
}
