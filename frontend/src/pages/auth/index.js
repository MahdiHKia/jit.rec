import { Container, Text } from '@mantine/core';

import AuthRoutes from '../../routes/authRotes';

export function AuthPage() {
  return (
    <Container size={420} my={40}>
      <Text
        variant="gradient"
        size="xl"
        gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
        align="center"
        weight={'bolder'}
      >
        Welcome to jit.rec
      </Text>
      <AuthRoutes />
    </Container>
  );
}
