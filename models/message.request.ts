export interface Messages {
  message_id: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface MessageRequest {
  username: string;
  message: string;
}

export interface GetMessageRequest {
  offset: number;
  limit: number;
  username?: string;
  has_text?: string;
  min_timestamp?: string;
  max_timestamp?: string;
}
