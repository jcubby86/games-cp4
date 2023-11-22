class AuthenticationError extends Error {
  constructor(msg?: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export default AuthenticationError;
