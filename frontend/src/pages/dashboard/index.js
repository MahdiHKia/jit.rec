import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';

import AppHeader from '../../components/dashboard/AppHeader';
import AppNavbar from '../../components/dashboard/AppNavBar';
import DashBoardRotes from '../../routes/dashBoardRotes';

export function DashBoardMainPage() {
  const [navBarIsOpened, setNavBarIsOpened] = useState(false);
  const location = useLocation();
  useEffect(() => setNavBarIsOpened(false), [location]);

  return (
    <AppShell
      padding="md"
      style={{ marginTop: -20 }}
      navbarOffsetBreakpoint="sm"
      fixed
      navbar={<AppNavbar navBarIsOpened={navBarIsOpened} />}
      header={<AppHeader navBarIsOpened={navBarIsOpened} setNavBarIsOpened={setNavBarIsOpened} />}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      <div>
        <DashBoardRotes />
      </div>
    </AppShell>
  );
}
