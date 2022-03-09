import React, { useState, useEffect } from 'react';
import Styles from './login-styles.scss';
import {
  Footer,
  Input,
  FormStatus,
  LoginHeader,
} from '@/presentation/components/';
import FormContext from '@/presentation/contexts/form/form-context';
import { Validation } from '@/presentation/protocols/validation';
import { Authentication } from '@/domain/usecases';

type Props = {
  validation?: Validation;
  authentication?: Authentication;
};

const Login: React.FC<Props> = ({ validation, authentication }: Props) => {
  const [state, setState] = useState({
    isLoading: false,
    email: '',
    password: '',
    emailError: '',
    passwordError: '',
    mainError: '',
  });

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      emailError: validation.validate('email', state.email),
      passwordError: validation.validate('password', state.password),
    }));
  }, [state.email, state.password, validation]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setState((state) => ({ ...state, isLoading: true }));
    await authentication.auth({ email: state.email, password: state.password });
  };

  return (
    <div className={Styles.login}>
      <LoginHeader />
      <FormContext.Provider value={{ state, setState }}>
        <form onSubmit={handleSubmit} className={Styles.form}>
          <h2>Login</h2>
          <Input type="email" name="email" placeholder="Digite seu email" />
          <Input
            type="password"
            name="password"
            placeholder="Digite sua senha"
          />
          <button
            disabled={!!state.emailError || !!state.passwordError}
            data-testid="submit"
            className={Styles.submit}
            type="submit"
          >
            Entrar
          </button>
          <span className={Styles.link}>Criar conta</span>
          <FormStatus />
        </form>
      </FormContext.Provider>

      <Footer />
    </div>
  );
};

export default Login;
