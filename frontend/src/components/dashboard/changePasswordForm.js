import { useState } from 'react';
import { Button, PasswordInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import dashBoardApi from '../../api/dashboardApi';
import CardForm from '../../common/CardForm';
import FloatingLabelInput from '../../common/FloatingLabelInput';

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const changePasswordForm = useForm({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    },
    validate: {
      confirm_new_password: (value, values) =>
        value !== values.new_password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = ({ old_password, new_password }) => {
    setLoading(true);
    dashBoardApi
      .changePassword(old_password, new_password)
      .then((res) => {
        if (res.status === 200) {
          showNotification({
            color: 'green',
            title: 'Successful',
            message: 'Password updated Successfully',
          });
        } else
          showNotification({
            color: 'red',
            title: 'Error',
            message: `Error with code ${res.status} while change password`,
          });
      })
      .catch((err) => {
        if (err.response.status === 403)
          showNotification({
            color: 'red',
            title: 'Error',
            message: 'Provided password is wrong',
          });
      })
      .finally(() => setLoading(false));
  };

  return (
    <CardForm
      loading={loading}
      onSubmit={changePasswordForm.onSubmit(handleSubmit)}
      head={
        <Text order={3} size="xl" color="gray">
          Change Password
        </Text>
      }
      inputs={
        <>
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="Old Password"
            required
            {...changePasswordForm.getInputProps('old_password')}
          />
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="New Password"
            required
            {...changePasswordForm.getInputProps('new_password')}
          />
          <FloatingLabelInput
            InputComponent={PasswordInput}
            label="Confirm New Password"
            required
            {...changePasswordForm.getInputProps('confirm_new_password')}
          />
        </>
      }
      actions={
        <>
          <Button type="submit">SAVE</Button>
        </>
      }
    />
  );
}
