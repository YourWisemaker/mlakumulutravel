import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Trip } from "../../trips/entities/trip.entity";
import { Tourist } from "../../tourists/entities/tourist.entity";
import { SentimentAnalysis } from "../../sentiment/entities/sentiment-analysis.entity";

@Entity("feedback")
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", default: 0 })
  rating: number;

  @Column({ type: "text" })
  comment: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Trip, (trip) => trip.feedbacks)
  trip: Trip;

  @ManyToOne(() => Tourist)
  tourist: Tourist;

  @OneToOne(() => SentimentAnalysis, { eager: true, cascade: true })
  @JoinColumn()
  sentimentAnalysis: SentimentAnalysis;
}
