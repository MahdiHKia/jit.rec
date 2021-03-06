import { ColorSchemeProvider, Image, LoadingOverlay, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { NotificationsProvider } from '@mantine/notifications';

import logo from './media/logo_anim.svg';
import { useUserDataLoading } from './store/userDataSlice';
import Router from './routes';

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'color_scheme',
    defaultValue: 'light',
  });
  const toggleColorScheme = (value) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  const userDataLoading = useUserDataLoading();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme, fontFamily: 'Arial, sans-serif' }} withGlobalStyles>
        <NotificationsProvider position="bottom-center">
          <LoadingOverlay
            loader={<Image src={logo} width={100} />}
            visible={userDataLoading}
            overlayOpacity={0.95}
          />
          <Router />
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
