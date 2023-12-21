const RatioFrame = ({ ratio, children }) => {
  return (
    <div className={`flex flex-col gap-4 grow mx-auto w-full lg:w-auto ${ratio === 1080 ? 'max-w-lg' : 'max-w-4xl'}`}>
      {children}
    </div>
  );
};
export default RatioFrame;
