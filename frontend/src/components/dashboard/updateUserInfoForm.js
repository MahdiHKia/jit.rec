import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';

import dashBoardApi from '../../api/dashboardApi';
import CardForm from '../../common/CardForm';
import FloatingLabelInput from '../../common/FloatingLabelInput';
import { userDataActions, useUserData } from '../../store/userDataSlice';

export default function UpdateUserInfoForm() {
  const [loading, setLoading] = useState(false);
  const userData = useUserData();
  const dispatch = useDispatch();

  const updateUserInfoForm = useForm({
    initialValues: {
      first_name: userData.first_name ? userData.first_name : '',
      last_name: userData.last_name ? userData.last_name : '',
    },
  });

  const handleSubmit = ({ first_name, last_name }) => {
    setLoading(true);
    dashBoardApi
      .updateUserInfo(first_name, last_name)
      .then((res) => {
        if (res.status === 200) {
          dispatch(userDataActions.login({ first_name, last_name }));
          showNotification({
            color: 'green',
            title: 'Successful',
            message: 'User data updated Successfully',
          });
        } else
          showNotification({
            color: 'red',
            title: 'Error',
            message: `Error with code ${res.status} while updating user data`,
          });
      })
      .finally(() => setLoading(false));
  };

  return (
    <CardForm
      loading={loading}
      onSubmit={updateUserInfoForm.onSubmit(handleSubmit)}
      head={
        <Text order={3} size="xl" color="gray">
          User Data
        </Text>
      }
      inputs={
        <>
          <FloatingLabelInput
            InputComponent={TextInput}
            label="First Name"
            required
            {...updateUserInfoForm.getInputProps('first_name')}
          />
          <FloatingLabelInput
            InputComponent={TextInput}
            label="Last Name"
            required
            {...updateUserInfoForm.getInputProps('last_name')}
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
