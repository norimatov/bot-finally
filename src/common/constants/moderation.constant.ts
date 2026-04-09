// src/modules/moderation/constants/moderation.constants.ts
export const MODERATION = {
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  
  EXPIRY: {
    HOURS: 24,
    MS: 24 * 60 * 60 * 1000
  },
  
  REJECTION_REASONS: {
    PLATE_MISMATCH: 'Avtomobil raqami mos kelmadi',
    PHOTO_NOT_CLEAR: 'Rasm aniq emas',
    DOCUMENT_INVALID: 'Tex pasport ma\'lumotlari noto\'g\'ri',
    CAR_NOT_MATCH: 'Mashina rasmi raqamga mos kelmadi',
    OTHER: 'Boshqa sabab'
  }
};