import * as React from 'react';
import { Button } from '@mui/material';

// Create a component that takes a function, parameters for the function, and an icon as a parameter and creates a test button for the function
// The button should be a material ui button with the icon as the icon and the function as the onClick

const TestFunctionButton = ({
  onClick,
  icon,
}: {
  onClick: () => void;
  // icon is a JSX element
  icon: JSX.Element;
}) => <Button onClick={onClick}>{icon}</Button>;

export default TestFunctionButton;

// const TestFunctionButton = (props: {
//   function: () => void;
//   icon: JSX.Element;
// }) => {
//   <Button onClick={props.function} startIcon={props.icon}>
//     Test {props.function.name}
//   </Button>;
// };
