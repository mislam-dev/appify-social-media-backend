import { Injectable } from '@nestjs/common';

export interface PaginationMeta {
  limit: number;
  page: number;
  total: number;
}

export interface PaginationLinks {
  prev: string | null;
  next: string | null;
}

@Injectable()
export class PaginationHelper {
  meta(total: number, page: number, limit: number): PaginationMeta {
    return { total, page, limit };
  }
  links(
    path: string,
    page: number,
    limit: number,
    total: number,
  ): PaginationLinks {
    const totalPages = Math.ceil(total / limit);
    return {
      prev: page > 1 ? `${path}?page=${page - 1}&limit=${limit}` : null,
      next:
        page < totalPages ? `${path}?page=${page + 1}&limit=${limit}` : null,
    };
  }
}
