import { Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';

import { useModalForm } from '../../hooks/Modals';

export function useItemModalForm({
  actionType,
  itemName,
  onSubmit,
  defaultValue = '',
  resetOnSubmit = true,
}) {
  const newItemForm = useForm({
    initialValues: {
      title: defaultValue,
    },
  });

  const handleSubmit = () => onSubmit(newItemForm.values).then(resetOnSubmit ? newItemForm.reset : () => {});
  return useModalForm({
    title: `${actionType} ${itemName}`,
    onSubmit: handleSubmit,
    body: (
      <>
        <TextInput
          autoFocus={true}
          label={`${itemName} Name`}
          placeholder={`${itemName} Name`}
          {...newItemForm.getInputProps('title')}
        />
      </>
    ),
  });
}

export function useDeleteModal({ itemName, itemType, onSubmit }) {
  return useModalForm({
    title: `Delete ${itemType}`,
    onSubmit: onSubmit,
    body: (
      <Text>
        Are you sure you want to delete "{itemName}" {itemType}?
      </Text>
    ),
    confirmText: 'YES',
    confirmColor: 'red',
    cancelText: 'NO',
    cancelColor: 'blue',
  });
}
