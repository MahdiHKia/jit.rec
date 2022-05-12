import { useDispatch } from 'react-redux';
import { Burger, Button, Group, Header, Image, MediaQuery, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import PropTypes from 'prop-types';
import { Power } from 'tabler-icons-react';

import authApi from '../../api/authApi';
import { DarkModeButtonToggle, DarkModeSegmentedToggle } from '../../common/DarkModeToggle';
import logo from '../../media/logo.svg';
import { userDataActions } from '../../store/userDataSlice';

export default function AppHeader({ navBarIsOpened, setNavBarIsOpened }) {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const isPhone = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px`);

  const handleLogout = () => {
    dispatch(userDataActions.setLoading(true));
    authApi
      .logout()
      .then((res) => dispatch(userDataActions.logout()))
      .catch((err) => null)
      .finally(dispatch(userDataActions.setLoading(false)));
  };

  return (
    <Header height={60}>
      <Group position="apart" m={10}>
        <Group ml={10}>
          <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
            <Burger opened={navBarIsOpened} onClick={() => setNavBarIsOpened((o) => !o)} size="sm" />
          </MediaQuery>
          <Image src={logo} width={40} />
          <Text weight={'bold'}>jit.rec</Text>
        </Group>
        <Group>
          {isPhone ? <DarkModeSegmentedToggle /> : <DarkModeButtonToggle />}
          <Button color={'red'} onClick={handleLogout}>
            <Power size={20} />
          </Button>
        </Group>
      </Group>
    </Header>
  );
}

AppHeader.propTypes = {
  navBarIsOpened: PropTypes.bool.isRequired,
  setNavBarIsOpened: PropTypes.func.isRequired,
};
