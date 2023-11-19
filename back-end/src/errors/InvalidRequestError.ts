class InvalidRequestError extends Error {
  constructor(msg?: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidRequestError.prototype);
  }
}

export default InvalidRequestError;
