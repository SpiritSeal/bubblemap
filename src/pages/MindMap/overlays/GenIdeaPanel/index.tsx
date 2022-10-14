import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { SimulationNodeDatum } from 'd3-force';
import { GlobalHotKeys } from 'react-hotkeys';
import { Fab } from '@mui/material';
import { MindMap, node } from '../../../../types';

const drawerWidthPercent = '20%';
// Calculate the width of the drawer based on the percentage
// of the screen width
const screenWidth = window.innerWidth;
const drawerWidth =
  screenWidth * (parseInt(drawerWidthPercent, 10) / 100) < 240
    ? 240
    : screenWidth * (parseInt(drawerWidthPercent, 10) / 100);
// const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

/* eslint-disable */
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

const [textCache, setTextCache] = React.useState<{
    [key: number]: string | undefined;
}>({});
const [datamuseCache, setDatamuseCache] = React.useState<{
    [key: number]: string[] | undefined;
}>({});
const [gpt3Cache, setGpt3Cache] = React.useState<{
    [key: number]: string[] | undefined;
}>({});

  /* eslint-disable no-console */

  const genIdeaDatamuse = async (nodeID: number, prompt: string) => {
    const genIdea = httpsCallable(functions, 'datamuse');
    const result = await genIdea({ data: prompt });
    const ideas = result.data;
    console.log('datamuse ideas', ideas);
    console.log(Array.isArray(ideas));
    // Assert ideas is an array of strings
    if (Array.isArray(ideas)) {
      // Update the idea cache with the new datamuse, and keep the gpt3 the same
        setDatamuseCache((prev) => ({ ...prev, [nodeID]: ideas }));
    }
  };

  const genIdeaGPT3 = async (nodeID: number, prompt: string) => {
    const genIdea = httpsCallable(functions, 'gpt3');
    const result = await genIdea({ data: prompt });
    const ideas = result.data;
    console.log('gpt3 ideas', ideas);
    console.log(Array.isArray(ideas));
    // Assert ideas is an array of strings
    if (Array.isArray(ideas)) {
      // Update the idea cache with the new gpt3, and keep the datamuse the same
        setGpt3Cache((prev) => ({ ...prev, [nodeID]: ideas }));
    }
  };

  // Generate Ideas has an optional parameter, 'force', which is a boolean and defaults to false
  const generateIdeas = async (
    nodeID: number,
    prompt: string,
    force = false
  ) => {
    // Print parameters
    console.log('generating ideas for nodeID: ', nodeID, ' given prompt: ', prompt);
    // If the prompt is empty, then don't do anything
    if (prompt === '') {
      return;
    }
    // Update the idea cache with the new prompt
    setTextCache((prev) => ({ ...prev, [nodeID]: prompt }));

    // Generate ideas from datamuse
    // if (ideaCache[nodeID]?.datamuse === undefined || force) {
    if (datamuseCache[nodeID] === undefined || force) {
        setDatamuseCache((prev) => ({ ...prev, [nodeID]: undefined }));
        genIdeaDatamuse(nodeID, prompt);
    }
    // }
    // Generate ideas from gpt3
    // if (ideaCache[nodeID]?.gpt3 === undefined || force) {
    if (gpt3Cache[nodeID] === undefined || force) {
        setGpt3Cache((prev) => ({ ...prev, [nodeID]: undefined }));
        genIdeaGPT3(nodeID, prompt);
    }
    // }
  };

  React.useEffect(() => {
    setInput(selectedNode.text);
    console.log('before generation');

      generateIdeas(selectedNode.id, selectedNode.text, textCache[selectedNode.id] !== selectedNode.text);
  }, [selectedNode]);

React.useEffect(() => {
    console.log('datamuse cache', datamuseCache);
}, [datamuseCache]);
React.useEffect(() => {
    console.log('gpt3 cache', gpt3Cache);
}, [gpt3Cache]);
React.useEffect(() => {
    console.log('text cache', textCache);
}, [textCache]);


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
            {datamuseCache[selectedNode.id]?.map((idea) => (
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
          {/* Otherwise, create 3 blank rows */}
            {datamuseCache[selectedNode.id] === undefined &&
            Array(3)
                .fill(0)
                .map((_, index) => (
                    <ListItem>
                        <ListItemText
                            primary="Loading..."
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
          {/* {ideaCache[selectedNode.id]?.gpt3?.map((idea) => ( */}
            {gpt3Cache[selectedNode.id]?.map((idea) => (
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
            {/* Otherwise, create 3 blank rows */}
            {/* {ideaCache[selectedNode.id]?.gpt3 === undefined && */}
            {gpt3Cache[selectedNode.id] === undefined &&
            Array(3)
                
                .fill(0)
                .map((_, index) => (
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
                ))}
          </List>
          <List sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
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
          <Divider />
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
