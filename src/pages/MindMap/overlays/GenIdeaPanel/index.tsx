import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Drawer,
  List,
  Divider,
  Fab,
  ListItemSecondaryAction,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  SettingsSuggest,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { SimulationNodeDatum } from 'd3-force';
import { GlobalHotKeys } from 'react-hotkeys';
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
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  //   const [realNode, setRealNode] = useState<node | null>(null);

  // create a state to store the value of the input
  const [input, setInput] = useState('');

  const [textCache, setTextCache] = useState<{
    [key: number]: string | undefined;
  }>({});
  const [datamuseCache, setDatamuseCache] = useState<{
    [key: number]: string[] | undefined;
  }>({});
  const [gpt3Cache, setGpt3Cache] = useState<{
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
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode]);

  // When the panel is opened, generate ideas for the selected node
  useEffect(() => {
    if (open) {
      generateIdeas(selectedNode.id, selectedNode.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleIdeaClick = (nodeID: number, idea: string) => {
    addNode({ parent: nodeID, text: idea });
  };

  const shortcutHandlers = {
    TOGGLE_SIDE_MENU: () => {
      if (open) {
        handleDrawerClose();
      } else {
        handleDrawerOpen();
      }
    },
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
    <div>
      <GlobalHotKeys handlers={shortcutHandlers} />
      <Fab
        variant="extended"
        sx={{
          right: 20,
          top: 20,
          position: 'fixed',
        }}
        onClick={handleDrawerOpen}
      >
        <ChevronLeft />
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
            <ChevronRight />
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
            {/* PART ONE */}
            {/* <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="settings">
                <SettingsSuggest />
              </IconButton>
            </ListItemSecondaryAction> */}
          </ListItem>
          {datamuseCache[selectedNode.id]?.map((idea) => (
            <ListItemButton
              key={idea}
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
              .map((value, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <ListItem key={value + index}>
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
            {/* PART ONE */}
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="settings">
                <SettingsSuggest />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {gpt3Cache[selectedNode.id]?.map((idea) => (
            <ListItemButton
              key={idea}
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
          {gpt3Cache[selectedNode.id] === undefined &&
            Array(3)
              .fill(0)
              .map((value, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <ListItem key={index}>
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
      </Drawer>
    </div>
    // </Box>
  );
};

export default PersistentDrawerRight;
