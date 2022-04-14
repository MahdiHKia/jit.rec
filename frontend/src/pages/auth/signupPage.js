import { Link } from 'react-router-dom';
import { Anchor, Text } from '@mantine/core';

export function SignUpPage() {
  return (
    <>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Already have an account?{' '}
        <Anchor component={Link} size="sm" to="../login">
          LogIn
        </Anchor>
      </Text>
  );
}
