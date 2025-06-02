export type SignInFormData = {
  email: string
  password: string
}

export type SignUpFormData = {
  email: string
  password: string
  username: string
  full_name?: string
}

export type ResetPasswordFormData = {
  email: string
}

export type UpdatePasswordFormData = {
  password: string
}

export type AuthError = {
  message: string
}