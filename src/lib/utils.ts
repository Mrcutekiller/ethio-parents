import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateStudentId(): string {
  const prefix = 'EPS';
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${year}${random}`;
}

export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
