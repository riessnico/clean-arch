import {
  render,
  RenderResult,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import Login from './login';
import { ValidationStub } from '@/presentation/test/';
import faker from 'faker';
import { AuthenticationSpy } from '@/presentation/test/mock-authentication';
import { InvalidCredentialsError } from '@/domain/errors';

type SutTypes = {
  sut: RenderResult;
  authenticationSpy: AuthenticationSpy;
};

type SutParams = {
  validationError: string;
};

const makeSut = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub();
  const authenticationSpy = new AuthenticationSpy();
  validationStub.errorMessage = params?.validationError;
  const sut = render(
    <Login validation={validationStub} authentication={authenticationSpy} />
  );
  return {
    sut,
    authenticationSpy,
  };
};

const simulateValidSubmit = (
  sut: RenderResult,
  email = faker.internet.email(),
  password = faker.internet.password()
): void => {
  populateEmailField(sut, email);
  populatePasswordField(sut, password);
  const submitButton = sut.getByTestId('submit');
  fireEvent.click(submitButton);
};

const populateEmailField = (
  sut: RenderResult,
  email = faker.internet.email()
): void => {
  const emailInput = sut.getByTestId('email');
  fireEvent.input(emailInput, {
    target: { value: email },
  });
};

const populatePasswordField = (
  sut: RenderResult,
  password = faker.internet.password()
): void => {
  const passwordInput = sut.getByTestId('password');
  fireEvent.input(passwordInput, {
    target: { value: password },
  });
};

const simulateStatusInputForField = (
  sut: RenderResult,
  fieldName: string,
  validationError?: string
): void => {
  const emailStatus = sut.getByTestId(`${fieldName}-status`);
  expect(emailStatus.title).toBe(validationError || 'Tudo certo');
  expect(emailStatus.textContent).toBe(validationError ? '🔴' : '🟢');
};

describe('Login component', () => {
  afterEach(cleanup);

  test('should start with initial state', () => {
    const validationError = faker.random.words();
    const { sut } = makeSut({ validationError });
    const errorWrap = sut.getByTestId('error-wrap');
    expect(errorWrap.childElementCount).toBe(0);
    const submitButton = sut.getByTestId('submit') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
    simulateStatusInputForField(sut, 'email', validationError);
    simulateStatusInputForField(sut, 'password', validationError);
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
    const validationError = faker.random.words();
    const { sut } = makeSut({ validationError });
    populateEmailField(sut);
    simulateStatusInputForField(sut, 'email', validationError);
  });

  test('should show password error if Validation fails', () => {
    const validationError = faker.random.words();
    const { sut } = makeSut({ validationError });
    populatePasswordField(sut);
    simulateStatusInputForField(sut, 'password', validationError);
  });

  test('should show valid email state if Validation succeeds', () => {
    const { sut } = makeSut();
    populateEmailField(sut);
    simulateStatusInputForField(sut, 'email');
  });

  test('should show valid password state if Validation succeeds', () => {
    const { sut } = makeSut();
    populatePasswordField(sut);
    simulateStatusInputForField(sut, 'password');
  });

  test('should enable submit button if form is valid', () => {
    const { sut } = makeSut();
    populateEmailField(sut);
    populatePasswordField(sut);
    const submitButton = sut.getByTestId('submit') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  test('should show loading spinner on submit', () => {
    const { sut } = makeSut();
    simulateValidSubmit(sut);
    const spinner = sut.getByTestId('spinner');
    expect(spinner).toBeTruthy();
  });

  test('should call Authentication with correct values', () => {
    const { sut, authenticationSpy } = makeSut();
    const email = faker.internet.email();
    const password = faker.internet.password();
    simulateValidSubmit(sut, email, password);
    expect(authenticationSpy.params).toEqual({ email, password });
  });

  test('should call Authentication only once', () => {
    const { sut, authenticationSpy } = makeSut();
    simulateValidSubmit(sut);
    simulateValidSubmit(sut);
    expect(authenticationSpy.callsCount).toBe(1);
  });

  test('should not call Authentication if form is invalid', async () => {
    const validationError = faker.random.words();
    const { sut, authenticationSpy } = makeSut({ validationError });
    populateEmailField(sut);
    fireEvent.submit(sut.getByTestId('form'));
    expect(authenticationSpy.callsCount).toBe(0);
  });

  test('should present error if Authentication fails', async () => {
    const { sut, authenticationSpy } = makeSut();
    const error = new InvalidCredentialsError();
    jest
      .spyOn(authenticationSpy, 'auth')
      .mockReturnValueOnce(Promise.reject(error));
    simulateValidSubmit(sut);
    const errorWrap = sut.getByTestId('error-wrap');
    await waitFor(() => errorWrap);
    const mainError = sut.getByTestId('main-error');
    expect(mainError.textContent).toBe(error.message);
    expect(errorWrap.childElementCount).toBe(1);
  });
});
