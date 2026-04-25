import { describe, it, expect } from "vitest"
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  bookingSchema,
  inquirySchema,
  reviewSchema,
  propertySchema,
  cancelBookingSchema,
  invitationSchema,
  profileSchema,
  changePasswordSchema,
} from "@/lib/validations"

// ─── signupSchema ─────────────────────────────────────────
describe("signupSchema", () => {
  const validSignup = {
    name: "Test User",
    email: "test@example.com",
    phone: "+977 9800000000",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  }

  it("accepts valid signup data", () => {
    expect(() => signupSchema.parse(validSignup)).not.toThrow()
  })

  it("rejects short name", () => {
    expect(() => signupSchema.parse({ ...validSignup, name: "A" })).toThrow()
  })

  it("rejects invalid email", () => {
    expect(() => signupSchema.parse({ ...validSignup, email: "bad" })).toThrow()
  })

  it("rejects password without uppercase", () => {
    expect(() => signupSchema.parse({ ...validSignup, password: "weakpass1", confirmPassword: "weakpass1" })).toThrow()
  })

  it("rejects password without number", () => {
    expect(() => signupSchema.parse({ ...validSignup, password: "WeakPasss", confirmPassword: "WeakPasss" })).toThrow()
  })

  it("rejects mismatched passwords", () => {
    expect(() => signupSchema.parse({ ...validSignup, confirmPassword: "Different1" })).toThrow()
  })

  it("rejects password shorter than 8 chars", () => {
    expect(() => signupSchema.parse({ ...validSignup, password: "Abc1", confirmPassword: "Abc1" })).toThrow()
  })
})

// ─── loginSchema ──────────────────────────────────────────
describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(() => loginSchema.parse({ email: "user@test.com", password: "pass" })).not.toThrow()
  })

  it("rejects empty password", () => {
    expect(() => loginSchema.parse({ email: "user@test.com", password: "" })).toThrow()
  })

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "notanemail", password: "pass" })).toThrow()
  })
})

// ─── forgotPasswordSchema ─────────────────────────────────
describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "a@b.com" })).not.toThrow()
  })

  it("rejects bad email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "nope" })).toThrow()
  })
})

// ─── bookingSchema ────────────────────────────────────────
describe("bookingSchema", () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)

  const valid = {
    propertyId: "clxxxxxxxxxxxxxxxxxxxxxxxxx", // cuid-like
    checkIn: tomorrow,
    checkOut: dayAfter,
    guests: 2,
  }

  it("accepts valid booking", () => {
    expect(() => bookingSchema.parse(valid)).not.toThrow()
  })

  it("rejects 0 guests", () => {
    expect(() => bookingSchema.parse({ ...valid, guests: 0 })).toThrow()
  })

  it("rejects checkout before checkin", () => {
    expect(() => bookingSchema.parse({ ...valid, checkOut: tomorrow, checkIn: dayAfter })).toThrow()
  })
})

// ─── inquirySchema ────────────────────────────────────────
describe("inquirySchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    subject: "Question",
    message: "Hello, I have a question about this property.",
  }

  it("accepts valid inquiry", () => {
    expect(() => inquirySchema.parse(valid)).not.toThrow()
  })

  it("rejects short message", () => {
    expect(() => inquirySchema.parse({ ...valid, message: "Hi" })).toThrow()
  })
})

// ─── reviewSchema ─────────────────────────────────────────
describe("reviewSchema", () => {
  const valid = {
    bookingId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    rating: 5,
    comment: "This was an amazing stay, highly recommended!",
  }

  it("accepts valid review", () => {
    expect(() => reviewSchema.parse(valid)).not.toThrow()
  })

  it("rejects rating below 1", () => {
    expect(() => reviewSchema.parse({ ...valid, rating: 0 })).toThrow()
  })

  it("rejects rating above 5", () => {
    expect(() => reviewSchema.parse({ ...valid, rating: 6 })).toThrow()
  })
})

// ─── propertySchema ───────────────────────────────────────
describe("propertySchema", () => {
  const valid = {
    title: "Beautiful Villa",
    description: "A stunning villa overlooking the valley with incredible views.",
    location: "Pokhara, Nepal",
    pricePerNight: 150,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
  }

  it("accepts valid property", () => {
    expect(() => propertySchema.parse(valid)).not.toThrow()
  })

  it("rejects negative price", () => {
    expect(() => propertySchema.parse({ ...valid, pricePerNight: -1 })).toThrow()
  })

  it("rejects 0 max guests", () => {
    expect(() => propertySchema.parse({ ...valid, maxGuests: 0 })).toThrow()
  })
})

// ─── cancelBookingSchema ──────────────────────────────────
describe("cancelBookingSchema", () => {
  it("accepts valid cancellation", () => {
    expect(() => cancelBookingSchema.parse({ bookingId: "clxxxxxxxxxxxxxxxxxxxxxxxxx", reason: "Plans changed" })).not.toThrow()
  })

  it("rejects short reason", () => {
    expect(() => cancelBookingSchema.parse({ bookingId: "clxxx", reason: "No" })).toThrow()
  })
})

// ─── invitationSchema ─────────────────────────────────────
describe("invitationSchema", () => {
  it("accepts OWNER role", () => {
    expect(() => invitationSchema.parse({ email: "owner@test.com", role: "OWNER" })).not.toThrow()
  })

  it("rejects GUEST role", () => {
    expect(() => invitationSchema.parse({ email: "owner@test.com", role: "GUEST" })).toThrow()
  })
})

// ─── profileSchema ────────────────────────────────────────
describe("profileSchema", () => {
  it("accepts valid profile", () => {
    expect(() => profileSchema.parse({ name: "John", phone: "+977" })).not.toThrow()
  })

  it("rejects short name", () => {
    expect(() => profileSchema.parse({ name: "J" })).toThrow()
  })
})

// ─── changePasswordSchema ─────────────────────────────────
describe("changePasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "OldPass1",
        newPassword: "NewPass1",
        confirmNewPassword: "WrongPass",
      })
    ).toThrow()
  })
})
