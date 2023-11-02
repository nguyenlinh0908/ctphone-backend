import { ClientSession, Connection } from 'mongoose';

export const calculateOffset = (
  total: number,
  limit: number,
  page: number,
): { totalPages: number; offset: number } => {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return {
    totalPages,
    offset,
  };
};

export const transaction = async <T>(connection: Connection, cb: (session: ClientSession) => Promise<T>): Promise<T> => {
  const session = await connection.startSession();

  try {
    session.startTransaction();
    const result = await cb(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}