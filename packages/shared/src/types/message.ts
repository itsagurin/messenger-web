export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: Date;
  status: string;
  sender?: User;
  receiver?: User;
}

export interface User {
  id: number;
  email: string;
}