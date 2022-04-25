import { useDispatch } from 'react-redux';
import { Button, Center, Image, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import authApi from '../../api/authApi';
import CardForm from '../../common/CardForm';
import FloatingLabelInput from '../../common/FloatingLabelInput';
import logo from '../../media/logo.svg';
import { userDataActions } from '../../store/userDataSlice';

export default function LoginForm() {
  const dispatch = useDispatch();
  const loginForm = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleLogin = ({ email, password }) => {
    dispatch(userDataActions.setLoading(true));
    authApi
      .login(email, password)
      .then((res) => dispatch(userDataActions.login(res.data)))
      .catch((err) => {
        if (err.response.status === 403)
          showNotification({
            color: 'red',
            title: 'Error',
            message: 'Provided email of password is wrong',
          });
      })
      .finally(() => dispatch(userDataActions.setLoading(false)));
  };
  return (
    <CardForm
      onSubmit={loginForm.onSubmit(handleLogin)}
      head={
        <Center>
          <Image src={logo} width={120} />
        </Center>
      }
      inputs={
        <>
          <FloatingLabelInput
            InputComponent={TextInput}
            label="Email"
            required
            {...loginForm.getInputProps('email')}
          />
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="Password"
            required
            {...loginForm.getInputProps('password')}
          />
        </>
      }
      actions={
        <>
          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </>
      }
    />
  );
}
