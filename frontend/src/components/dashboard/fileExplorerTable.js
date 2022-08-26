import { ActionIcon, Anchor, Center, Table, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Check, Clipboard, Edit, Folder, Trash, Video } from 'tabler-icons-react';

import dashBoardApi from '../../api/dashboardApi';
import { useDeleteModal, useItemModalForm } from '../../components/dashboard/Modals';

function FolderRow({ rowData, onRename, onDelete }) {
  const [renameFolderModal, setOpenRenameFolderModal] = useItemModalForm({
    actionType: 'Rename',
    itemName: 'Folder',
    onSubmit: onRename,
    defaultValue: rowData.title,
    resetOnSubmit: false,
  });

  const [deleteFolderModal, setOpenDeleteFolderModal] = useDeleteModal({
    itemName: rowData.title,
    itemType: 'Folder',
    onSubmit: onDelete,
  });

  return (
    <tr>
      <td>
        <Anchor href={`#${rowData.id}`}>
          <Center inline>
            <Folder />
            <Text ml="xs">{rowData.title}</Text>
          </Center>
        </Anchor>
      </td>
      <td>
        <Center>
          {deleteFolderModal}
          <ActionIcon
            mr="xs"
            variant="filled"
            size={30}
            color="red"
            onClick={() => setOpenDeleteFolderModal(true)}
          >
            <Trash size={20} />
          </ActionIcon>
        </Center>
      </td>
      <td>
        <Center>
          {renameFolderModal}
          <ActionIcon
            mr="xs"
            variant="filled"
            size={30}
            color="yellow"
            onClick={() => setOpenRenameFolderModal(true)}
          >
            <Edit size={20} />
          </ActionIcon>
        </Center>
      </td>
      <td></td>
    </tr>
  );
}

function RecordingRow({ rowData, onRename, onDelete }) {
  const clipboard = useClipboard({ timeout: 500 });
  const [renameRecordingModal, setOpenRenameRecordingModal] = useItemModalForm({
    actionType: 'Rename',
    itemName: 'Recording',
    onSubmit: onRename,
    defaultValue: rowData.title,
    resetOnSubmit: false,
  });
  const [deleteRecordingModal, setOpenDeleteRecordingModal] = useDeleteModal({
    itemName: rowData.title,
    itemType: 'Recording',
    onSubmit: onDelete,
  });

  return (
    <tr key={`file-row-${rowData.id}`}>
      <td key={`file-row-link-${rowData.id}`}>
        <Anchor variant={rowData.download_url ? 'link' : 'text'} href={rowData.download_url} target="_blank">
          <Center inline>
            <Video />
            <Text ml="xs">{rowData.title}</Text>
          </Center>
        </Anchor>
      </td>
      <td>
        <Center>
          {deleteRecordingModal}
          <ActionIcon
            mr="xs"
            variant="filled"
            size={30}
            color="red"
            onClick={() => setOpenDeleteRecordingModal(true)}
          >
            <Trash size={20} />
          </ActionIcon>
        </Center>
      </td>
      <td>
        <Center>
          {renameRecordingModal}
          <ActionIcon
            mr="xs"
            variant="filled"
            size={30}
            color="yellow"
            onClick={() => setOpenRenameRecordingModal(true)}
          >
            <Edit size={20} />
          </ActionIcon>
        </Center>
      </td>
      <td>
        <Center>
          <ActionIcon variant="filled" color={'teal'} onClick={() => clipboard.copy(rowData.record_url)}>
            {clipboard.copied ? <Check size={16} /> : <Clipboard size={16} />}
          </ActionIcon>
        </Center>
      </td>
    </tr>
  );
}

export default function FileExplorerTable({ tableData, setTableData, directoryId }) {
  const updateItem = (key, id, data) =>
    setTableData((prevTableData) => ({
      ...prevTableData,
      [key]: prevTableData[key].map((item) => (item.id === id ? { ...item, ...data } : item)),
    }));
  const removeItem = (key, id) =>
    setTableData((prevTableData) => ({
      ...prevTableData,
      [key]: prevTableData[key].filter((item) => item.id !== id),
    }));

  const directories = tableData?.children.map((item) => (
    <FolderRow
      key={`folder-row-${item.id}`}
      rowData={item}
      onRename={({ title }) =>
        dashBoardApi
          .renameDirectory(item.id, title)
          .then(() => updateItem('children', item.id, { title: title }))
      }
      onDelete={() => dashBoardApi.deleteDirectory(item.id).then(() => removeItem('children', item.id))}
    />
  ));
  const recordings = tableData?.recordings.map((item) => (
    <RecordingRow
      key={`rec-row-${item.id}`}
      rowData={item}
      onRename={({ title }) =>
        dashBoardApi
          .renameRecording(directoryId, item.id, title)
          .then(() => updateItem('recordings', item.id, { title: title }))
      }
      onDelete={() =>
        dashBoardApi.deleteRecording(directoryId, item.id).then(() => removeItem('recordings', item.id))
      }
    />
  ));
  return (
    <Table striped highlightOnHover>
      <thead>
        <tr>
          <th style={{ width: '85%' }}>Title</th>
          <th>Delete</th>
          <th>Rename</th>
          <th>Copy URL</th>
        </tr>
      </thead>
      <tbody>
        {directories}
        {recordings}
      </tbody>
    </Table>
  );
}
