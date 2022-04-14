import { Link } from 'react-router-dom';
import { Anchor, Text } from '@mantine/core';

export function LoginPage() {
  return (
    <>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor component={Link} size="sm" to="../signup">
          Create account
        </Anchor>
      </Text>
    </>
  );
}
