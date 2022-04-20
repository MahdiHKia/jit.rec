import { Group, LoadingOverlay, Paper, Space, Stack } from '@mantine/core';
import PropTypes from 'prop-types';

export default function CardForm({ onSubmit, head, inputs, actions, loading = false }) {
  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading}></LoadingOverlay>
      <form onSubmit={onSubmit}>
        {head && (
          <>
            {head}
            <Space h="lg" />
          </>
        )}
        <Stack spacing="md">{inputs}</Stack>
        <Group spacing="md" mt="lg">
          {actions}
        </Group>
      </form>
    </Paper>
  );
}

CardForm.prototype = {
  onSubmit: PropTypes.func,
  head: PropTypes.element,
  inputs: PropTypes.arrayOf.element,
  actions: PropTypes.arrayOf.element,
  loading: PropTypes.bool,
};
