import ChangePasswordForm from '../../components/dashboard/changePasswordForm';
import UpdateUserInfoForm from '../../components/dashboard/updateUserInfoForm';

export function SettingsPage() {
  return (
    <>
      <UpdateUserInfoForm />
      <ChangePasswordForm />
    </>
  );
}
