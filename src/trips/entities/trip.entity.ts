import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Tourist } from "../../tourists/entities/tourist.entity";
import { Feedback } from "../../feedback/entities/feedback.entity";

@Entity("trips")
export class Trip {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("datetime")
  startDateTime: Date;

  @Column("datetime")
  endDateTime: Date;

  @Column("json")
  tripDestination: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => Tourist, (tourist) => tourist.trips)
  tourist: Tourist;

  @OneToMany(() => Feedback, (feedback) => feedback.trip)
  feedbacks: Feedback[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
