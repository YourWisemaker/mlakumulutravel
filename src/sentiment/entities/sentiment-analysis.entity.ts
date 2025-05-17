import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum SentimentType {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

@Entity("sentiment_analysis")
export class SentimentAnalysis {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: SentimentType,
    default: SentimentType.NEUTRAL,
  })
  sentiment: SentimentType;

  @Column({ type: "float", default: 0 })
  confidence: number;

  @Column({ type: "json", nullable: true })
  rawAnalysis: Record<string, any>;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
