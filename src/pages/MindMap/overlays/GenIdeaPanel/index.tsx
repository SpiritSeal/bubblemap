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
import { Fab, ListItemSecondaryAction } from '@mui/material';
import { SettingsSuggest } from '@mui/icons-material';
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

const PersistentDrawerRight = ({
  selectedNode,
  // eslint-disable-next-line
  data,
  addNode,
}: {
  selectedNode: SimulationNodeDatum & node;
  data: MindMap;
  addNode: ({ parent, text }: { parent: number; text: string }) => void;
}) => {
  const functions = useFunctions();

  // eslint-disable-next-line
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

  const genIdeaDatamuse = async (nodeID: number, prompt: string) => {
    const genIdea = httpsCallable(functions, 'datamuse');
    const result = await genIdea({ data: prompt });
    const ideas = result.data;
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

  // Creat a state called "initialLoad"
  const [initialLoad, setInitialLoad] = React.useState(true);

  React.useEffect(() => {
    setInput(selectedNode.text);
    if (initialLoad) {
      generateIdeas(selectedNode.id, selectedNode.text);
      setInitialLoad(false);
    } else if (open) {
      generateIdeas(
        selectedNode.id,
        selectedNode.text,
        textCache[selectedNode.id] !== selectedNode.text
      );
    }
  }, [selectedNode]);

  React.useEffect(() => {
    // console.log('datamuse cache', datamuseCache);
  }, [datamuseCache]);
  React.useEffect(() => {
    // console.log('gpt3 cache', gpt3Cache);
  }, [gpt3Cache]);
  React.useEffect(() => {
    // console.log('text cache', textCache);
  }, [textCache]);
  // When the panel is opened, generate ideas for the selected node
  React.useEffect(() => {
    if (open) {
      generateIdeas(selectedNode.id, selectedNode.text);
    }
  }, [open]);

  const handleIdeaClick = (nodeID: number, idea: string) => {
    addNode({ parent: nodeID, text: idea });
  };

  const shortcutHandlers = {
    TOGGLE_SIDE_MENU: handleDrawerOpen,
    GENERATE_IDEAS: () => {
      if (open) {
        generateIdeas(selectedNode.id, selectedNode.text, true);
      }
      if (!open) {
        handleDrawerOpen();
      }
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
                color: 'textPrimary',
              }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="settings">
                <SettingsSuggest />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {datamuseCache[selectedNode.id]?.map((idea) => (
            <ListItemButton
              onClick={() => handleIdeaClick(selectedNode.id, idea)}
            >
              <ListItemText
                primary={idea}
                primaryTypographyProps={{
                  align: 'center',
                  color: 'textPrimary',
                  style: { fontStyle: 'italic' },
                }}
              />
            </ListItemButton>
          ))}
          {datamuseCache[selectedNode.id] === undefined &&
            Array(3)
              .fill(0)
              .map(() => (
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
                color: 'textPrimary',
              }}
            />
            {/* Add a right-aligned, clickable settings gear next to the text */}
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="settings">
                <SettingsSuggest />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {gpt3Cache[selectedNode.id]?.map((idea) => (
            <ListItemButton
              onClick={() => handleIdeaClick(selectedNode.id, idea)}
            >
              <ListItemText
                primary={idea}
                primaryTypographyProps={{
                  //   variant: 'h6',
                  align: 'center',
                  color: 'textPrimary',
                  style: { fontStyle: 'italic' },
                }}
              />
            </ListItemButton>
          ))}
          {/* Otherwise, create 3 blank rows */}
          {/* {ideaCache[selectedNode.id]?.gpt3 === undefined && */}
          {gpt3Cache[selectedNode.id] === undefined &&
            Array(3)
              .fill(0)
              .map(() => (
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
          {/* Test GPT3_PARENT */}
          <ListItemButton
            onClick={() => {
              // If selected node is root, return
              if (selectedNode.id === 0) {
                return;
              }
              // Get the text of the selected node
              const { text } = selectedNode;
              // Get the id of the parent of the selected node
              const parentID = selectedNode.parent;
              // Get the text of the parent of the selected node
              // find the parent node
              const parentNode = data.nodes.find(
                (nodeF) => nodeF.id === parentID
              );
              // get the text of the parent node
              const parentText = parentNode?.text;
              httpsCallable(
                functions,
                'gpt3_parent'
              )({ data: [text, parentText] }).then((res) => {
                // eslint-disable-next-line no-console
                console.log(res);
              });
            }}
          >
            <ListItemText primary="Test GPT3_PARENT" />
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
      </Drawer>
    </>
    // </Box>
  );
};

export default PersistentDrawerRight;
