/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse {
  status_code: number;
  message: string;
  data: object | [object];
  meta?: Record<string, string | number>;
  _links?: Record<string, string>;
}
export type DataObject = {
  data?: any;
  message?: string;
  meta?: Record<string, string | number>;
  _links?: Record<string, string>;
};

@Injectable()
export class TransformInterceptor implements NestInterceptor<any, ApiResponse> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result: DataObject) => {
        let data: any = result;
        if (result?.data && typeof result.data === 'object') {
          data = result?.data ? result.data : result;
        }

        return {
          status_code: response.statusCode,
          message: result?.message ?? 'Success',
          data,
          ...(result?.meta && { meta: result.meta }),
          ...(result?._links && { _links: result._links }),
        };
      }),
    );
  }
}
