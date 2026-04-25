import { z } from 'zod'

export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is required')
  .max(20, 'Phone number is too long')
  .regex(/^[+0-9() -]+$/, 'Phone number can only include digits, spaces, +, -, and parentheses')

// ─── AUTH ──────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ─── INQUIRY ───────────────────────────────────────────

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().min(2, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

// ─── BOOKING ───────────────────────────────────────────

export const bookingSchema = z.object({
  propertyId: z.string().cuid('Invalid property'),
  checkIn: z.coerce.date().refine((d) => d >= new Date(new Date().setHours(0,0,0,0)), {
    message: 'Check-in date cannot be in the past',
  }),
  checkOut: z.coerce.date(),
  guests: z.number().int().min(1, 'At least 1 guest required').max(20),
  phone: phoneSchema.optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().cuid(),
  reason: z.string().min(5, 'Please provide a reason').max(500),
})

// ─── PROPERTY ──────────────────────────────────────────

export const propertySchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  highlights: z.array(z.string().max(200)).max(10).optional(),
  location: z.string().min(2, 'Location is required').max(200),
  address: z.string().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pricePerNight: z.number().positive('Price must be positive').max(100000),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  amenities: z.array(z.string().max(100)).max(50).optional(),
  rules: z.array(z.string().max(300)).max(20).optional(),
})

// ─── REVIEW ────────────────────────────────────────────

export const reviewSchema = z.object({
  bookingId: z.string().cuid('Invalid booking'),
  rating: z.number().int().min(1, 'Minimum 1 star').max(5, 'Maximum 5 stars'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
  images: z.array(z.string().url()).optional(),
})

export const reviewReplySchema = z.object({
  reviewId: z.string().cuid(),
  reply: z.string().min(5, 'Reply must be at least 5 characters').max(1000),
})

// ─── INVITATION ────────────────────────────────────────

export const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN']),
})

// ─── PROFILE ───────────────────────────────────────────

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

// ─── TYPE EXPORTS ──────────────────────────────────────

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type InquiryInput = z.infer<typeof inquirySchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>
export type InvitationInput = z.infer<typeof invitationSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
