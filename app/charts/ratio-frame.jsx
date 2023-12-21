const RatioFrame = ({ ratio, children }) => {
  return <div className={`flex flex-col gap-4 grow mx-auto ${ratio === 1080 ? 'max-w-lg' : ''}`}>{children}</div>;
};
export default RatioFrame;
