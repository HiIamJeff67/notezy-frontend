export interface Exception {
  code: number;
  prefix: string;
  message: string;
  status: number;
  details: string;
  error: string;
}

export interface Response {
  success: boolean;
  data: any; // a map from string to string with GIN form
  exception: Exception;
}
