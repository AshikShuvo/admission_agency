export type UserRole = "OWNER" | "CONSULTANT" | "ACCOUNTS" | "ADMISSION" | "VISA";

export type FileStatus =
  | "FILE_OPENED"
  | "PENDING_PAYMENT_FILE_OPENING"
  | "ADMISSION_IN_PROGRESS"
  | "PENDING_PAYMENT_ADMISSION"
  | "DOCUMENTS_PENDING"
  | "APPLICATION_SUBMITTED"
  | "OFFER_LETTER_RECEIVED"
  | "ADMISSION_APPROVED"
  | "VISA_IN_PROGRESS"
  | "PENDING_PAYMENT_VISA"
  | "VISA_APPLIED"
  | "VISA_APPROVED"
  | "VISA_REJECTED"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
