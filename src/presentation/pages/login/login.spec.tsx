import {
  render,
  RenderResult,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import Login from './login';
import { ValidationStub } from '@/presentation/test/';
import faker from 'faker';

type SutTypes = {
  sut: RenderResult;
  validationStub: ValidationStub;
};

const makeSut = (): SutTypes => {
  const validationStub = new ValidationStub();
  validationStub.errorMessage = faker.random.words();
  const sut = render(<Login validation={validationStub} />);
  return {
    sut,
    validationStub,
  };
};

describe('Login component', () => {
  afterEach(cleanup);

  test('should start with initial state', () => {
    const { sut, validationStub } = makeSut();
    const errorWrap = sut.getByTestId('error-wrap');
    expect(errorWrap.childElementCount).toBe(0);
    const submitButton = sut.getByTestId('submit') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
    const emailStatus = sut.getByTestId('email-status');
    expect(emailStatus.title).toBe(validationStub.errorMessage);
    expect(emailStatus.textContent).toBe('🔴');
    const passwordStatus = sut.getByTestId('password-status');
    expect(passwordStatus.title).toBe(validationStub.errorMessage);
    expect(passwordStatus.textContent).toBe('🔴');
  });

  // test('should call Validation with correct email', () => {
  //   const { sut, validationSpy } = makeSut();
  //   const emailInput = sut.getByTestId('email');
  //   const email = faker.internet.email();
  //   fireEvent.input(emailInput, { target: { value: email } });
  //   expect(validationSpy.fieldName).toBe('email');
  //   expect(validationSpy.fieldValue).toBe(email);
  // });

  // test('should call Validation with correct password', () => {
  //   const { sut, validationSpy } = makeSut();
  //   const passwordInput = sut.getByTestId('password');
  //   const password = faker.internet.password();
  //   fireEvent.input(passwordInput, { target: { value: password } });
  //   expect(validationSpy.fieldName).toBe('password');
  //   expect(validationSpy.fieldValue).toBe(password);
  // });

  test('should show email error if Validation fails', () => {
    const { sut, validationStub } = makeSut();
    const emailInput = sut.getByTestId('email');
    fireEvent.input(emailInput, { target: { value: faker.internet.email() } });
    const emailStatus = sut.getByTestId('email-status');
    expect(emailStatus.title).toBe(validationStub.errorMessage);
    expect(emailStatus.textContent).toBe('🔴');
  });

  test('should show password error if Validation fails', () => {
    const { sut, validationStub } = makeSut();
    const passwordInput = sut.getByTestId('password');
    fireEvent.input(passwordInput, {
      target: { value: faker.internet.password() },
    });
    const passwordStatus = sut.getByTestId('password-status');
    expect(passwordStatus.title).toBe(validationStub.errorMessage);
    expect(passwordStatus.textContent).toBe('🔴');
  });
});
