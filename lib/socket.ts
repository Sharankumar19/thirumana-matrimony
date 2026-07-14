import type { Server as SocketIOServer } from 'socket.io';

type IO = SocketIOServer | null;

const globalForIO = globalThis as unknown as { _socketIO?: IO };

export function setIO(io: SocketIOServer) {
  globalForIO._socketIO = io;
}

export function getIO(): IO {
  return globalForIO._socketIO ?? null;
}

export function emitToUser(userId: number, event: string, data: unknown) {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
