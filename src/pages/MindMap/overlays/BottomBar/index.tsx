import React, { useEffect, useRef, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Fab,
  alpha,
  InputBase,
  Menu,
  MenuItem,
} from '@mui/material';
import { Add, Download, Help, MyLocation } from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { SimulationNodeDatum } from 'd3-force';
import { useFirestore } from '../../../../firebase';
import { MindMap, node, WithID } from '../../../../types';
import { normalizeNodes } from '../../../../nodeOps';
import {
  buildSvgExport,
  downloadBlob,
  mindMapToMarkdown,
  sanitizeFilename,
  svgToPngBlob,
} from '../../export';
import KeyBindsDialog from './KeyBindsDialog';

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

const Search = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  // backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const screenWidth = window.innerWidth;

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 1),
    transition: theme.transitions.create('width'),
    width: '100%',
    textOverflow: 'ellipsis',
    [theme.breakpoints.up('md')]: {
      width: screenWidth * 0.3,
    },
  },
}));

const BottomBar = ({
  data,
  handleAddNode,
  selectedNode,
  resetCanvas,
  getSvgElement,
}: {
  data: WithID<MindMap>;
  handleAddNode: (parentNode: SimulationNodeDatum & node) => void;
  selectedNode: SimulationNodeDatum & node;
  resetCanvas: () => void;
  getSvgElement: () => SVGSVGElement | null;
}) => {
  const [isKeyBindsDialogOpen, setIsKeyBindsDialogOpen] = useState(false);
  const [title, setTitle] = useState<string>(data.title ?? 'Untitled MindMap');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const firestore = useFirestore();
  const theme = useTheme();

  const titleRef = useRef(title);
  titleRef.current = title;

  const dataTitleRef = useRef(data.title);
  dataTitleRef.current = data.title;

  const updateTitle = (newTitle: string) => {
    const newData: Partial<MindMap> = {
      title: newTitle,
    };
    updateDoc(doc(firestore, `mindmaps/${data.ID}`), newData)
      .then()
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    setTimeout(() => {
      if (
        title === titleRef.current &&
        titleRef.current !== dataTitleRef.current
      ) {
        updateTitle(titleRef.current);
      }
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handleExport = (format: 'png' | 'svg' | 'markdown') => {
    setExportMenuAnchor(null);
    const mapTitle = data.title || 'Untitled MindMap';
    const filename = sanitizeFilename(mapTitle);
    if (format === 'markdown') {
      const markdown = mindMapToMarkdown(normalizeNodes(data.nodes), mapTitle);
      downloadBlob(
        new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
        `${filename}.md`,
      );
      return;
    }
    const svgElement = getSvgElement();
    if (!svgElement) return;
    const { svgString, width, height } = buildSvgExport(
      svgElement,
      theme.palette.background.default,
    );
    if (format === 'svg') {
      downloadBlob(
        new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }),
        `${filename}.svg`,
      );
      return;
    }
    svgToPngBlob(svgString, width, height)
      .then((blob) => downloadBlob(blob, `${filename}.png`))
      .catch((error) => console.error('PNG export failed', error));
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ top: 'auto', bottom: 0, zIndex: 1300, transform: 'none' }}
    >
      <Toolbar>
        <KeyBindsDialog
          open={isKeyBindsDialogOpen}
          handleClose={() => setIsKeyBindsDialogOpen(false)}
        />
        <IconButton
          color="inherit"
          onClick={() => setIsKeyBindsDialogOpen(true)}
        >
          <Help />
        </IconButton>
        <Search
          onSubmit={(e) => {
            e.preventDefault();
            updateTitle(title);
          }}
        >
          <StyledInputBase
            placeholder="Untitled MindMap"
            slotProps={{ input: { 'aria-label': 'title' } }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              textOverflow: 'ellipsis',
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            onBlur={() => {
              setTitle(title || 'Untitled MindMap');
            }}
          />
        </Search>
        <StyledFab
          color="secondary"
          aria-label="add node"
          onClick={() => handleAddNode(selectedNode)}
        >
          <Add />
        </StyledFab>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          color="inherit"
          aria-label="export mindmap"
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
        >
          <Download />
        </IconButton>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleExport('png')}>Export as PNG</MenuItem>
          <MenuItem onClick={() => handleExport('svg')}>Export as SVG</MenuItem>
          <MenuItem onClick={() => handleExport('markdown')}>
            Export as Markdown outline
          </MenuItem>
        </Menu>
        <IconButton color="inherit" onClick={resetCanvas}>
          <MyLocation />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
export default BottomBar;
