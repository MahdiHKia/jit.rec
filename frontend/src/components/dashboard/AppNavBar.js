import { Link, NavLink } from 'react-router-dom';
import { Avatar, createStyles, Divider, Group, Navbar, Text } from '@mantine/core';
import PropTypes from 'prop-types';
import { Settings, Video } from 'tabler-icons-react';

import { useUserData } from '../../store/userDataSlice';
import { emailToUserName } from '../../utils';
const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    navbar: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.25)
            : theme.colors[theme.primaryColor][0],
        color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 7],
        [`& .${icon}`]: {
          color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 7],
        },
      },
    },
  };
});

export default function AppNavbar({ navBarIsOpened }) {
  const { classes, cx } = useStyles();
  const userData = useUserData();
  let userName = userData?.email ? emailToUserName(userData.email) : '';
  if (userData?.first_name || userData?.last_name) userName = `${userData.first_name} ${userData.last_name}`;
  return (
    <Navbar
      className={cx(classes.navbar)}
      width={{ sm: 300 }}
      p="md"
      hiddenBreakpoint="sm"
      hidden={!navBarIsOpened}
    >
      <Navbar.Section>
        <Group spacing="sm">
          <Link to="settings">
            <Avatar size={40} src={userData?.avatar} radius={40} />
          </Link>
          <div>
            <Text
              transform="capitalize"
              variant="gradient"
              size="md"
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              weight={'bolder'}
            >
              {userName}
            </Text>
            <Text size="xs" color="dimmed">
              {userData?.email}
            </Text>
          </div>
        </Group>
        <Divider my="sm" />
      </Navbar.Section>

      <Navbar.Section>
        <NavLink
          className={({ isActive }) => cx(classes.link, { [classes.linkActive]: isActive })}
          to="myRecordings"
        >
          <Video className={classes.linkIcon} />
          My Recordings
        </NavLink>
        <NavLink
          className={({ isActive }) => cx(classes.link, { [classes.linkActive]: isActive })}
          to="settings"
        >
          <Settings className={classes.linkIcon} />
          Settings
        </NavLink>
      </Navbar.Section>
    </Navbar>
  );
}

AppNavbar.propTypes = {
  navBarIsOpened: PropTypes.bool.isRequired,
};
