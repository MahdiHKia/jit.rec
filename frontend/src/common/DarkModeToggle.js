import { Button, Center, SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { MoonStars, Sun } from 'tabler-icons-react';

export function DarkModeSegmentedToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <SegmentedControl
      size="xs"
      data={[
        {
          value: 'light',
          label: (
            <Center>
              <Sun />
              Light
            </Center>
          ),
        },
        {
          value: 'dark',
          label: (
            <Center>
              <MoonStars />
              Dark
            </Center>
          ),
        },
      ]}
      value={colorScheme}
      onChange={(value) => toggleColorScheme(value)}
    />
  );
}

export function DarkModeButtonToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Button variant="default" onClick={() => toggleColorScheme()}>
      <Center>
        {colorScheme === 'dark' ? (
          <>
            <Sun />
          </>
        ) : (
          <>
            <MoonStars />
          </>
        )}
      </Center>
    </Button>
  );
}
