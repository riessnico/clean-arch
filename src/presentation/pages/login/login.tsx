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

type Props = {
  validation?: Validation;
};

const Login: React.FC<Props> = ({ validation }: Props) => {
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

  return (
    <div className={Styles.login}>
      <LoginHeader />
      <FormContext.Provider value={{ state, setState }}>
        <form action="" className={Styles.form}>
          <h2>Login</h2>
          <Input type="email" name="email" placeholder="Digite seu email" />
          <Input
            type="password"
            name="password"
            placeholder="Digite sua senha"
          />
          <button
            disabled
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
