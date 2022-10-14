import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CircularProgress, Fab } from '@mui/material';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { SimulationNodeDatum } from 'd3-force';
import { GlobalHotKeys } from 'react-hotkeys';
import { MindMap, node } from '../../../../types';

const drawerWidthPercent = '20%';
// Calculate the width of the drawer based on the percentage
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const PersistentDrawerRight = ({
  selectedNode,
  data,
}: {
  selectedNode: SimulationNodeDatum & node;
  data: MindMap;
}) => {
  const functions = useFunctions();

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  //   const [realNode, setRealNode] = React.useState<node | null>(null);

  // create a state to store the value of the input
  const [input, setInput] = React.useState('');

  // Create a state to cache ideas for each node
  const [ideaCache, setIdeaCache] = React.useState<{
    // The prompt (string) is the key, and the ideas generated (string[])
    [key: number]:
      | {
          text: string | undefined;
          datamuse: string[] | undefined;
          gpt3: string[] | undefined;
        }
      | undefined;
  }>({});

  /* eslint-disable no-console */

  const genIdeaDatamuse = async (nodeID: number, prompt: string) => {
    const genIdea = httpsCallable(functions, 'datamuse');
    const result = await genIdea({ data: prompt });
    const ideas = result.data;
    console.log('ideas', ideas);
    console.log(Array.isArray(ideas));
    // Assert ideas is an array of strings
    if (Array.isArray(ideas)) {
      // Update the idea cache with the new datamuse, and keep the gpt3 the same
      setIdeaCache({
        ...ideaCache,
        [nodeID]: {
          text: ideaCache[nodeID]?.text,
          datamuse: ideas,
          gpt3: ideaCache[nodeID]?.gpt3,
        },
      });
    }
  };

  const genIdeaGPT3 = async (nodeID: number, prompt: string) => {
    const genIdea = httpsCallable(functions, 'gpt3');
    const result = await genIdea({ data: prompt });
    const ideas = result.data;
    console.log('ideas', ideas);
    console.log(Array.isArray(ideas));
    // Assert ideas is an array of strings
    if (Array.isArray(ideas)) {
      // Update the idea cache with the new datamuse, and keep the gpt3 the same
      setIdeaCache({
        ...ideaCache,
        [nodeID]: {
          text: ideaCache[nodeID]?.text,
          datamuse: ideaCache[nodeID]?.datamuse,
          gpt3: ideas,
        },
      });
    }
  };

  // Generate Ideas has an optional parameter, 'force', which is a boolean and defaults to false
  const generateIdeas = async (
    nodeID: number,
    prompt: string,
    force = false
  ) => {
    // Print parameters
    console.log('nodeID: ', nodeID);
    console.log('prompt: ', prompt);
    // If the prompt is empty, then don't do anything
    if (prompt === '') {
      return;
    }
    // Update the idea cache with the new prompt
    setIdeaCache({
      ...ideaCache,
      [nodeID]: {
        text: prompt,
        // datamuse: ideaCache[nodeID]?.datamuse,
        // gpt3: ideaCache[nodeID]?.gpt3,
        datamuse: undefined,
        gpt3: undefined,
      },
    });
    // Generate ideas from datamuse
    // if (ideaCache[nodeID]?.datamuse === undefined || force) {
    genIdeaDatamuse(nodeID, prompt);
    // }
    // Generate ideas from gpt3
    // if (ideaCache[nodeID]?.gpt3 === undefined || force) {
    genIdeaGPT3(nodeID, prompt);
    // }
  };

  React.useEffect(() => {
    setInput(selectedNode.text);
    // See if we have any ideas for this node
    // log one
    console.log('one');

    // Only generate new ideas if the prompt text is different than the cached prompt
    if (ideaCache[selectedNode.id]?.text !== selectedNode.text) {
      // Generate ideas
      generateIdeas(selectedNode.id, selectedNode.text);
    }

    // if (
    //   !(
    //     ideaCache[selectedNode.id] ||
    //     // ideaCache[selectedNode.id]?.datamuse ||
    //     // ideaCache[selectedNode.id]?.gpt3
    //     ideaCache[selectedNode.id]?.text
    //   )
    // ) {
    //   generateIdeas(selectedNode.id, selectedNode.text);
    // } else if (ideaCache[selectedNode.id]?.text === selectedNode.text) {
    //   // Do nothing
    // } else {
    //   setIdeaCache({
    //     ...ideaCache,
    //     [selectedNode.id]: undefined,
    //   });
    //   generateIdeas(selectedNode.id, selectedNode.text);
    // }
    console.log('ideaCache', ideaCache);
  }, [selectedNode]);

  const shortcutHandlers = {
    TOGGLE_SIDE_MENU: handleDrawerOpen,
    GENERATE_IDEAS: () => {
      generateIdeas(selectedNode.id, selectedNode.text, true);
    },
  };

  return (
    <>
      <GlobalHotKeys handlers={shortcutHandlers} />
      <CssBaseline />
      <Fab
        variant="extended"
        sx={{
          right: 20,
          top: 20,
          position: 'fixed',
        }}
        onClick={handleDrawerOpen}
      >
        <ChevronLeftIcon />
        Idea Menu
      </Fab>
      <Drawer
        PaperProps={{
          elevation: 0,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronRightIcon />
          </IconButton>
          Idea Generation Panel
        </DrawerHeader>
        <Divider />
        <List>
          {/* Display the content of input as a centered list element with smaller, italics editable text */}
          <ListItem>
            <ListItemText
              primary={input}
              //   secondary="Editable Text"
              primaryTypographyProps={{
                variant: 'h5',
                align: 'center',
                color: 'textPrimary',
                style: { fontStyle: 'italic' },
              }}
            />
          </ListItem>
          <Divider />
          {/* List the datamuse cache for the currently selected node */}
          <ListItem>
            <ListItemText
              primary="Datamuse"
              primaryTypographyProps={{
                variant: 'h6',
                // align: 'center',
                color: 'textPrimary',
                // style: { fontStyle: 'italic' },
              }}
            />
          </ListItem>
          {ideaCache[selectedNode.id]?.datamuse?.map((idea) => (
            <ListItem>
              <ListItemText
                primary={idea}
                primaryTypographyProps={{
                  //   variant: 'h6',
                  align: 'center',
                  color: 'textPrimary',
                  style: { fontStyle: 'italic' },
                }}
              />
            </ListItem>
          ))}
          {/* Otherwise, List a centered loading icon */}
          {/* {!ideaCache[selectedNode.id]?.datamuse && (
            <ListItem>
              <ListItemText
                primary="Loading..."
                primaryTypographyProps={{
                  align: 'center',
                  color: 'textPrimary',
                  style: { fontStyle: 'italic' },
                }}
              />
            </ListItem>
          )} */}
          <Divider />
          {/* List the gpt3 cache for the currently selected node */}
          <ListItem>
            <ListItemText
              primary="GPT3"
              primaryTypographyProps={{
                variant: 'h6',
                // align: 'center',
                color: 'textPrimary',
                // style: { fontStyle: 'italic' },
              }}
            />
          </ListItem>
          {ideaCache[selectedNode.id]?.gpt3?.map((idea) => (
            <ListItem>
              <ListItemText
                primary={idea}
                primaryTypographyProps={{
                  //   variant: 'h6',
                  align: 'center',
                  color: 'textPrimary',
                  style: { fontStyle: 'italic' },
                }}
              />
            </ListItem>
          ))}
          <Divider />
          {/* Test Datamuse Button */}
          <ListItemButton
            onClick={() => {
              httpsCallable(
                functions,
                'datamuse'
              )({ data: 'test' }).then((res) => {
                console.log(res);
              });
            }}
          >
            <ListItemText primary="Test Datamuse" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              generateIdeas(selectedNode.id, selectedNode.text, true);
            }}
          >
            <ListItemText primary="Manually Regenerate Ideas" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>
    </>
    // </Box>
  );
};

export default PersistentDrawerRight;
