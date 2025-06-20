import { ChatMode } from '../config';

export const DOCUMENT_UPLOAD_CONFIG = {
    ACCEPTED_TYPES: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],
    },
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.md'],
} as const;

export const GEMINI_MODELS = [
    ChatMode.GEMINI_2_0_FLASH,
    ChatMode.GEMINI_2_0_FLASH_LITE,
    ChatMode.GEMINI_2_5_FLASH_LITE,
    ChatMode.GEMINI_2_5_FLASH,
    ChatMode.GEMINI_2_5_PRO,
] as const;
