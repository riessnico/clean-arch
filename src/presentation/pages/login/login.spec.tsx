import {
  render,
  RenderResult,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Login from './login';
import { ValidationStub } from '@/presentation/test/';
import faker from 'faker';
import 'jest-localstorage-mock';
import { AuthenticationSpy } from '@/presentation/test/mock-authentication';
import { InvalidCredentialsError } from '@/domain/errors';

type SutTypes = {
  sut: RenderResult;
  authenticationSpy: AuthenticationSpy;
};

type SutParams = {
  validationError: string;
};

const history = createMemoryHistory({ initialEntries: ['/login'] });

const makeSut = (params?: SutParams): SutTypes => {
  const validationStub = new ValidationStub();
  const authenticationSpy = new AuthenticationSpy();
  validationStub.errorMessage = params?.validationError;
  const sut = render(
    <Router history={history}>
      <Login validation={validationStub} authentication={authenticationSpy} />
    </Router>
  );
  return {
    sut,
    authenticationSpy,
  };
};

const simulateValidSubmit = async (
  sut: RenderResult,
  email = faker.internet.email(),
  password = faker.internet.password()
): Promise<void> => {
  populateEmailField(sut, email);
  populatePasswordField(sut, password);
  const form = sut.getByTestId('form');
  fireEvent.submit(form);
  await waitFor(() => form);
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

const testStatusInputForField = (
  sut: RenderResult,
  fieldName: string,
  validationError?: string
): void => {
  const emailStatus = sut.getByTestId(`${fieldName}-status`);
  expect(emailStatus.title).toBe(validationError || 'Tudo certo');
  expect(emailStatus.textContent).toBe(validationError ? '????' : '????');
};

const testErrorWrapChildCount = (sut: RenderResult, count: number): void => {
  const errorWrap = sut.getByTestId('error-wrap');
  expect(errorWrap.childElementCount).toBe(count);
};

const testElementExists = (sut: RenderResult, fieldName: string): void => {
  const el = sut.getByTestId(fieldName);
  expect(el).toBeTruthy();
};

const testButtonIsDisabled = (
  sut: RenderResult,
  fieldName: string,
  isDisabled: boolean
): void => {
  const button = sut.getByTestId(fieldName) as HTMLButtonElement;
  expect(button.disabled).toBe(isDisabled);
};

const testElementText = (
  sut: RenderResult,
  fieldName: string,
  text: string
): void => {
  const el = sut.getByTestId(fieldName);
  expect(el.textContent).toBe(text);
};

describe('Login component', () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
  });

  test('should start with initial state', () => {
    const validationError = faker.random.words();
    const { sut } = makeSut({ validationError });
    testErrorWrapChildCount(sut, 0);
    testButtonIsDisabled(sut, 'submit', true);
    testStatusInputForField(sut, 'email', validationError);
    testStatusInputForField(sut, 'password', validationError);
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
    testStatusInputForField(sut, 'email', validationError);
  });

  test('should show password error if Validation fails', () => {
    const validationError = faker.random.words();
    const { sut } = makeSut({ validationError });
    populatePasswordField(sut);
    testStatusInputForField(sut, 'password', validationError);
  });

  test('should show valid email state if Validation succeeds', () => {
    const { sut } = makeSut();
    populateEmailField(sut);
    testStatusInputForField(sut, 'email');
  });

  test('should show valid password state if Validation succeeds', () => {
    const { sut } = makeSut();
    populatePasswordField(sut);
    testStatusInputForField(sut, 'password');
  });

  test('should enable submit button if form is valid', () => {
    const { sut } = makeSut();
    populateEmailField(sut);
    populatePasswordField(sut);
    testButtonIsDisabled(sut, 'submit', false);
  });

  test('should show loading spinner on submit', async () => {
    const { sut } = makeSut();
    await simulateValidSubmit(sut);
    testElementExists(sut, 'spinner');
  });

  test('should call Authentication with correct values', async () => {
    const { sut, authenticationSpy } = makeSut();
    const email = faker.internet.email();
    const password = faker.internet.password();
    await simulateValidSubmit(sut, email, password);
    expect(authenticationSpy.params).toEqual({ email, password });
  });

  test('should call Authentication only once', async () => {
    const { sut, authenticationSpy } = makeSut();
    await simulateValidSubmit(sut);
    await simulateValidSubmit(sut);
    expect(authenticationSpy.callsCount).toBe(1);
  });

  test('should not call Authentication if form is invalid', async () => {
    const validationError = faker.random.words();
    const { sut, authenticationSpy } = makeSut({ validationError });
    await simulateValidSubmit(sut);
    expect(authenticationSpy.callsCount).toBe(0);
  });

  test('should present error if Authentication fails', async () => {
    const { sut, authenticationSpy } = makeSut();
    const error = new InvalidCredentialsError();
    jest
      .spyOn(authenticationSpy, 'auth')
      .mockReturnValueOnce(Promise.reject(error));
    await simulateValidSubmit(sut);
    testElementText(sut, 'main-error', error.message);
    testErrorWrapChildCount(sut, 1);
  });

  test('should add access token to localStorage on success', async () => {
    const { sut, authenticationSpy } = makeSut();
    await simulateValidSubmit(sut);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'accessToken',
      authenticationSpy.account.accessToken
    );
    expect(history.length).toBe(1);
    expect(history.location.pathname).toBe('/');
  });

  test('should got to signup page', () => {
    const { sut } = makeSut();
    const signup = sut.getByTestId('signup');
    fireEvent.click(signup);
    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe('/signup');
  });
});
