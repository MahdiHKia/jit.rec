import { useDispatch } from 'react-redux';
import { Button, Center, Image, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import authApi from '../../api/authApi';
import CardForm from '../../common/CardForm';
import FloatingLabelInput from '../../common/FloatingLabelInput';
import logo from '../../media/logo.svg';
import { userDataActions } from '../../store/userDataSlice';

export default function SignUpForm() {
  const dispatch = useDispatch();
  const signUpForm = useForm({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      confirmPassword: (value, values) => (value !== values.password ? 'Passwords did not match' : null),
    },
  });

  const handleLogin = ({ email, first_name, last_name, password, confirmPassword }) => {
    dispatch(userDataActions.setLoading(true));
    authApi
      .signUp(email, first_name, last_name, password)
      .then((res) => dispatch(userDataActions.login(res.data)))
      .catch((err) => {
        if (err.response.status === 400)
          showNotification({
            color: 'red',
            title: 'Error',
            message: err.response.data.message, //'Provided email of password is wrong',
          });
      })
      .finally(() => dispatch(userDataActions.setLoading(false)));
  };

  return (
    <CardForm
      onSubmit={signUpForm.onSubmit(handleLogin)}
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
            {...signUpForm.getInputProps('email')}
          />
          <FloatingLabelInput
            InputComponent={TextInput}
            label="First Name"
            required
            {...signUpForm.getInputProps('first_name')}
          />
          <FloatingLabelInput
            InputComponent={TextInput}
            label="Last Name"
            required
            {...signUpForm.getInputProps('last_name')}
          />
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="Password"
            required
            {...signUpForm.getInputProps('password')}
          />
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="Confirm Password"
            required
            {...signUpForm.getInputProps('confirmPassword')}
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
