class CannotJoinGameError extends Error {
  constructor(msg?: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CannotJoinGameError.prototype);
  }
}

export default CannotJoinGameError;
