export interface APIErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: APIErrorDetail[];
    requestId?: string;
  };
}

export class APIError extends Error {
  public code: string;
  public details?: APIErrorDetail[];
  public requestId?: string;

  constructor(data: any, status: number) {
    let message = "Ocorreu um erro inesperado";
    let code = "UNKNOWN_ERROR";
    let details;
    let requestId;

    if (data && data.error && typeof data.error === "object") {
      message = data.error.message || message;
      code = data.error.code || code;
      details = data.error.details;
      requestId = data.error.requestId;
    } else if (data && typeof data.error === "string") {
      // Fallback for legacy format
      message = data.error;
    }

    super(message);
    this.name = "APIError";
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}
