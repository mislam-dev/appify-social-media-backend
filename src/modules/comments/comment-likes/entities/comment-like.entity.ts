import { User } from '../../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Comment } from '../../entities/comment.entity';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryColumn()
  comment_id: string;

  @PrimaryColumn()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Comment, (comment) => comment.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
