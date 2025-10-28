interface WrapPlaceholder {
  consumingProps?: any;
  key?: any;
  children?: React.ReactNode;
}

const WrapPlaceholder = ({ children }: WrapPlaceholder) => {
  return <>{children}</>;
};

export default WrapPlaceholder;
