// utils/validators.ts
export const validatePassword = (password: string) => {
  const minLength = 8;
  const maxLength = 128;

  if (password.length < minLength) return `Password must be at least ${minLength} characters.`;
  if (password.length > maxLength) return `Password must be less than ${maxLength} characters.`;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const checks = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  // Password strength: weak, medium, strong
  let strength: "Weak" | "Medium" | "Strong" = "Weak";
  if (checks >= 3) strength = "Medium";
  if (checks === 4 && password.length >= 10) strength = "Strong";

  return { error: checks < 3 ? "Password must include uppercase, lowercase, number, and special character." : null, strength };
};

export const validateName = (name: string) => {
  const trimmed = name.trim();

  if (!trimmed) return "This field is required.";

  // Allows:
  // - Letters (including accents)
  // - Spaces
  // - Hyphens
  // - Apostrophes
  // But prevents numbers, emojis, symbols, etc.
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

  if (!nameRegex.test(trimmed))
    return "Name can only contain letters, spaces, hyphens, or apostrophes.";

  if (trimmed.length < 2)
    return "Name must be at least 2 characters.";

  return null;
};


export const validateEmail = (email: string) => {
  const trimmed = email.trim();

  if (!trimmed) return "Email is required.";

  // Simple but more reliable pattern:
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!regex.test(trimmed)) return "Invalid email format.";

  return null;
};

