class SaveEntryError extends Error {
  constructor(msg?: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, SaveEntryError.prototype);
  }
}

export default SaveEntryError;
