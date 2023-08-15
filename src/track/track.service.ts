import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateTrackDto } from './dto/create-track.dto';
import { Model, ObjectId } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileService, FileType } from '../file/file.service';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private fileService: FileService,
  ) {}

  async create(dto: CreateTrackDto, image, sound): Promise<Track> {
    const imagePath = this.fileService.createFile(FileType.IMAGE, image);
    const soundPath = this.fileService.createFile(FileType.SOUND, sound);

    const track = await this.trackModel.create({
      ...dto,
      listens: 0,
      image: imagePath,
      sound: soundPath,
    });
    return track;
  }

  async getAll(count = 3, offset = 0): Promise<Track[]> {
    const tracks = await this.trackModel.find().skip(offset).limit(count);
    return tracks;
  }

  async getOne(id: ObjectId): Promise<Track> {
    const track = (await this.trackModel.findById(id)).populate('comments');
    return track;
  }

  async search(query: string): Promise<Track[]> {
    const tracks = await this.trackModel.find({
      name: { $regex: new RegExp(query, 'i') },
    });
    return tracks;
  }

  async delete(id: ObjectId): Promise<Track> {
    const track = await this.trackModel.findByIdAndDelete(id);
    if (!track) {
      throw new HttpException('Object does not exist', HttpStatus.NOT_FOUND);
    }
    const imagePath = track.image;
    const soundPath = track.sound;
    this.fileService.removeFile(imagePath);
    this.fileService.removeFile(soundPath);

    return track;
  }

  async addComment(dto: CreateCommentDto): Promise<Comment> {
    const track = await this.trackModel.findById(dto.trackId);
    if (!track) {
      throw new NotFoundException(`Track with ID ${dto.trackId} not found`);
    }
    const comment = await this.commentModel.create({ ...dto });
    track.comments.push(comment.id);
    await track.save();
    return comment;
  }

  async listen(id: ObjectId): Promise<number> {
    const track = await this.trackModel.findById(id);
    track.listens += 1;
    track.save();
    return track.listens;
  }
}
