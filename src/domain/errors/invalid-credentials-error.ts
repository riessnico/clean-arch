export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenvciais Inválidas');
    this.name = 'InvalidCredentialError';
  }
}
