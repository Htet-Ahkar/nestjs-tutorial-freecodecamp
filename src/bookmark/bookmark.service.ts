import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async getBookmarks(userId: number) {
    const bookmarks = await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });

    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return bookmark;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // get bookmark by id
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user own the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied');

    // then edit
    return this.prismaService.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // get bookmark by id
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user own the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied');

    // then delete
    return this.prismaService.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
