export interface NotezyException {
  code: number;
  prefix: string;
  message: string;
  status: number;
  details: string;
  error: string;
}

export interface NotezyRequest {
  header: any;
  body: any;
}

export interface NotezyResponse {
  success: boolean;
  data: any; // a map from string to string with GIN form
  exception: NotezyException;
}
