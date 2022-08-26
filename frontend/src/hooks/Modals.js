import { useState } from 'react';
import { Button, Group, LoadingOverlay, Modal, Stack } from '@mantine/core';

export function useModalForm({
  title,
  body,
  onSubmit,
  confirmText = 'Confirm',
  confirmColor = 'blue',
  cancelText = 'Cancel',
  cancelColor = 'red',
}) {
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    onSubmit(event).finally(() => {
      setLoading(false);
      setOpened(false);
    });
  };
  const handleCancel = (event) => {
    event.preventDefault();
    setOpened(false);
  };
  const modal = (
    <Modal
      overlayOpacity={0.1}
      overlayBlur={3}
      opened={opened}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      onClose={() => setOpened(false)}
      title={title}
    >
      <LoadingOverlay visible={loading}></LoadingOverlay>
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">{body}</Stack>
        <Group spacing="md" mt="lg" position="right">
          <Button onClick={handleCancel} color={cancelColor}>
            {cancelText}
          </Button>
          <Button type="submit" color={confirmColor}>
            {confirmText}
          </Button>
        </Group>
      </form>
    </Modal>
  );
  return [modal, setOpened];
}
