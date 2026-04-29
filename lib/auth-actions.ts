"use server"
import { signOut } from "@/auth"

export async function signOutToLogin() {
  await signOut({ redirectTo: "/login" })
}

export async function signOutToHome() {
  await signOut({ redirectTo: "/" })
}
