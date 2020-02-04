/**
 * Global types
 */
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

export interface Props {
  children?: JSX.Element[] | JSX.Element | React.ReactNode;
  className?: string;
}

export interface RoutedProps extends Props, RouteComponentProps {}
