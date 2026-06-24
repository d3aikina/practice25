import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      (req as any)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          message: 'Ошибка валидации',
          errors: err.flatten().fieldErrors,
        });
      }
      next(err);
    }
  };
}
