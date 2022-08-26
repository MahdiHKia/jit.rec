import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ActionIcon, Anchor, Breadcrumbs, Group, LoadingOverlay, Paper } from '@mantine/core';
import { FolderPlus, VideoPlus } from 'tabler-icons-react';

import dashBoardApi from '../../api/dashboardApi';
import FileExplorerTable from '../../components/dashboard/fileExplorerTable';
import { useItemModalForm } from '../../components/dashboard/Modals';

export function MyRecordingsPage() {
  const [tableData, setTableData] = useState();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const directoryId = location.hash.substring(1) || 0;

  const [newFolderModal, setOpenNewFolderModal] = useItemModalForm({
    actionType: 'Create New',
    itemName: 'Folder',
    onSubmit: ({ title }) =>
      dashBoardApi.createDirectory(directoryId, title).then((res) => setTableData(res.data)),
  });

  const [newRecordingModal, setOpenNewRecordingModal] = useItemModalForm({
    actionType: 'Create New',
    itemName: 'Recording',
    onSubmit: ({ title }) =>
      dashBoardApi.createRecording(directoryId, title).then((res) => setTableData(res.data)),
  });

  useEffect(() => {
    setLoading(true);
    dashBoardApi
      .getDirectory(directoryId)
      .then((res) => setTableData(res.data))
      .finally(() => setLoading(false));
  }, [directoryId]);

  const breadcrumbItems = tableData?.breadcrumb.map((item, index) => (
    <Anchor href={`#${item.id}`} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <>
      <Paper withBorder shadow="md" p={30} pt={0} mt={30} radius="md" style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading}></LoadingOverlay>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>My Recordings</h1>
          <Group spacing="xs">
            {newRecordingModal}
            <ActionIcon
              onClick={() => setOpenNewRecordingModal(true)}
              variant="filled"
              size={30}
              color="teal"
            >
              <VideoPlus size={20} />
            </ActionIcon>
            {newFolderModal}
            <ActionIcon onClick={() => setOpenNewFolderModal(true)} variant="filled" size={30} color="teal">
              <FolderPlus size={20} />
            </ActionIcon>
          </Group>
        </div>
        <Breadcrumbs m="sm">{breadcrumbItems}</Breadcrumbs>
        <FileExplorerTable tableData={tableData} setTableData={setTableData} directoryId={directoryId} />
      </Paper>
    </>
  );
}
